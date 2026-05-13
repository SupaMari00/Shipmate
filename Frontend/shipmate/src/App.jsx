import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './Pages/Home'
import Quote from './Pages/Quote'
import QuoteHistory from './Pages/QuoteHistory'
import Dashboard from './Pages/Dashboard'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import CreateShipment from './Pages/CreateShipment'
import AdminDashboard from './Pages/AdminDashboard'
import UserDetails from './Pages/UserDetails'
import SetupAdmin from './Pages/SetupAdmin'
import TrackShipment from './Pages/TrackShipment'
import RecentShipments from './Pages/RecentShipments'
import SavedAddresses from './Pages/SavedAddresses'
import AccountSettings from './Pages/AccountSettings'
import Footer from './components/Footer'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recent-shipments" element={<RecentShipments />} />
            <Route path="/saved-addresses" element={<SavedAddresses />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/track" element={<TrackShipment />} />
            <Route path="/track-shipment" element={<TrackShipment />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-shipment" element={<CreateShipment />} />
            <Route path="/quotes" element={<QuoteHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users/:id" element={<UserDetails />} />
            <Route path="/setup-admin" element={<SetupAdmin />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App