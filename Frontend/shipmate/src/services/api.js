const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw {
      status: response.status,
      ...data,
    }
  }

  return data
}

export const authAPI = {
  login: (email, password) =>
    apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (full_name, email, phone, password) =>
    apiCall('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ full_name, email, phone, password }),
    }),

  logout: () =>
    apiCall('/api/logout', {
      method: 'POST',
    }),

  googleLogin: (credential) =>
    apiCall('/api/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),

  getUser: () =>
    apiCall('/api/user', {
      method: 'GET',
    }),
}

export const adminAPI = {
  getUsers: () =>
    apiCall('/api/users', {
      method: 'GET',
    }),

  getDashboard: () =>
    apiCall('/api/admin/dashboard', {
      method: 'GET',
    }),

  getShipments: () =>
    apiCall('/api/admin/shipments', {
      method: 'GET',
    }),

  getAnalytics: () =>
    apiCall('/api/admin/analytics', {
      method: 'GET',
    }),

  getUser: (userId) =>
    apiCall(`/api/users/${userId}`, {
      method: 'GET',
    }),

  updateUserRole: (userId, role) =>
    apiCall(`/api/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  updateUserStatus: (userId, status) =>
    apiCall(`/api/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  setupAdmin: (email) =>
    apiCall('/api/setup-admin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
}

export const shipmentAPI = {
  createShipment: (shipmentData) =>
    apiCall('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    }),

  getShipments: () =>
    apiCall('/api/shipments', {
      method: 'GET',
    }),
}

export const addressAPI = {
  getAddresses: () =>
    apiCall('/api/addresses', {
      method: 'GET',
    }),

  createAddress: (addressData) =>
    apiCall('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),

  updateAddress: (addressId, addressData) =>
    apiCall(`/api/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),

  deleteAddress: (addressId) =>
    apiCall(`/api/addresses/${addressId}`, {
      method: 'DELETE',
    }),
}

export const quoteAPI = {
  createQuote: (quoteData) =>
    apiCall('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    }),
  getQuotes: () =>
    apiCall('/api/quotes', {
      method: 'GET',
    }),
  getQuote: (quoteId) =>
    apiCall(`/api/quotes/${quoteId}`, {
      method: 'GET',
    }),
}

export default apiCall
