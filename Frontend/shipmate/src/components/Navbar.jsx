import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="relative bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <Link to="/" className="text-3xl font-bold text-violet-400 tracking-wide">
          ShipMate
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-300 hover:bg-slate-800 hover:text-violet-400 transition"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="sr-only">Toggle navigation</span>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav className={`lg:block absolute inset-x-0 top-full bg-slate-950 border-b border-slate-800 shadow-2xl lg:shadow-none lg:border-none lg:bg-transparent lg:static lg:w-auto overflow-hidden transition-all duration-300 ease-out ${menuOpen ? 'max-h-96 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'} lg:max-h-full lg:opacity-100 lg:pointer-events-auto`}>
          <div className={`max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:px-0 lg:py-0 lg:gap-6 transition-opacity duration-300 ease-out ${menuOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl px-4 py-3 text-slate-300 hover:text-violet-400 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0"
            >
              Home
            </Link>

            <Link
              to="/quote"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl px-4 py-3 text-slate-300 hover:text-violet-400 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0"
            >
              Quote
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-slate-300 hover:text-violet-400 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0"
                >
                  Dashboard
                </Link>

                <Link
                  to="/create-shipment"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-slate-300 hover:text-violet-400 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0"
                >
                  Create Shipment
                </Link>

                <Link
                  to="/quotes"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-slate-300 hover:text-violet-400 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0"
                >
                  My Quotes
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-violet-400 hover:text-violet-300 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0 font-medium"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            <Link
              to="/track-shipment"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl px-4 py-3 text-slate-300 hover:text-violet-400 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0"
            >
              Track Shipment
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-slate-300 hover:text-violet-400 hover:bg-slate-900 transition duration-300 lg:bg-transparent lg:p-0"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-white font-medium transition duration-300 shadow-lg shadow-violet-900/30 hover:bg-violet-700"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
                className="rounded-xl bg-red-600 px-5 py-3 text-white font-medium transition duration-300 shadow-lg shadow-red-900/30 hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar