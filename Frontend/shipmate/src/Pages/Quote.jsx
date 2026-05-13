import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { quoteAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const cargoOptions = [
  {
    id: 'fcl',
    title: 'FCL',
    description: '20 or 40 foot full shipping container.',
    details: 'Full Container Load shipping for large shipments.',
  },
  {
    id: 'lcl',
    title: 'LCL',
    description: 'Less than container load.',
    details: 'Partial container for smaller shipments.',
  },
  {
    id: 'air',
    title: 'Air Cargo',
    description: 'Pallets, boxes and air freight.',
    details: 'Fast air transport for urgent deliveries.',
  },
  {
    id: 'vehicles',
    title: 'Vehicles',
    description: 'Car and automobile shipping.',
    details: 'Specialized vehicle transport services.',
  },
  {
    id: 'bulk',
    title: 'Bulk Cargo',
    description: 'Heavy industrial shipping.',
    details: 'Large-scale industrial freight handling.',
  },
]

const Quote = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    weight: '',
    dimensions: '',
    origin: '',
    destination: '',
    notes: '',
  })

  const selectedType = searchParams.get('type')
  const selectedCargo = cargoOptions.find(c => c.id === selectedType)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [statusMessage, setStatusMessage] = useState('')
  const [statusError, setStatusError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const [modalQuote, setModalQuote] = useState(null)

  const handleSelectCargo = (cargoId) => {
    setSearchParams({ type: cargoId })
  }

  const handleClearSelection = () => {
    setSearchParams({})
    setFormData({
      weight: '',
      dimensions: '',
      origin: '',
      destination: '',
      notes: '',
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatusMessage('')
    setStatusError(false)

    if (!user) {
      navigate('/login')
      return
    }

    if (!selectedType) {
      setStatusError(true)
      setStatusMessage('Please select a cargo type before requesting a quote.')
      return
    }

    setIsSubmitting(true)
    setModalOpen(false)

    try {
      const result = await quoteAPI.createQuote({
        cargo_type: selectedType,
        weight: formData.weight,
        dimensions: formData.dimensions,
        origin: formData.origin,
        destination: formData.destination,
        notes: formData.notes,
      })

      setModalTitle('Quote Request Successful')
      setModalMessage('Your quote request has been submitted successfully.')
      setModalError(false)
      setModalQuote(result.quote)
      setModalOpen(true)
      setStatusMessage('Quote requested successfully.')
      setStatusError(false)
      setFormData({
        weight: '',
        dimensions: '',
        origin: '',
        destination: '',
        notes: '',
      })
      setSearchParams({})
    } catch (err) {
      const message = err?.error || err?.message || 'Unable to submit quote request.'
      setModalTitle('Quote Request Failed')
      setModalMessage(message)
      setModalError(true)
      setModalQuote(null)
      setModalOpen(true)
      setStatusError(true)
      setStatusMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-semibold text-center mb-4 animate-fade-in">
            Cargo Details
          </h1>

          <p className="text-center mb-16 text-slate-400 text-lg animate-fade-in" style={{animationDelay: '0.1s'}}>
            Select the type of cargo you are looking to ship
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 animate-slide-up">
            {cargoOptions.map((cargo) => (
              <div
                key={cargo.id}
                onClick={() => handleSelectCargo(cargo.id)}
                className={`text-center p-6 rounded-2xl transition duration-300 cursor-pointer border ${
                  selectedType === cargo.id
                    ? 'bg-violet-600/20 border-violet-500 shadow-lg shadow-violet-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg'
                }`}
              >
                <h3 className="text-xl font-medium mb-2">
                  {cargo.title}
                </h3>

                <p className="text-slate-400">
                  {cargo.description}
                </p>
              </div>
            ))}
          </div>

          {selectedCargo && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-semibold mb-2">{selectedCargo.title}</h2>
                  <p className="text-slate-400">{selectedCargo.details}</p>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="border border-slate-600 hover:border-violet-400 text-slate-200 hover:text-violet-300 px-4 py-2 rounded-lg transition font-semibold"
                >
                  Change Type
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {statusMessage && (
                  <div className={`rounded-2xl p-4 text-sm ${statusError ? 'bg-red-950 border border-red-700 text-red-200' : 'bg-emerald-950 border border-emerald-700 text-emerald-200'}`}>
                    {statusMessage}
                  </div>
                )}
                {!user && (
                  <div className="rounded-2xl p-4 bg-slate-900 border border-slate-700 text-slate-200">
                    <p className="mb-4">You must be logged in to request a quote.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition"
                    >
                      Log in to continue
                    </button>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="Enter total weight"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Dimensions (L×W×H in cm)</label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      placeholder="e.g., 100×50×50"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Origin</label>
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                      placeholder="Pickup location"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Destination</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Delivery location"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special handling or requirements?"
                    rows="4"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition duration-300 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get Quote'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-6 py-3 border border-gray-600 hover:bg-gray-700 rounded-lg transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
              <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl shadow-black/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-semibold mb-2">{modalTitle}</h2>
                    <p className={`text-sm ${modalError ? 'text-red-300' : 'text-slate-300'}`}>{modalMessage}</p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                    aria-label="Close quote modal"
                  >
                    ✕
                  </button>
                </div>

                {!modalError && modalQuote && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950 p-5 border border-slate-800">
                      <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Quote Price</p>
                      <p className="text-3xl font-semibold text-white">${modalQuote.estimated_price?.toFixed(2)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-5 border border-slate-800">
                      <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Status</p>
                      <p className="text-lg font-semibold text-white">{modalQuote.status}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-5 border border-slate-800 sm:col-span-2">
                      <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Shipment Route</p>
                      <p className="text-white">{modalQuote.origin} → {modalQuote.destination}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-5 border border-slate-800">
                      <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Cargo Type</p>
                      <p className="text-white">{modalQuote.cargo_type.toUpperCase()}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950 p-5 border border-slate-800">
                      <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Weight</p>
                      <p className="text-white">{modalQuote.weight} kg</p>
                    </div>
                    {modalQuote.dimensions && (
                      <div className="rounded-3xl bg-slate-950 p-5 border border-slate-800 sm:col-span-2">
                        <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Dimensions</p>
                        <p className="text-white">{modalQuote.dimensions}</p>
                      </div>
                    )}
                    {modalQuote.notes && (
                      <div className="rounded-3xl bg-slate-950 p-5 border border-slate-800 sm:col-span-2">
                        <p className="text-sm text-slate-400 uppercase tracking-[0.2em] mb-2">Notes</p>
                        <p className="text-slate-300">{modalQuote.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-2xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Quote