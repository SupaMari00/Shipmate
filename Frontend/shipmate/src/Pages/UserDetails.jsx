import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { adminAPI } from '../services/api'

const roleOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
]

const UserDetails = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await adminAPI.getUser(id)
        setUser(data.user)
      } catch (err) {
        console.error(err)
        setError(err.error || 'Unable to load user details')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchUser()
    }
  }, [currentUser, id])

  const ShouldConfirmChange = (field, value) => {
    if (!user) return false

    if (field === 'role' && value !== user.role) {
      return true
    }

    if (field === 'status' && value !== user.status && (value === 'inactive' || value === 'blocked')) {
      return true
    }

    return false
  }

  const handleChange = async (field, value) => {
    if (!user) return

    setError(null)

    if (currentUser?.id === user.id && field === 'status') {
      setError('You cannot change your own status.')
      return
    }

    if (currentUser?.id === user.id && field === 'role' && value !== 'admin') {
      setError('You cannot demote your own admin access.')
      return
    }

    if (ShouldConfirmChange(field, value)) {
      setConfirmAction({ field, value })
      return
    }

    await applyChange(field, value)
  }

  const applyChange = async (field, value) => {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      let data
      if (field === 'role') {
        data = await adminAPI.updateUserRole(user.id, value)
      } else {
        data = await adminAPI.updateUserStatus(user.id, value)
      }
      setUser(data.user)
      setConfirmAction(null)
    } catch (err) {
      console.error(err)
      setError(err.error || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const confirmMessage = () => {
    if (!confirmAction || !user) return ''

    if (confirmAction.field === 'role') {
      return confirmAction.value === 'admin'
        ? `Are you sure you want to promote ${user.full_name} to admin?`
        : `Are you sure you want to change ${user.full_name}'s role to ${confirmAction.value}?`
    }

    return `Are you sure you want to change ${user.full_name}'s status to ${confirmAction.value}?`
  }

  if (!currentUser) {
    return (
      <div className="bg-slate-950 min-h-screen text-white">
        <Navbar />
        <div className="p-12">Loading...</div>
      </div>
    )
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-slate-950 min-h-screen text-white">
        <Navbar />
        <div className="p-12">
          <h1 className="text-3xl font-bold mb-4">Access denied</h1>
          <p>Only administrators can view user details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">User details</h1>
            <p className="text-slate-400 mt-2">Review and update role or status for this user.</p>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center rounded-full bg-slate-800 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 transition"
          >
            Back to admin
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10">Loading user...</div>
        ) : error ? (
          <div className="rounded-3xl bg-slate-900 border border-red-600 p-8 text-red-300">{error}</div>
        ) : !user ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">User not found.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">
              <h2 className="text-2xl font-semibold mb-4">Profile</h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-slate-500">Name</p>
                  <p>{user.full_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Phone</p>
                  <p>{user.phone || 'None'}</p>
                </div>
                <div>
                  <p className="text-slate-500">User ID</p>
                  <p>{user.id}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">
              <h2 className="text-2xl font-semibold mb-4">Controls</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                  <select
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    value={user.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    disabled={saving}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                  <select
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    value={user.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={saving}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <div className="rounded-2xl bg-red-950 border border-red-700 p-4 text-sm text-red-200">{error}</div>}

                <div className="rounded-2xl bg-slate-950/5 border border-slate-800 p-4 text-sm text-slate-400">
                  <p>
                    Current role: <span className="text-white">{user.role}</span>
                  </p>
                  <p>
                    Current status: <span className="text-white">{user.status}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4">Confirm change</h3>
            <p className="text-slate-300 mb-6">{confirmMessage()}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-500"
                onClick={() => applyChange(confirmAction.field, confirmAction.value)}
                disabled={saving}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDetails
