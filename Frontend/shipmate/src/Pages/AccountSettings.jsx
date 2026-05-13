import { Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const AccountSettings = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setMessage('')
      setError('')
      // TODO: Implement profile update endpoint in backend
      setMessage('Profile updates not yet implemented in backend')
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = () => {
    setMessage('')
    setError('')
    // TODO: Implement password change functionality
    setError('Password change not yet implemented')
  }

  const handleManageNotifications = () => {
    setMessage('')
    setError('')
    // TODO: Implement notification settings
    setError('Notification settings not yet implemented')
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h1 className="text-4xl font-semibold mb-2">Account Settings</h1>
              <p className="text-gray-400">
                Update your profile, security preferences, and notification settings for {user?.full_name || 'your account'}.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/dashboard"
                className="border border-slate-700 px-4 py-2 rounded-lg hover:border-violet-400 text-slate-200 hover:text-violet-300 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-200">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2 animate-slide-up">
            {/* Personal Information Section */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl hover:border-violet-500/50 transition duration-300">
              <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
              
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-gray-300">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Full name</p>
                    <input
                      type="text"
                      name="full_name"
                      value={editData.full_name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Email address</p>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      disabled
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 opacity-75 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Phone number</p>
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-lg transition font-semibold"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setEditData({
                          full_name: user?.full_name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                        })
                      }}
                      className="border border-slate-700 hover:border-slate-600 px-5 py-3 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-gray-300">
                  <div>
                    <p className="text-sm text-gray-400">Full name</p>
                    <p className="mt-1 text-white">{user?.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email address</p>
                    <p className="mt-1 text-white">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone number</p>
                    <p className="mt-1 text-white">{user?.phone || 'Not provided'}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-lg transition font-semibold"
                  >
                    Edit profile details
                  </button>
                </div>
              )}
            </div>

            {/* Security & Preferences Section */}
            <div className="rounded-3xl bg-gray-800 p-7 shadow-lg border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Security & Preferences</h2>
              <div className="space-y-4 text-gray-300">
                <div className="rounded-2xl bg-gray-900 p-5">
                  <p className="text-sm text-slate-400">Login method</p>
                  <p className="mt-1 text-white">
                    {user?.oauth_provider ? `${user.oauth_provider.charAt(0).toUpperCase() + user.oauth_provider.slice(1)} OAuth` : 'Email + password'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950/50 border border-slate-700/50 p-5">
                  <p className="text-sm text-slate-400">Two-factor authentication</p>
                  <p className="mt-1 text-white">Recommended for better account protection</p>
                </div>
                <div className="rounded-2xl bg-slate-950/50 border border-slate-700/50 p-5">
                  <p className="text-sm text-slate-400">Notification settings</p>
                  <p className="mt-1 text-white">Email alerts enabled</p>
                </div>
                <div className="flex gap-3 flex-wrap pt-4">
                  <button
                    onClick={handleChangePassword}
                    className="border border-violet-500 text-violet-200 hover:bg-violet-600/20 px-4 py-2 rounded-lg transition font-semibold"
                  >
                    Change password
                  </button>
                  <button
                    onClick={handleManageNotifications}
                    className="border border-slate-600 hover:border-violet-400 text-slate-200 hover:text-violet-300 px-4 py-2 rounded-lg transition"
                  >
                    Manage notifications
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Overview Section */}
          <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-semibold mb-4">Account overview</h2>
            <p className="text-slate-300 mb-4">
              Keep this page updated with your latest contact details so shipments and support messages always reach you.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/50 border border-slate-700/50 p-5">
                <p className="text-sm text-slate-400">Account status</p>
                <p className="mt-2 text-white capitalize">{user?.status || 'Active'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/50 border border-slate-700/50 p-5">
                <p className="text-sm text-slate-400">Account type</p>
                <p className="mt-2 text-white capitalize">{user?.role || 'Customer'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/50 border border-slate-700/50 p-5">
                <p className="text-sm text-slate-400">Member since</p>
                <p className="mt-2 text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/50 border border-slate-700/50 p-5">
                <p className="text-sm text-gray-400">Support email</p>
                <p className="mt-2 text-white">support@shipmate.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AccountSettings
