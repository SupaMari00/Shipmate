require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const GitHubStrategy = require("passport-github2").Strategy
const { OAuth2Client } = require('google-auth-library')
const db = require("better-sqlite3")("users.db")
const path = require("path")
db.pragma("journal_mode = WAL")

const createTables = db.transaction(() => {
    db.prepare(
        `CREATE TABLE IF NOT EXISTS users 
        ( id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT UNIQUE,
          password_hash TEXT,
          role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin', 'staff')),
          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'blocked')),
          oauth_provider TEXT CHECK(oauth_provider IN ('google', 'github', NULL)),
          oauth_id TEXT UNIQUE,
          oauth_email TEXT,
          profile_picture TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ` 
    ).run()

    db.prepare(
    `CREATE TABLE IF NOT EXISTS addresses 
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    label TEXT,
    recipient_name TEXT NOT NULL,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state_province TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    phone TEXT,
    is_default BOOLEAN DEFAULT 0,
    address_type TEXT CHECK(address_type IN ('home', 'office', 'warehouse', 'other')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
    ).run()

    db.prepare(
    `CREATE TABLE IF NOT EXISTS orders 
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_reference TEXT UNIQUE,
    item_description TEXT,
    weight REAL,
    price REAL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    `).run()

    db.prepare(
    `
    CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    tracking_number TEXT UNIQUE,

    sender_address_id INTEGER,
    receiver_address_id INTEGER,
    sender_name TEXT,
    receiver_name TEXT,
    receiver_phone TEXT,
    origin TEXT,
    destination TEXT,
    cargo_description TEXT,
    weight REAL,
    shipping_type TEXT,
    priority TEXT,

    current_status TEXT DEFAULT 'pending' CHECK(current_status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed')),

    estimated_delivery DATE,
    shipped_at DATETIME,
    delivered_at DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_address_id) REFERENCES addresses(id) ON DELETE SET NULL
    )`
    ).run()

    db.prepare(
    `CREATE TABLE IF NOT EXISTS tracking_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_id INTEGER NOT NULL,
    status TEXT,
    location TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
    )`
    ).run()

    db.prepare(
    `CREATE TABLE IF NOT EXISTS quotes
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cargo_type TEXT NOT NULL CHECK(cargo_type IN ('fcl', 'lcl', 'air', 'vehicles', 'bulk')),
    weight REAL NOT NULL,
    dimensions TEXT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'viewed', 'quoted', 'accepted', 'rejected')),
    estimated_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
    ).run()

    db.prepare(
    `CREATE TABLE IF NOT EXISTS carriers
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    available_cargo_types TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
    ).run()

    db.prepare(
    `CREATE TABLE IF NOT EXISTS shipping_methods
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
    carrier_id INTEGER NOT NULL,
    method_name TEXT NOT NULL,
    cargo_type TEXT NOT NULL CHECK(cargo_type IN ('fcl', 'lcl', 'air', 'vehicles', 'bulk')),
    base_price REAL,
    price_per_kg REAL,
    estimated_days INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (carrier_id) REFERENCES carriers(id) ON DELETE CASCADE
    )`
    ).run()
})

createTables();

const applyShipmentSchemaUpdates = () => {
    const columns = db.prepare("PRAGMA table_info(shipments)").all().map((col) => col.name)
    const extraColumns = [
        { name: 'sender_address_id', sql: 'ALTER TABLE shipments ADD COLUMN sender_address_id INTEGER' },
        { name: 'receiver_address_id', sql: 'ALTER TABLE shipments ADD COLUMN receiver_address_id INTEGER' },
        { name: 'sender_name', sql: 'ALTER TABLE shipments ADD COLUMN sender_name TEXT' },
        { name: 'origin', sql: 'ALTER TABLE shipments ADD COLUMN origin TEXT' },
        { name: 'destination', sql: 'ALTER TABLE shipments ADD COLUMN destination TEXT' },
        { name: 'cargo_description', sql: 'ALTER TABLE shipments ADD COLUMN cargo_description TEXT' },
        { name: 'weight', sql: 'ALTER TABLE shipments ADD COLUMN weight REAL' },
        { name: 'shipping_type', sql: 'ALTER TABLE shipments ADD COLUMN shipping_type TEXT' },
        { name: 'priority', sql: 'ALTER TABLE shipments ADD COLUMN priority TEXT' },
    ]

    for (const column of extraColumns) {
        if (!columns.includes(column.name)) {
            try {
                db.prepare(column.sql).run()
            } catch (err) {
                console.error(`Unable to update shipments schema: ${column.name}`, err)
            }
        }
    }
}

applyShipmentSchemaUpdates();

const applyOAuthSchemaUpdates = () => {
    const columns = db.prepare("PRAGMA table_info(users)").all().map((col) => col.name)
    const extraColumns = [
        { name: 'oauth_provider', sql: 'ALTER TABLE users ADD COLUMN oauth_provider TEXT' },
        { name: 'oauth_id', sql: 'ALTER TABLE users ADD COLUMN oauth_id TEXT' },
        { name: 'oauth_email', sql: 'ALTER TABLE users ADD COLUMN oauth_email TEXT' },
        { name: 'profile_picture', sql: 'ALTER TABLE users ADD COLUMN profile_picture TEXT' },
    ]

    for (const column of extraColumns) {
        if (!columns.includes(column.name)) {
            try {
                db.prepare(column.sql).run()
                console.log(`Added missing column: ${column.name}`)
            } catch (err) {
                console.error(`Unable to update users schema: ${column.name}`, err)
            }
        }
    }

    // Add unique index for oauth_id if it doesn't exist
    try {
        const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='users'").all().map(idx => idx.name)
        if (!indexes.includes('users_oauth_id_unique')) {
            db.prepare("CREATE UNIQUE INDEX users_oauth_id_unique ON users(oauth_id)").run()
            console.log('Added unique index for oauth_id')
        }
    } catch (err) {
        console.error('Unable to create unique index for oauth_id:', err)
    }
}

applyOAuthSchemaUpdates();

const applyPasswordHashNullable = () => {
    try {
        // Check if password_hash allows NULL by trying to update a non-existent user
        // If it fails with NOT NULL constraint, we need to recreate the column
        const columns = db.prepare("PRAGMA table_info(users)").all()
        const passwordHashCol = columns.find(col => col.name === 'password_hash')
        
        if (passwordHashCol && passwordHashCol.notnull === 1) {
            console.log('Making password_hash nullable for OAuth users...')
            
            // SQLite doesn't support dropping NOT NULL directly, so we need to recreate the table
            // First, backup existing data
            const users = db.prepare("SELECT * FROM users").all()
            
            // Drop and recreate table with nullable password_hash
            db.prepare("DROP TABLE users").run()
            
            db.prepare(
                `CREATE TABLE users 
                ( id INTEGER PRIMARY KEY AUTOINCREMENT,
                  full_name TEXT NOT NULL,
                  email TEXT NOT NULL UNIQUE,
                  phone TEXT UNIQUE,
                  password_hash TEXT,
                  role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin', 'staff')),
                  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'blocked')),
                  oauth_provider TEXT CHECK(oauth_provider IN ('google', 'github', NULL)),
                  oauth_id TEXT UNIQUE,
                  oauth_email TEXT,
                  profile_picture TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`
            ).run()
            
            // Restore data
            const insertStmt = db.prepare(
                `INSERT INTO users (id, full_name, email, phone, password_hash, role, status, oauth_provider, oauth_id, oauth_email, profile_picture, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            
            for (const user of users) {
                insertStmt.run(
                    user.id, user.full_name, user.email, user.phone, user.password_hash, 
                    user.role || 'customer', user.status || 'active', user.oauth_provider, 
                    user.oauth_id, user.oauth_email, user.profile_picture, user.created_at
                )
            }
            
            console.log('Successfully made password_hash nullable and restored user data')
        }
    } catch (err) {
        console.error('Error making password_hash nullable:', err)
    }
}

applyPasswordHashNullable();

// PASSPORT CONFIGURATION
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    try {
        const stmt = db.prepare("SELECT id, full_name, email, phone, role, oauth_provider, profile_picture FROM users WHERE id = ?")
        const user = stmt.get(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
const githubClientId = process.env.GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET
const githubCallbackURL = process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/auth/github/callback"

if (googleClientId && googleClientSecret) {
    passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL,
    }, (accessToken, refreshToken, profile, done) => {
        try {
            const { id, displayName, emails, photos } = profile
            const email = emails[0]?.value
            const profilePicture = photos[0]?.value

            let stmt = db.prepare("SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = 'google'")
            let user = stmt.get(id)

            if (!user) {
                stmt = db.prepare("SELECT * FROM users WHERE email = ?")
                user = stmt.get(email)

                if (user) {
                    const updateStmt = db.prepare("UPDATE users SET oauth_provider = 'google', oauth_id = ?, oauth_email = ?, profile_picture = ? WHERE id = ?")
                    updateStmt.run(id, email, profilePicture, user.id)
                } else {
                    const insertStmt = db.prepare("INSERT INTO users (full_name, email, oauth_provider, oauth_id, oauth_email, profile_picture, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    const result = insertStmt.run(displayName, email, 'google', id, email, profilePicture, 'customer', 'active', new Date().toISOString())
                    stmt = db.prepare("SELECT id, full_name, email, phone, role, oauth_provider, profile_picture FROM users WHERE id = ?")
                    user = stmt.get(result.lastInsertRowid)
                }
            }

            return done(null, user)
        } catch (err) {
            return done(err, null)
        }
    }))
} else {
    console.warn('Google OAuth disabled: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are not configured.')
}

if (githubClientId && githubClientSecret) {
    passport.use(new GitHubStrategy({
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: githubCallbackURL,
    }, (accessToken, refreshToken, profile, done) => {
        try {
            const { id, displayName, emails, avatar_url } = profile
            const email = emails[0]?.value

            let stmt = db.prepare("SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = 'github'")
            let user = stmt.get(id)

            if (!user) {
                stmt = db.prepare("SELECT * FROM users WHERE email = ?")
                user = stmt.get(email)

                if (user) {
                    const updateStmt = db.prepare("UPDATE users SET oauth_provider = 'github', oauth_id = ?, oauth_email = ?, profile_picture = ? WHERE id = ?")
                    updateStmt.run(id, email, avatar_url, user.id)
                } else {
                    const insertStmt = db.prepare("INSERT INTO users (full_name, email, oauth_provider, oauth_id, oauth_email, profile_picture, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    const result = insertStmt.run(displayName, email, 'github', id, email, avatar_url, 'customer', 'active', new Date().toISOString())
                    stmt = db.prepare("SELECT id, full_name, email, phone, role, oauth_provider, profile_picture FROM users WHERE id = ?")
                    user = stmt.get(result.lastInsertRowid)
                }
            }

            return done(null, user)
        } catch (err) {
            return done(err, null)
        }
    }))
} else {
    console.warn('GitHub OAuth disabled: GITHUB_CLIENT_ID and/or GITHUB_CLIENT_SECRET are not configured.')
}

const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null

const app = express()
app.use(express.json())

// SESSION CONFIGURATION
app.use(session({
    secret: process.env.SESSION_SECRET || 'shipmate-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}))

// PASSPORT INITIALIZATION
app.use(passport.initialize())
app.use(passport.session())

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS policy: Origin not allowed'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "../Frontend")))


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

app.get("/api/user", (req,res) => {
    const token = req.cookies?.shipmate
    if(!token) return res.status(401).json({error: "Unauthorized"})

    try {
        const decoded = jwt.verify(token, "supersecretkey")
        const lookupStatement = db.prepare("SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?")
        const ourUser = lookupStatement.get(decoded.userid)
        if(!ourUser) return res.status(401).json({error: "Unauthorized"})
        res.status(200).json({user: ourUser})
    } catch (err) {
        return res.status(401).json({error: "Unauthorized"})
    }
})

app.post("/api/login", (req,res) => {
    if(typeof req.body.email !== "string") req.body.email = ""
    if(typeof req.body.password !== "string") req.body.password = ""    
    req.body.email = req.body.email.trim().toLowerCase()

    const lookupStatement = db.prepare("SELECT * FROM users WHERE email = ?")
    const ourUser = lookupStatement.get(req.body.email)
    if(!ourUser) return res.status(400).json({error: "Invalid email or password"})
    
    // Check if user has OAuth login (no password)
    if (ourUser.oauth_provider) {
        return res.status(400).json({error: "This account uses OAuth login. Please use the appropriate OAuth provider."})
    }
    
    // Check if user has a password (regular signup users)
    if (!ourUser.password_hash) {
        return res.status(400).json({error: "Invalid email or password"})
    }
    
    if(!bcrypt.compareSync(req.body.password, ourUser.password_hash)) return res.status(400).json({error: "Invalid email or password"})

    const ourToken = jwt.sign({userid: ourUser.id}, "supersecretkey", {expiresIn: "1d"})        
    const cookieConfig = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    }
    res.cookie("shipmate", ourToken, cookieConfig)
    const safeUser = { id: ourUser.id, full_name: ourUser.full_name, email: ourUser.email, phone: ourUser.phone, role: ourUser.role }
    res.status(200).json({message: "Login successful!", user: safeUser})
})

app.post("/api/logout", (req,res) => {
    res.clearCookie("shipmate", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod',
        sameSite: 'lax'
    })
    res.status(200).json({message: "Logout successful!"})
})

// OAUTH ROUTES
// Google OAuth
app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
)

app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        const ourToken = jwt.sign({ userid: req.user.id }, "supersecretkey", { expiresIn: "1d" })
        const cookieConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        }
        res.cookie("shipmate", ourToken, cookieConfig)
        const safeUser = { id: req.user.id, full_name: req.user.full_name, email: req.user.email, phone: req.user.phone, role: req.user.role, profile_picture: req.user.profile_picture }
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?auth=success&user=${encodeURIComponent(JSON.stringify(safeUser))}`)
    }
)

// Google Login with JWT
app.post("/api/auth/google-login", async (req, res) => {
    if (!googleClient) {
        console.error("Google client not initialized - missing GOOGLE_CLIENT_ID env var")
        return res.status(500).json({ error: "Google login is not configured" })
    }

    try {
        const { credential } = req.body
        if (!credential) {
            console.error("No credential provided in request body")
            return res.status(400).json({ error: "Credential is required" })
        }

        console.log("Verifying Google token with clientId:", googleClientId)
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        })
        const payload = ticket.getPayload()
        const { sub: googleId, name: displayName, email, picture: profilePicture } = payload

        if (!email) {
            console.error("Email not found in Google token payload")
            return res.status(400).json({ error: "Email is required from Google account" })
        }

        // Check if user exists
        let stmt = db.prepare("SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = 'google'")
        let user = stmt.get(googleId)
        let isNewUser = false

        if (!user) {
            // Check if email exists with different provider
            stmt = db.prepare("SELECT * FROM users WHERE email = ?")
            const existingUser = stmt.get(email)
            if (existingUser) {
                // Link Google account
                const updateStmt = db.prepare("UPDATE users SET oauth_provider = 'google', oauth_id = ?, oauth_email = ?, profile_picture = ? WHERE id = ?")
                updateStmt.run(googleId, email, profilePicture, existingUser.id)
                user = { ...existingUser, oauth_provider: 'google', oauth_id: googleId, oauth_email: email, profile_picture: profilePicture }
                console.log("Linked Google account to existing user:", email)
            } else {
                // Create new user
                const insertStmt = db.prepare("INSERT INTO users (full_name, email, oauth_provider, oauth_id, oauth_email, profile_picture, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                const result = insertStmt.run(displayName, email, 'google', googleId, email, profilePicture, 'customer', 'active', new Date().toISOString())
                stmt = db.prepare("SELECT id, full_name, email, phone, role, oauth_provider, profile_picture FROM users WHERE id = ?")
                user = stmt.get(result.lastInsertRowid)
                isNewUser = true
                console.log("Created new Google user:", email)
            }
        }

        // Create JWT and set cookie
        const ourToken = jwt.sign({ userid: user.id }, "supersecretkey", { expiresIn: "1d" })
        const cookieConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        }
        res.cookie("shipmate", ourToken, cookieConfig)
        const safeUser = { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role, profile_picture: user.profile_picture }
        res.status(200).json({ message: "Google login successful", user: safeUser, isNewUser })
    } catch (error) {
        console.error("Google login error details:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        })
        res.status(500).json({ error: error.message || "Google login failed" })
    }
})

// GitHub OAuth
app.get("/api/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
)

app.get("/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
        const ourToken = jwt.sign({ userid: req.user.id }, "supersecretkey", { expiresIn: "1d" })
        const cookieConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        }
        res.cookie("shipmate", ourToken, cookieConfig)
        const safeUser = { id: req.user.id, full_name: req.user.full_name, email: req.user.email, phone: req.user.phone, role: req.user.role, profile_picture: req.user.profile_picture }
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?auth=success&user=${encodeURIComponent(JSON.stringify(safeUser))}`)
    }
)

app.post("/api/signup", (req,res)=> {
    const errors = []

    if(typeof req.body.full_name !== "string") req.body.full_name = ""
    if(typeof req.body.email !== "string") req.body.email = ""
    if(typeof req.body.phone !== "string") req.body.phone = ""
    if(typeof req.body.password !== "string") req.body.password = ""

    req.body.full_name = req.body.full_name.trim()
    req.body.email = req.body.email.trim().toLowerCase()
    req.body.phone = req.body.phone.trim()

    if(!req.body.full_name) errors.push("You must provide a full name!");
    if(req.body.full_name && req.body.full_name.length < 5) errors.push("Full name must be at least 5 characters");
    if(req.body.full_name && req.body.full_name.length > 50) errors.push("Full name cannot exceed 50 characters");
    if(req.body.full_name && !req.body.full_name.match(/^[a-zA-Z0-9 ]+$/)) errors.push("Full name can only contain letters, numbers, and spaces");

    if(!req.body.email) errors.push("You must provide an email!");
    if(req.body.email && !req.body.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errors.push("You must provide a valid email address");

    if(!req.body.password) errors.push("You must provide a password!");
    if(req.body.password && req.body.password.length < 8) errors.push("Password must be at least 8 characters");
    if(req.body.password && req.body.password.length > 20) errors.push("Password cannot exceed 20 characters");

    // Phone is now optional
    // if(!req.body.phone) errors.push("You must provide a phone number!");

    if(errors.length){
        return res.status(400).json({errors})
    }

    try {
        const passwordHash = bcrypt.hashSync(req.body.password, 10)
        const ourstatement = db.prepare("INSERT INTO users (full_name, email, phone, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        const result = ourstatement.run(req.body.full_name, req.body.email, req.body.phone || null, passwordHash, "customer", "active", new Date().toISOString())

        const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID= ?")
        const ourUser = lookupStatement.get(result.lastInsertRowid)

        const ourToken = jwt.sign({userid: ourUser.id}, "supersecretkey", {expiresIn: "1d"})
        const cookieConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24,
        }

        res.cookie("shipmate", ourToken, cookieConfig)
        const safeUser = { id: ourUser.id, full_name: ourUser.full_name, email: ourUser.email, phone: ourUser.phone, role: ourUser.role }
        res.status(200).json({message: "Signup successful!", user: safeUser})
    } catch (err) {
        console.error('Signup error:', err)
        if (err && err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({error: 'A user with that email or phone already exists.'})
        }
        res.status(500).json({error: 'Internal server error'})
    }
})



const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'

const authenticate = (req, res, next) => {
    const token = req.cookies?.shipmate
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const stmt = db.prepare("SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?")
        const user = stmt.get(decoded.userid)
        if (!user) return res.status(401).json({ error: "Unauthorized" })
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" })
    }
}

app.post('/api/shipments', authenticate, (req, res) => {
    const {
        sender_name,
        receiver_name,
        receiver_phone,
        origin,
        destination,
        cargo_description,
        weight,
        shipping_type,
        priority,
    } = req.body

    const errors = []
    if (!sender_name || typeof sender_name !== 'string') errors.push('Sender name is required')
    if (!receiver_name || typeof receiver_name !== 'string') errors.push('Receiver name is required')
    if (!origin || typeof origin !== 'string') errors.push('Origin country is required')
    if (!destination || typeof destination !== 'string') errors.push('Destination country is required')
    if (!cargo_description || typeof cargo_description !== 'string') errors.push('Cargo description is required')
    if (!weight || isNaN(Number(weight))) errors.push('Weight must be a valid number')
    if (!shipping_type || typeof shipping_type !== 'string') errors.push('Shipping type is required')
    if (!priority || typeof priority !== 'string') errors.push('Priority is required')

    if (errors.length) {
        return res.status(400).json({ errors })
    }

    try {
        const orderReference = `SM-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`
        const orderStmt = db.prepare("INSERT INTO orders (user_id, order_reference, item_description, weight, price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        const orderResult = orderStmt.run(
            req.user.id,
            orderReference,
            cargo_description,
            Number(weight),
            null,
            'pending',
            new Date().toISOString(),
        )

        const trackingNumber = `SM${Date.now()}${Math.floor(Math.random() * 9000) + 1000}`
        const shipmentStmt = db.prepare(`INSERT INTO shipments (order_id, tracking_number, sender_address_id, receiver_address_id, sender_name, receiver_name, receiver_phone, origin, destination, cargo_description, weight, shipping_type, priority, current_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        const shipmentResult = shipmentStmt.run(
            orderResult.lastInsertRowid,
            trackingNumber,
            null,
            null,
            sender_name,
            receiver_name,
            receiver_phone || null,
            origin,
            destination,
            cargo_description,
            Number(weight),
            shipping_type,
            priority,
            'pending',
            new Date().toISOString(),
        )

        const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(shipmentResult.lastInsertRowid)
        res.status(201).json({ message: 'Shipment created successfully', shipment })
    } catch (err) {
        console.error('Create shipment error:', err)
        res.status(500).json({ error: 'Failed to create shipment' })
    }
})

app.get('/api/shipments', authenticate, (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT s.id, s.tracking_number, s.sender_name, s.receiver_name, s.receiver_phone, 
                   s.origin, s.destination, s.cargo_description, s.weight, s.shipping_type, 
                   s.priority, s.current_status, s.estimated_delivery, s.shipped_at, s.delivered_at, 
                   s.created_at, o.order_reference
            FROM shipments s
            JOIN orders o ON s.order_id = o.id
            WHERE o.user_id = ?
            ORDER BY s.created_at DESC
        `)
        const shipments = stmt.all(req.user.id)
        res.status(200).json({ shipments })
    } catch (err) {
        console.error('Fetch shipments error:', err)
        res.status(500).json({ error: 'Failed to retrieve shipments' })
    }
})

const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" })
    }
    next()
}

app.get('/api/admin/dashboard', authenticate, requireAdmin, (req, res) => {
    try {
        const totalShipments = db.prepare('SELECT COUNT(*) AS count FROM shipments').get().count
        const activeUsers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE status = 'active'").get().count
        const revenueRow = db.prepare('SELECT SUM(price) AS total FROM orders WHERE price IS NOT NULL').get()
        const revenue = revenueRow?.total || 0

        const recentShipments = db.prepare(`
            SELECT s.tracking_number, u.full_name AS customer_name, s.current_status, s.destination, s.origin,
                   s.estimated_delivery, s.created_at
            FROM shipments s
            JOIN orders o ON s.order_id = o.id
            JOIN users u ON o.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT 5
        `).all()

        res.status(200).json({ totalShipments, activeUsers, revenue, recentShipments })
    } catch (err) {
        console.error('Fetch admin dashboard error:', err)
        res.status(500).json({ error: 'Failed to retrieve admin dashboard data' })
    }
})

app.get('/api/admin/shipments', authenticate, requireAdmin, (req, res) => {
    try {
        const shipments = db.prepare(`
            SELECT s.id, s.tracking_number, s.current_status, s.origin, s.destination, s.weight, s.shipping_type, s.priority, s.created_at,
                   u.full_name AS customer_name, u.email AS customer_email
            FROM shipments s
            JOIN orders o ON s.order_id = o.id
            JOIN users u ON o.user_id = u.id
            ORDER BY s.created_at DESC
        `).all()

        res.status(200).json({ shipments })
    } catch (err) {
        console.error('Fetch admin shipments error:', err)
        res.status(500).json({ error: 'Failed to retrieve admin shipments' })
    }
})

app.get('/api/admin/analytics', authenticate, requireAdmin, (req, res) => {
    try {
        const shipmentsByStatus = db.prepare('SELECT current_status AS status, COUNT(*) AS count FROM shipments GROUP BY current_status').all()
        const usersByRole = db.prepare('SELECT role, COUNT(*) AS count FROM users GROUP BY role').all()
        const totalOrders = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count
        const recentShipments = db.prepare(`
            SELECT s.tracking_number, u.full_name AS customer_name, s.current_status, s.destination, s.created_at
            FROM shipments s
            JOIN orders o ON s.order_id = o.id
            JOIN users u ON o.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT 5
        `).all()

        res.status(200).json({ shipmentsByStatus, usersByRole, totalOrders, recentShipments })
    } catch (err) {
        console.error('Fetch admin analytics error:', err)
        res.status(500).json({ error: 'Failed to retrieve admin analytics' })
    }
})


// TEMPORARY ADMIN SETUP ENDPOINT - REMOVE AFTER FIRST USE
app.post("/api/setup-admin", (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ error: "Email is required" })
    }

    try {
        const stmt = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?")
        const result = stmt.run(email)

        if (result.changes === 0) {
            return res.status(404).json({ error: "User not found with that email" })
        }

        res.status(200).json({ message: "User promoted to admin successfully" })
    } catch (err) {
        console.error('Setup admin error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.get("/api/users", authenticate, requireAdmin, (req, res) => {
    const stmt = db.prepare("SELECT id, full_name, email, phone, role, status FROM users ORDER BY created_at DESC")
    const users = stmt.all()
    res.status(200).json({ users })
})

app.get("/api/users/:id", authenticate, requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id, 10)
    if (Number.isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user id" })
    }
    const stmt = db.prepare("SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?")
    const user = stmt.get(userId)
    if (!user) {
        return res.status(404).json({ error: "User not found" })
    }
    res.status(200).json({ user })
})

app.put("/api/users/:id/role", authenticate, requireAdmin, (req, res) => {
    const { role } = req.body
    const userId = parseInt(req.params.id, 10)
    const allowedRoles = ["customer", "staff", "admin"]

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" })
    }

    if (req.user.id === userId && role !== "admin") {
        return res.status(400).json({ error: "Admins cannot remove their own admin access" })
    }

    const updateStmt = db.prepare("UPDATE users SET role = ? WHERE id = ?")
    const result = updateStmt.run(role, userId)

    if (result.changes === 0) {
        return res.status(404).json({ error: "User not found" })
    }

    const stmt = db.prepare("SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?")
    const updatedUser = stmt.get(userId)
    res.status(200).json({ user: updatedUser })
})

app.put("/api/users/:id/status", authenticate, requireAdmin, (req, res) => {
    const { status } = req.body
    const userId = parseInt(req.params.id, 10)
    const allowedStatuses = ["active", "inactive", "blocked"]

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" })
    }

    if (req.user.id === userId && status !== "active") {
        return res.status(400).json({ error: "Admins cannot change their own status to inactive or blocked" })
    }

    const updateStmt = db.prepare("UPDATE users SET status = ? WHERE id = ?")
    const result = updateStmt.run(status, userId)

    if (result.changes === 0) {
        return res.status(404).json({ error: "User not found" })
    }

    const stmt = db.prepare("SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?")
    const updatedUser = stmt.get(userId)
    res.status(200).json({ user: updatedUser })
})

// ADDRESSES ENDPOINTS
app.get("/api/addresses", (req, res) => {
    const token = req.cookies?.shipmate
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
        const decoded = jwt.verify(token, "supersecretkey")
        const stmt = db.prepare("SELECT id, label, recipient_name, street_address, city, state_province, postal_code, country, phone, is_default, address_type, created_at FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC")
        const addresses = stmt.all(decoded.userid)
        res.status(200).json({ addresses })
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" })
    }
})

app.post("/api/addresses", (req, res) => {
    const token = req.cookies?.shipmate
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
        const decoded = jwt.verify(token, "supersecretkey")
        const { label, recipient_name, street_address, city, state_province, postal_code, country, phone, address_type } = req.body

        if (!recipient_name || !street_address || !city || !country) {
            return res.status(400).json({ error: "Missing required fields" })
        }

        const stmt = db.prepare("INSERT INTO addresses (user_id, label, recipient_name, street_address, city, state_province, postal_code, country, phone, address_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        const result = stmt.run(decoded.userid, label || null, recipient_name, street_address, city, state_province || null, postal_code || null, country, phone || null, address_type || 'other', new Date().toISOString(), new Date().toISOString())

        res.status(201).json({ id: result.lastInsertRowid, message: "Address created successfully" })
    } catch (err) {
        console.error('Create address error:', err)
        return res.status(401).json({ error: "Unauthorized" })
    }
})

app.put("/api/addresses/:id", (req, res) => {
    const token = req.cookies?.shipmate
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
        const decoded = jwt.verify(token, "supersecretkey")
        const { label, recipient_name, street_address, city, state_province, postal_code, country, phone, address_type, is_default } = req.body

        const stmt = db.prepare("UPDATE addresses SET label = ?, recipient_name = ?, street_address = ?, city = ?, state_province = ?, postal_code = ?, country = ?, phone = ?, address_type = ?, is_default = ?, updated_at = ? WHERE id = ? AND user_id = ?")
        stmt.run(label || null, recipient_name, street_address, city, state_province || null, postal_code || null, country, phone || null, address_type || 'other', is_default ? 1 : 0, new Date().toISOString(), req.params.id, decoded.userid)

        res.status(200).json({ message: "Address updated successfully" })
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" })
    }
})

app.delete("/api/addresses/:id", (req, res) => {
    const token = req.cookies?.shipmate
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
        const decoded = jwt.verify(token, "supersecretkey")
        const stmt = db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?")
        stmt.run(req.params.id, decoded.userid)

        res.status(200).json({ message: "Address deleted successfully" })
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" })
    }
})

// QUOTES ENDPOINTS
app.get("/api/quotes", authenticate, (req, res) => {
    try {
        const stmt = db.prepare("SELECT id, cargo_type, weight, dimensions, origin, destination, notes, status, estimated_price, created_at, expires_at FROM quotes WHERE user_id = ? ORDER BY created_at DESC")
        const quotes = stmt.all(req.user.id)
        res.status(200).json({ quotes })
    } catch (err) {
        console.error('Fetch quotes error:', err)
        return res.status(500).json({ error: "Failed to retrieve quotes" })
    }
})

const calculateQuotePrice = (cargoType, weight, dimensions) => {
    const baseRates = {
        fcl: 150,
        lcl: 130,
        air: 6,
        vehicles: 280,
        bulk: 95,
    }

    const weightValue = Number(weight) || 0
    const rate = baseRates[cargoType] || 120
    let price = weightValue * rate

    if (dimensions && typeof dimensions === 'string') {
        const dims = dimensions.split(/[×xX,\s]+/).map((value) => Number(value)).filter((value) => !Number.isNaN(value))
        if (dims.length === 3) {
            const volume = dims[0] * dims[1] * dims[2] / 5000
            price += volume * 3
        }
    }

    return Number(Math.max(price, 100).toFixed(2))
}

app.post("/api/quotes", authenticate, (req, res) => {
    try {
        const { cargo_type, weight, dimensions, origin, destination, notes } = req.body
        const allowedTypes = ['fcl', 'lcl', 'air', 'vehicles', 'bulk']
        const weightValue = Number(weight)

        if (!cargo_type || !allowedTypes.includes(cargo_type)) {
            return res.status(400).json({ error: "Invalid cargo type" })
        }
        if (Number.isNaN(weightValue) || weightValue <= 0) {
            return res.status(400).json({ error: "Weight must be a positive number" })
        }
        if (!origin || !origin.trim() || !destination || !destination.trim()) {
            return res.status(400).json({ error: "Origin and destination are required" })
        }

        const estimatedPrice = calculateQuotePrice(cargo_type, weightValue, dimensions)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const stmt = db.prepare("INSERT INTO quotes (user_id, cargo_type, weight, dimensions, origin, destination, notes, status, estimated_price, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        const result = stmt.run(req.user.id, cargo_type, weightValue, dimensions || null, origin.trim(), destination.trim(), notes || null, 'pending', estimatedPrice, new Date().toISOString(), expiresAt)

        const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(result.lastInsertRowid)
        res.status(201).json({ quote, message: "Quote request submitted successfully" })
    } catch (err) {
        console.error('Create quote error:', err)
        return res.status(500).json({ error: "Failed to create quote" })
    }
})

app.get("/api/quotes/:id", authenticate, (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM quotes WHERE id = ? AND user_id = ?")
        const quote = stmt.get(req.params.id, req.user.id)

        if (!quote) {
            return res.status(404).json({ error: "Quote not found" })
        }

        res.status(200).json({ quote })
    } catch (err) {
        console.error('Fetch quote error:', err)
        return res.status(500).json({ error: "Failed to retrieve quote" })
    }
})

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({error: 'Internal server error'})
})

app.listen(3000, () => {
    console.log("server started at port 3000")
})