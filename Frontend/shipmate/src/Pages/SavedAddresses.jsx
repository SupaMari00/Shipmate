import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { addressAPI } from '../services/api'

const SavedAddresses = () => {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    label: '',
    recipient_name: '',
    street_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    phone: '',
    address_type: 'other',
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await addressAPI.getAddresses()
      setAddresses(data.addresses || [])
    } catch (err) {
      console.error('Error fetching addresses:', err)
      setError(err.message || 'Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await addressAPI.createAddress(formData)
      setFormData({
        label: '',
        recipient_name: '',
        street_address: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        phone: '',
        address_type: 'other',
      })
      setShowAddForm(false)
      await fetchAddresses()
    } catch (err) {
      setError(err.message || 'Failed to add address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressAPI.deleteAddress(addressId)
        await fetchAddresses()
      } catch (err) {
        setError(err.message || 'Failed to delete address')
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h1 className="text-4xl font-semibold mb-2">Saved Addresses</h1>
              <p className="text-gray-400">
                Manage delivery and pickup locations for {user?.full_name || 'your account'}. Keep your most used addresses ready for fast shipment creation.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/dashboard"
                className="border border-slate-700 px-4 py-2 rounded-lg hover:border-violet-400 text-slate-200 hover:text-violet-300 transition"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition font-semibold"
              >
                {showAddForm ? 'Cancel' : 'Add New Address'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {showAddForm && (
            <div className="mb-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl animate-slide-up">
              <h2 className="text-2xl font-semibold mb-6">Add New Address</h2>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Label</label>
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleInputChange}
                      placeholder="e.g., Home, Office"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Address Type *</label>
                    <select
                      name="address_type"
                      value={formData.address_type}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="home">Home</option>
                      <option value="office">Office</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Recipient Name *</label>
                    <input
                      type="text"
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-400 block mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="street_address"
                      value={formData.street_address}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">State/Province</label>
                    <input
                      type="text"
                      name="state_province"
                      value={formData.state_province}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="border border-slate-700 hover:border-slate-600 px-6 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-12 text-center animate-slide-up">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
              </div>
              <p className="mt-4 text-slate-400">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-12 text-center animate-slide-up">
              <p className="text-slate-400 text-lg mb-4">No saved addresses yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-block bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-lg transition font-semibold"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 animate-slide-up">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{address.label || 'Address'}</h2>
                      <p className="text-sm text-gray-400">{address.recipient_name}</p>
                    </div>
                    <span className="rounded-full bg-violet-600/30 border border-violet-500/50 px-3 py-1 text-sm text-violet-200 uppercase tracking-wide">
                      {address.address_type}
                    </span>
                  </div>
                  <div className="space-y-2 text-slate-300 mb-4">
                    <p>{address.street_address}</p>
                    <p>{address.city}{address.state_province ? `, ${address.state_province}` : ''}</p>
                    {address.postal_code && <p>{address.postal_code}</p>}
                    <p>{address.country}</p>
                    {address.phone && <p>Phone: {address.phone}</p>}
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="border border-red-600 hover:border-red-400 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-semibold mb-4">Address management tips</h2>
            <ul className="space-y-3 text-slate-300">
              <li>• Save frequently used pickup and delivery locations to speed up shipment creation.</li>
              <li>• Keep your contact name and phone number current to avoid delivery delays.</li>
              <li>• Use separate labels for home, office, and warehouse locations to organize your address book.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SavedAddresses
