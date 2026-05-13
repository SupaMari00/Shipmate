import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { shipmentAPI } from '../services/api'

const RecentShipments = () => {
  const { user } = useAuth()
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await shipmentAPI.getShipments()
        setShipments(data.shipments || [])
      } catch (err) {
        console.error('Error fetching shipments:', err)
        setError(err.message || 'Failed to load shipments')
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()
  }, [])

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-600/30 border-yellow-500/50 text-yellow-200',
      'picked_up': 'bg-blue-600/30 border-blue-500/50 text-blue-200',
      'in_transit': 'bg-purple-600/30 border-purple-500/50 text-purple-200',
      'out_for_delivery': 'bg-cyan-600/30 border-cyan-500/50 text-cyan-200',
      'delivered': 'bg-green-600/30 border-green-500/50 text-green-200',
      'failed': 'bg-red-600/30 border-red-500/50 text-red-200',
    }
    return statusMap[status] || 'bg-violet-600/30 border-violet-500/50 text-violet-200'
  }

  const formatStatus = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h1 className="text-4xl font-semibold mb-2">Recent Shipments</h1>
              <p className="text-gray-400">
                See the latest shipments for {user?.full_name || 'your account'}. Track status, origin, destination, and estimated delivery date.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/dashboard"
                className="border border-slate-700 px-4 py-2 rounded-lg hover:border-violet-400 text-slate-200 hover:text-violet-300 transition"
              >
                Back to Dashboard
              </Link>
              <Link
                to="/create-shipment"
                className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition font-semibold"
              >
                Create New Shipment
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-12 text-center animate-slide-up">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
              </div>
              <p className="mt-4 text-slate-400">Loading shipments...</p>
            </div>
          ) : shipments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-12 text-center animate-slide-up">
              <p className="text-slate-400 text-lg mb-4">No shipments found</p>
              <Link
                to="/create-shipment"
                className="inline-block bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-lg transition font-semibold"
              >
                Create Your First Shipment
              </Link>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden animate-slide-up">
              <div className="grid grid-cols-6 gap-4 bg-slate-950/50 px-6 py-4 text-slate-400 text-sm uppercase tracking-wide">
                <span className="col-span-2">Shipment ID</span>
                <span>Status</span>
                <span>Origin</span>
                <span>Destination</span>
                <span>ETA</span>
              </div>
              <div className="divide-y divide-slate-800">
                {shipments.map((shipment) => (
                  <div key={shipment.id} className="grid grid-cols-6 gap-4 px-6 py-5 hover:bg-slate-800/50 transition duration-300">
                    <div className="col-span-2">
                      <p className="font-medium text-white">{shipment.tracking_number}</p>
                      <p className="text-sm text-gray-400">{shipment.order_reference}</p>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${getStatusColor(shipment.current_status)}`}>
                        {formatStatus(shipment.current_status)}
                      </span>
                    </div>
                    <div className="text-sm">{shipment.origin}</div>
                    <div className="text-sm">{shipment.destination}</div>
                    <div className="text-sm">{formatDate(shipment.estimated_delivery)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-semibold mb-4">Shipment details you should know</h2>
            <ul className="space-y-3 text-slate-300">
              <li>• Delivery estimates are updated in real time when the carrier scans your package.</li>
              <li>• You can manage customs paperwork and insurance information from the Create Shipment page.</li>
              <li>• If a shipment is delayed, ShipMate support will notify you by email and SMS.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RecentShipments
