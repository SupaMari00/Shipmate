import { useState } from 'react'
import Navbar from '../components/Navbar'

const TrackShipment = () => {
  const [trackingId, setTrackingId] = useState('')
  const [shipment, setShipment] = useState(null)

  const handleTrack = () => {
    // Fake shipment data for now
    setShipment({
      id: trackingId,
      status: 'In Transit',
      location: 'Lagos Distribution Center',
      estimatedDelivery: 'May 12, 2026',
      progress: 70,
    })
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold mb-4">
            Track Shipment
          </h1>

          <p className="text-slate-400 text-lg">
            Enter your tracking number to monitor shipment progress
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              placeholder="Enter Tracking Number"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 outline-none focus:border-violet-500"
            />

            <button
              onClick={handleTrack}
              className="bg-violet-600 hover:bg-violet-700 px-8 py-4 rounded-xl font-semibold transition duration-300"
            >
              Track Package
            </button>

          </div>

        </div>

        {/* Shipment Details */}
        {shipment && (
          <div className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">

              <div>
                <p className="text-slate-400 mb-2">
                  Tracking Number
                </p>

                <h2 className="text-3xl font-bold">
                  {shipment.id}
                </h2>
              </div>

              <div>
                <span className="bg-green-500/20 text-green-400 px-5 py-2 rounded-full text-sm font-medium">
                  {shipment.status}
                </span>
              </div>

            </div>

            {/* Progress */}
            <div className="mb-10">

              <div className="flex justify-between mb-3 text-sm text-slate-400">
                <span>Shipment Progress</span>
                <span>{shipment.progress}%</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">

                <div
                  className="bg-violet-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${shipment.progress}%` }}
                ></div>

              </div>

            </div>

            {/* Shipment Info */}
            <div className="grid md:grid-cols-2 gap-8">

              <div className="bg-slate-800 p-6 rounded-2xl">
                <h3 className="text-slate-400 mb-2">
                  Current Location
                </h3>

                <p className="text-2xl font-semibold">
                  {shipment.location}
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl">
                <h3 className="text-slate-400 mb-2">
                  Estimated Delivery
                </h3>

                <p className="text-2xl font-semibold">
                  {shipment.estimatedDelivery}
                </p>
              </div>

            </div>

            {/* Timeline */}
            <div className="mt-12">

              <h3 className="text-2xl font-semibold mb-8">
                Shipment Timeline
              </h3>

              <div className="space-y-8 border-l border-slate-700 ml-4">

                <div className="relative pl-10">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-2 top-1"></div>

                  <h4 className="font-semibold text-lg">
                    Shipment Picked Up
                  </h4>

                  <p className="text-slate-400">
                    May 6, 2026 - Lagos, Nigeria
                  </p>
                </div>

                <div className="relative pl-10">
                  <div className="absolute w-4 h-4 bg-violet-500 rounded-full -left-2 top-1"></div>

                  <h4 className="font-semibold text-lg">
                    In Transit
                  </h4>

                  <p className="text-slate-400">
                    Shipment is moving to destination hub
                  </p>
                </div>

                <div className="relative pl-10 opacity-50">
                  <div className="absolute w-4 h-4 bg-slate-600 rounded-full -left-2 top-1"></div>

                  <h4 className="font-semibold text-lg">
                    Out For Delivery
                  </h4>

                  <p className="text-slate-400">
                    Pending
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default TrackShipment