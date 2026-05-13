import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { quoteAPI } from '../services/api'

const serviceItems = [
  {
    title: 'Instant Freight Quotes',
    description: 'Get multiple shipping options and transparent rates in seconds.',
  },
  {
    title: 'Live Tracking',
    description: 'Monitor every shipment touchpoint with real-time updates.',
  },
  {
    title: 'Custom Logistics',
    description: 'Tailored solutions for small packages and large cargo alike.',
  },
]

const features = [
  {
    title: 'Digital documentation',
    description: 'Create and store shipping paperwork, invoices, and customs forms in one place.',
  },
  {
    title: 'Automated alerts',
    description: 'Be notified instantly about status changes, delays, and delivery confirmations.',
  },
  {
    title: 'Dedicated support',
    description: 'Our team helps keep shipments on track and resolves exceptions fast.',
  },
]

const Home = () => {
  const { user } = useAuth()
  const [latestQuote, setLatestQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [quoteError, setQuoteError] = useState('')

  useEffect(() => {
    const loadLatestQuote = async () => {
      if (!user) {
        setQuoteLoading(false)
        return
      }

      try {
        const data = await quoteAPI.getQuotes()
        const quotes = data.quotes || []
        setLatestQuote(quotes[0] || null)
      } catch (err) {
        setQuoteError(err?.error || 'Unable to load recent quotes')
      } finally {
        setQuoteLoading(false)
      }
    }

    loadLatestQuote()
  }, [user])

  return (
    <div className="bg-slate-950 text-white">
      <Navbar />

      <main className="overflow-hidden">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_35%)] py-24 lg:py-28">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/90 to-transparent" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-8 animate-slide-up">
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-300 ring-1 ring-violet-400/20">
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                  Trusted by logistics teams worldwide
                </span>

                <div className="space-y-5">
                  <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
                    Move your cargo faster with smarter shipping.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-400">
                    ShipMate delivers seamless freight coordination, instant quotes, and detailed tracking so teams can ship with confidence and deliver on time.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row items-start">
                  <Link
                    to="/create-shipment"
                    className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-4 text-base font-semibold text-white transition duration-300 hover:bg-violet-500 shadow-xl shadow-violet-500/20"
                  >
                    Create Shipment
                  </Link>
                  <Link
                    to="/track-shipment"
                    className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-4 text-base text-slate-200 transition duration-300 hover:border-violet-400 hover:text-violet-300"
                  >
                    Track Package
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 text-center shadow-lg shadow-black/20">
                    <p className="text-3xl font-semibold text-white">99.8%</p>
                    <p className="text-sm text-slate-400">On-time delivery</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 text-center shadow-lg shadow-black/20">
                    <p className="text-3xl font-semibold text-white">50+</p>
                    <p className="text-sm text-slate-400">Countries served</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 text-center shadow-lg shadow-black/20">
                    <p className="text-3xl font-semibold text-white">24/7</p>
                    <p className="text-sm text-slate-400">Support available</p>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/40">
                <div className="grid gap-6">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-violet-300">ShipMate dashboard</p>
                    <h2 className="mt-4 text-3xl font-semibold text-white">Everything in one place</h2>
                    <p className="mt-3 text-slate-400 leading-7">
                      Manage quotes, shipments, addresses, and tracking from a single dashboard without switching workflows.
                    </p>
                  </div>

                  {user && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                      <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Latest quote</p>
                      {quoteLoading ? (
                        <p className="mt-4 text-slate-400">Loading your last quote...</p>
                      ) : quoteError ? (
                        <p className="mt-4 text-red-300">{quoteError}</p>
                      ) : latestQuote ? (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm text-slate-400">{latestQuote.cargo_type.toUpperCase()} • {latestQuote.weight} kg</p>
                          <p className="text-2xl font-semibold text-white">${latestQuote.estimated_price?.toFixed(2)}</p>
                          <p className="text-sm text-slate-400">{latestQuote.origin} → {latestQuote.destination}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status: {latestQuote.status}</p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <p className="text-slate-300">You haven't requested any quotes yet.</p>
                          <Link to="/quote" className="inline-flex rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition">
                            Request a Quote
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fast quotes</p>
                      <p className="mt-3 text-lg font-semibold text-white">Compare prices instantly</p>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Reliable tracking</p>
                      <p className="mt-3 text-lg font-semibold text-white">Know where shipments are</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-800 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              {serviceItems.map((item) => (
                <div key={item.title} className="animate-slide-up rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-slate-900">
                  <div className="inline-flex rounded-full bg-violet-600/10 px-3 py-2 text-violet-300 text-sm font-semibold tracking-wide">
                    {item.title}
                  </div>
                  <p className="mt-5 text-slate-300 leading-7">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950/80 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6 animate-fade-in">
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-300 ring-1 ring-violet-400/20">
                  How ShipMate works
                </span>
                <h2 className="text-4xl font-semibold tracking-tight">Designed for teams that need control and speed.</h2>
                <p className="text-slate-400 leading-8">
                  Create shipments, save delivery addresses, and monitor every stage of transport with a streamlined workflow built for modern logistics.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg shadow-black/20 transition hover:border-violet-500/30 hover:bg-slate-900">
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="mt-3 text-slate-400 leading-7">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-10 shadow-2xl shadow-black/30 animate-slide-up">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-4xl font-semibold tracking-tight">Ready to simplify your shipping?</h2>
                  <p className="mt-4 text-slate-400 leading-8">
                    Start with a quote or set up your account now to experience faster, smarter logistics with the tools shipping teams love.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/create-shipment"
                    className="inline-flex items-center justify-center rounded-full bg-violet-600 px-7 py-4 text-base font-semibold text-white transition duration-300 hover:bg-violet-500"
                  >
                    Start Shipping
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-full border border-slate-700 px-7 py-4 text-base text-slate-200 transition duration-300 hover:border-violet-400 hover:text-violet-300"
                  >
                    Sign Up Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
