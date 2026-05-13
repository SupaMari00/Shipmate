# Running ShipMate Frontend & Backend

## Backend Setup
1. Navigate to Backend folder: `cd Backend`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
   - Backend will run on http://localhost:3000

## Frontend Setup
1. Navigate to Frontend/shipmate folder: `cd Frontend/shipmate`
2. Install dependencies: `npm install` (already done)
3. Start the dev server: `npm run dev`
   - Frontend will run on http://localhost:5173 or http://localhost:5174

## Connection Details
- Frontend API URL: http://localhost:3000 (configured in .env.local)
- CORS is enabled on the backend
- Cookies are used for authentication (httpOnly, secure)

## Testing the Connection
1. Open http://localhost:5174 (or the port shown in terminal)
2. Click on "Signup" or navigate to /signup
3. Create a new account
4. You should be redirected to /dashboard after successful signup
5. Check your browser console for any errors

## API Endpoints Available
- POST /api/signup - Create new account
- POST /api/login - Login with email & password
- POST /api/logout - Logout
- GET /api/user - Get current user info (requires auth cookie)
