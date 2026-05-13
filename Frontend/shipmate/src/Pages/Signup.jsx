import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

const Signup = () => {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    phone: '',
    password: '' 
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signup, googleLogin } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signup(formData.full_name, formData.email, formData.phone, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

<div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 animate-fade-in">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Create Account
          </h1>

          <p className="text-slate-400">
            Start shipping with ShipMate
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-violet-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-violet-500"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-violet-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-violet-500"
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition duration-300 py-4 rounded-xl text-white font-semibold"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>
         <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        <GoogleLogin
          onSuccess={async (response) => {
            try {
              const result = await googleLogin(response.credential)
              if (result.user) {
                // If new Google user without phone, redirect to account settings
                if (result.isNewUser && !result.user.phone) {
                  navigate('/account-settings')
                } else {
                  navigate('/dashboard')
                }
              }
            } catch (err) {
              setError(err.error || 'Google login failed. Please try again.')
            }
          }}
          onError={() => {
            setError('Google login failed. Please try again.')
          }}
        >
          Continue with Google
        </GoogleLogin>

        <p className="text-center text-slate-400 mt-6">
          Already have an account?

          <Link
            to="/login"
            className="text-violet-400 ml-2"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup