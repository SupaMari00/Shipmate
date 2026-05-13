import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { quoteAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const QuoteHistory = () => {
  const { user, loading } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const result = await quoteAPI.getQuotes()
        setQuotes(result.quotes || [])
      } catch (err) {
        setError(err?.error || 'Unable to load your quotes at this time.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuotes()
  }, [user])

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-5xl font-semibold mb-4">Quote History</h1>
          <p className="text-slate-400 text-lg">Review your submitted quote requests and estimated prices.</p>
        </div>

        {loading || isLoading ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 text-center text-slate-300">Loading your quotes...</div>
        ) : !user ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 text-center">
            <p className="text-slate-300 mb-4">You need to be logged in to view quote history.</p>
            <Link to="/login" className="inline-flex rounded-xl bg-violet-600 px-6 py-3 text-white font-semibold hover:bg-violet-500 transition">
              Log in to continue
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-950 border border-red-700 p-10 text-center text-red-200">{error}</div>
        ) : quotes.length === 0 ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 text-center text-slate-300">
            <p className="mb-4">You have not submitted any quote requests yet.</p>
            <Link to="/quote" className="inline-flex rounded-xl bg-violet-600 px-6 py-3 text-white font-semibold hover:bg-violet-500 transition">
              Request a Quote
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold">{quote.cargo_type.toUpperCase()} Quote</h2>
                    <p className="text-slate-400">Submitted {new Date(quote.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-slate-200 border border-slate-700">
                    <span className="text-slate-400">Status:</span>
                    <span className={quote.status === 'pending' ? 'text-yellow-300' : quote.status === 'accepted' ? 'text-emerald-300' : quote.status === 'rejected' ? 'text-red-300' : 'text-slate-200'}>{quote.status}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300 mb-6">
                  <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800">
                    <p className="text-slate-400 uppercase tracking-[0.2em] mb-2">Weight</p>
                    <p>{quote.weight} kg</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800">
                    <p className="text-slate-400 uppercase tracking-[0.2em] mb-2">Route</p>
                    <p>{quote.origin} → {quote.destination}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800">
                    <p className="text-slate-400 uppercase tracking-[0.2em] mb-2">Price</p>
                    <p>${quote.estimated_price?.toFixed(2) ?? 'TBD'}</p>
                  </div>
                </div>

                {quote.dimensions && (
                  <p className="text-slate-300 mb-3"><span className="text-slate-400">Dimensions:</span> {quote.dimensions}</p>
                )}
                {quote.notes && (
                  <p className="text-slate-300"><span className="text-slate-400">Notes:</span> {quote.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteHistory
