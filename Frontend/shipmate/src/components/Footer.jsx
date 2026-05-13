import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="text-2xl font-bold text-violet-400 tracking-wide">
            ShipMate
          </Link>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Fast, secure and modern shipping tools built to keep your cargo moving with confidence.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li>
              <Link to="/quote" className="hover:text-violet-400 transition duration-300">
                Get a Quote
              </Link>
            </li>
            <li>
              <Link to="/track-shipment" className="hover:text-violet-400 transition duration-300">
                Track Shipment
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-violet-400 transition duration-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/create-shipment" className="hover:text-violet-400 transition duration-300">
                Create Shipment
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
          <p className="text-slate-400 text-sm">support@shipmate.com</p>
          <p className="text-slate-400 text-sm mt-2">+1 (800) 555-0123</p>
          <div className="mt-4 flex items-center gap-3">
            <a href="#" className="text-slate-400 hover:text-violet-400 transition duration-300">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-violet-400 transition duration-300">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-violet-400 transition duration-300">Instagram</a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ShipMate. All rights reserved.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link to="/" className="hover:text-violet-400 transition duration-300">Privacy Policy</Link>
            <Link to="/" className="hover:text-violet-400 transition duration-300">Terms of Service</Link>
            <Link to="/" className="hover:text-violet-400 transition duration-300">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
