import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

const AdminDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState({ totalShipments: 0, activeUsers: 0, revenue: 0 })
  const [recentShipments, setRecentShipments] = useState([])
  const [adminShipments, setAdminShipments] = useState([])
  const [analytics, setAnalytics] = useState({ shipmentsByStatus: [], usersByRole: [], totalOrders: 0, recentShipments: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingUserId, setSavingUserId] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return
    }

    const fetchAdminData = async () => {
      try {
        const [usersData, dashboardData, shipmentsData, analyticsData] = await Promise.all([
          adminAPI.getUsers(),
          adminAPI.getDashboard(),
          adminAPI.getShipments(),
          adminAPI.getAnalytics(),
        ])

        setUsers(usersData.users)
        setSummary({
          totalShipments: dashboardData.totalShipments,
          activeUsers: dashboardData.activeUsers,
          revenue: dashboardData.revenue,
        })
        setRecentShipments(dashboardData.recentShipments || [])
        setAdminShipments(shipmentsData.shipments || [])
        setAnalytics({
          shipmentsByStatus: analyticsData.shipmentsByStatus || [],
          usersByRole: analyticsData.usersByRole || [],
          totalOrders: analyticsData.totalOrders || 0,
          recentShipments: analyticsData.recentShipments || [],
        })
      } catch (err) {
        console.error(err)
        setError(err.error || 'Unable to load admin data')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [user])

  const handleRoleChange = async (userId, newRole) => {
    setSavingUserId(userId)
    setError(null)

    try {
      const data = await adminAPI.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((item) => (item.id === userId ? data.user : item)))
    } catch (err) {
      console.error(err)
      setError(err.error || 'Unable to update role')
    } finally {
      setSavingUserId(null)
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    setSavingUserId(userId)
    setError(null)

    try {
      const data = await adminAPI.updateUserStatus(userId, newStatus)
      setUsers((prev) => prev.map((item) => (item.id === userId ? data.user : item)))
    } catch (err) {
      console.error(err)
      setError(err.error || 'Unable to update status')
    } finally {
      setSavingUserId(null)
    }
  }

  if (!user) {
    return (
      <div className="bg-slate-950 min-h-screen text-white">
        <Navbar />
        <div className="p-12">Loading...</div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="bg-slate-950 min-h-screen text-white">
        <Navbar />
        <div className="p-12">
          <h1 className="text-3xl font-bold mb-4">Access denied</h1>
          <p>Only administrators can access this panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <div className="flex">
        <aside className="w-72 bg-slate-900 border-r border-slate-800 min-h-screen p-6 hidden lg:block">
          <h2 className="text-3xl font-bold text-violet-400 mb-10">Admin Panel</h2>

          <nav className="space-y-4">
            {['dashboard', 'shipments', 'users', 'analytics', 'settings'].map((tab) => {
              const labels = {
                dashboard: 'Dashboard',
                shipments: 'Shipments',
                users: 'Users',
                analytics: 'Analytics',
                settings: 'Settings',
              }
              return (
                <button
                  key={tab}
                  className={`w-full text-left px-5 py-4 rounded-xl transition duration-300 cursor-pointer ${activeTab === tab ? 'bg-violet-600' : 'hover:bg-slate-800'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {labels[tab]}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                  <h3 className="text-slate-400 mb-2">Total Shipments</h3>
                  <h1 className="text-5xl font-bold">{summary.totalShipments}</h1>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                  <h3 className="text-slate-400 mb-2">Active Users</h3>
                  <h1 className="text-5xl font-bold">{summary.activeUsers}</h1>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                  <h3 className="text-slate-400 mb-2">Revenue</h3>
                  <h1 className="text-5xl font-bold">${summary.revenue.toLocaleString()}</h1>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-10">
                <div className="p-6 border-b border-slate-800">
                  <h2 className="text-2xl font-semibold">Recent Shipments</h2>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-left p-4">Tracking ID</th>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentShipments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-slate-400">No recent shipments available</td>
                      </tr>
                    ) : (
                      recentShipments.map((shipment) => (
                        <tr key={shipment.tracking_number} className="border-b border-slate-800">
                          <td className="p-4">{shipment.tracking_number}</td>
                          <td className="p-4">{shipment.customer_name}</td>
                          <td className="p-4 capitalize text-slate-200">{shipment.current_status?.replace(/_/g, ' ') || 'Pending'}</td>
                          <td className="p-4">{shipment.destination || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'shipments' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-10">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-2xl font-semibold">All Shipments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-left p-4">Tracking</th>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Origin</th>
                      <th className="text-left p-4">Destination</th>
                      <th className="text-left p-4">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminShipments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-400">No shipments available</td>
                      </tr>
                    ) : (
                      adminShipments.map((shipment) => (
                        <tr key={shipment.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition">
                          <td className="p-4">{shipment.tracking_number}</td>
                          <td className="p-4">{shipment.customer_name}</td>
                          <td className="p-4 capitalize">{shipment.current_status?.replace(/_/g, ' ')}</td>
                          <td className="p-4">{shipment.origin}</td>
                          <td className="p-4">{shipment.destination}</td>
                          <td className="p-4">{shipment.weight || 'N/A'} kg</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-2xl font-semibold">User Management</h2>
                <p className="text-slate-400 mt-1">Change roles for customers, staff, or admins.</p>
              </div>
              {error && <div className="p-4 text-red-400">{error}</div>}
              {loading ? (
                <div className="p-6">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Role</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => {
                        const isCurrentUser = item.id === user.id
                        return (
                          <tr key={item.id} className="border-b border-slate-800">
                            <td className="p-4">{item.full_name}</td>
                            <td className="p-4">{item.email}</td>
                            <td className="p-4">
                              <select
                                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm w-full"
                                value={item.role}
                                disabled={savingUserId === item.id || isCurrentUser}
                                onChange={(e) => handleRoleChange(item.id, e.target.value)}
                              >
                                {roleOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {isCurrentUser && (
                                <p className="text-xs text-slate-500 mt-1">You cannot demote your own admin access.</p>
                              )}
                            </td>
                            <td className="p-4">
                              <select
                                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm w-full"
                                value={item.status}
                                disabled={savingUserId === item.id || isCurrentUser}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              >
                                {statusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4">
                              <Link
                                to={`/admin/users/${item.id}`}
                                className="inline-flex rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition"
                              >
                                Details
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-10">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-2xl font-semibold">Analytics</h2>
                <p className="text-slate-400 mt-1">Summary of shipments and user roles.</p>
              </div>
              <div className="p-6 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-6">
                  <p className="text-sm text-slate-400">Total Orders</p>
                  <p className="mt-3 text-3xl font-bold">{analytics.totalOrders}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-6">
                  <p className="text-sm text-slate-400">Shipment Status Mix</p>
                  <ul className="mt-3 space-y-2 text-slate-200">
                    {analytics.shipmentsByStatus.map((item) => (
                      <li key={item.status} className="flex justify-between">
                        <span>{item.status.replace(/_/g, ' ')}</span>
                        <span>{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-6">
                  <p className="text-sm text-slate-400">Users by Role</p>
                  <ul className="mt-3 space-y-2 text-slate-200">
                    {analytics.usersByRole.map((item) => (
                      <li key={item.role} className="flex justify-between">
                        <span>{item.role}</span>
                        <span>{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Settings</h2>
              <div className="grid gap-6">
                <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-6">
                  <p className="text-sm text-slate-400">Admin theme</p>
                  <p className="mt-2 text-slate-200">Dark dashboard mode</p>
                </div>
                <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-6">
                  <p className="text-sm text-slate-400">Notifications</p>
                  <p className="mt-2 text-slate-200">Email alerts enabled for admin activity</p>
                </div>
                <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-6">
                  <p className="text-sm text-slate-400">Data refresh</p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-3 inline-flex rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition"
                  >
                    Refresh dashboard data
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'users' && activeTab !== 'analytics' && activeTab !== 'shipments' && activeTab !== 'settings' && activeTab !== 'dashboard' && (
            <div className="p-6 text-slate-400">Select a panel from the menu to view data.</div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard