import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-5xl font-semibold text-center mb-16 animate-fade-in">
            Welcome,
            <span className="text-violet-400"> {user?.full_name || 'User'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition duration-300 animate-slide-up">
              <Link to="/recent-shipments" className="block">
                <h3 className="text-2xl mb-3 font-semibold text-white">
                  Recent Shipments
                </h3>
                <p className="text-slate-400 leading-6">
                  Review the latest deliveries, current status updates, and upcoming ETA details.
                </p>
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <Link to="/saved-addresses" className="block">
                <h3 className="text-2xl mb-3 font-semibold text-white">
                  Saved Addresses
                </h3>
                <p className="text-slate-400 leading-6">
                  Manage your most used pickup and delivery addresses for faster shipment creation.
                </p>
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Link to="/account-settings" className="block">
                <h3 className="text-2xl mb-3 font-semibold text-white">
                  Account Settings
                </h3>
                <p className="text-slate-400 leading-6">
                  Update your profile, security preferences, and notification settings.
                </p>
              </Link>
            </div>

          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl animate-slide-up" style={{animationDelay: '0.3s'}}>
            <h3 className="text-2xl font-semibold mb-6">
              Quick Actions
            </h3>

            <div className="flex gap-4 flex-wrap">
              <Link
            to="/create-shipment"
            className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl transition duration-300 font-semibold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30"
          >
            Create Shipment
          </Link>

              <Link
            to="/track-shipment"
            className="border border-slate-700 hover:border-violet-400 text-slate-200 hover:text-violet-300 px-6 py-3 rounded-xl transition duration-300 font-semibold"
          >
            Track Package
          </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default Dashboard