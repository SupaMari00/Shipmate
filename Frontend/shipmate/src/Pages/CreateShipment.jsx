import { useState } from 'react'
import Navbar from '../components/Navbar'
import { shipmentAPI } from '../services/api'

const CreateShipment = () => {
  const [senderName, setSenderName] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [cargoDescription, setCargoDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [shippingType, setShippingType] = useState('Air Freight')
  const [priority, setPriority] = useState('Standard')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalTitle, setModalTitle] = useState('')
  const [modalError, setModalError] = useState(false)

  const resetForm = () => {
    setSenderName('')
    setReceiverName('')
    setReceiverPhone('')
    setOrigin('')
    setDestination('')
    setCargoDescription('')
    setWeight('')
    setShippingType('Air Freight')
    setPriority('Standard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setModalError(false)
    setModalMessage('')
    setModalTitle('')

    try {
      const data = await shipmentAPI.createShipment({
        sender_name: senderName,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        origin,
        destination,
        cargo_description: cargoDescription,
        weight,
        shipping_type: shippingType,
        priority,
      })

      setModalTitle('Shipment Created')
      setModalMessage(`Your shipment was created successfully. Tracking number: ${data.shipment.tracking_number}`)
      setModalError(false)
      setModalOpen(true)
      resetForm()
    } catch (err) {
      const message = err.errors ? err.errors.join(', ') : err.error || 'Unable to create shipment.'
      setModalTitle('Shipment Error')
      setModalMessage(message)
      setModalError(true)
      setModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-semibold mb-3">Create Shipment</h1>
          <p className="text-slate-400 text-lg">Fill in shipment details below to request a quote.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-slate-300">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-300">Receiver Name</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-slate-300">Origin Country</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-300">Destination Country</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-slate-300">Cargo Description</label>
            <textarea
              rows="5"
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 text-slate-300">Weight (KG)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-300">Shipping Type</label>
              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
              >
                <option>Air Freight</option>
                <option>Sea Freight</option>
                <option>Ground Shipping</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
              >
                <option>Standard</option>
                <option>Express</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-slate-300">Receiver Phone</label>
            <input
              type="text"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 outline-none focus:border-violet-500"
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 px-8 py-4 text-lg font-semibold text-white transition duration-300 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating shipment...' : 'Create Shipment'}
          </button>
        </form>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">{modalTitle}</h2>
            <p className={`text-sm ${modalError ? 'text-red-300' : 'text-slate-300'}`}>{modalMessage}</p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateShipment