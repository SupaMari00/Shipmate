import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    phone: '',
    password: '' 
  })
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signup } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    try {
      await signup(formData.full_name, formData.email, formData.phone, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setErrors(err.errors || [err.error || 'Signup failed. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignup = (provider) => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Create Account
          </h1>

          <p className="text-slate-400">
            Start shipping with ShipMate
          </p>
        </div>

        {errors.length > 0 && (
          <div className="mb-5 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            <ul className="list-disc list-inside">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
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
            placeholder="Phone Number"
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
          <span className="text-slate-500 text-sm">OR SIGN UP WITH</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        <div className="space-y-3">

          <button 
            onClick={() => handleOAuthSignup('google')}
            type="button"
            className="w-full bg-white hover:bg-gray-100 text-black py-4 rounded-xl font-semibold transition duration-300 flex items-center justify-center gap-3"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="google"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          <button 
            onClick={() => handleOAuthSignup('github')}
            type="button"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-semibold transition duration-300 flex items-center justify-center gap-3 border border-gray-700"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              alt="github"
              className="w-5 h-5"
            />
            Continue with GitHub
          </button>

        </div>

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
