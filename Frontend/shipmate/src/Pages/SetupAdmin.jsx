import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { adminAPI } from '../services/api'

const SetupAdmin = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await adminAPI.setupAdmin(email)
      setMessage(response.message)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error(err)
      setError(err.error || 'Failed to set up admin account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-md mx-auto mt-20 p-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-violet-400 mb-6 text-center">
            Setup Admin Account
          </h1>

          <p className="text-slate-400 mb-6 text-center">
            Promote an existing user account to admin. This endpoint will be removed after first use.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                User Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                placeholder="Enter user email"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-950 border border-red-700 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-green-950 border border-green-700 p-4 text-sm text-green-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Setting up...' : 'Promote to Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              After setup, log in with your admin account at{' '}
              <a href="/login" className="text-violet-400 hover:text-violet-300">
                /login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupAdmin