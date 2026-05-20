import api from './client'

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// Dashboard
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard'),
}

// Documents
export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getOne: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/documents/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/documents/${id}`),
}

// Subscriptions
export const subscriptionsAPI = {
  getAll: (params) => api.get('/subscriptions', { params }),
  getOne: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
  getAnalytics: () => api.get('/subscriptions/analytics'),
}

// Health
export const healthAPI = {
  getAll: (params) => api.get('/health', { params }),
  getOne: (id) => api.get(`/health/${id}`),
  create: (data) => api.post('/health', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/health/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/health/${id}`),
  getFamilyMembers: () => api.get('/health/family-members'),
}

// Vehicles
export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  addFuelLog: (id, data) => api.post(`/vehicles/${id}/fuel-log`, data),
  addService: (id, data) => api.post(`/vehicles/${id}/service`, data),
  getAnalytics: (id) => api.get(`/vehicles/${id}/analytics`),
}

// Warranties
export const warrantiesAPI = {
  getAll: (params) => api.get('/warranties', { params }),
  getOne: (id) => api.get(`/warranties/${id}`),
  create: (data) => api.post('/warranties', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/warranties/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/warranties/${id}`),
}

// Receipts
export const receiptsAPI = {
  getAll: (params) => api.get('/receipts', { params }),
  getOne: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/receipts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/receipts/${id}`),
  getFolders: () => api.get('/receipts/folders'),
}

// Deliveries
export const deliveriesAPI = {
  getAll: (params) => api.get('/deliveries', { params }),
  getOne: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  updateStatus: (id, status) => api.patch(`/deliveries/${id}/status`, { status }),
  delete: (id) => api.delete(`/deliveries/${id}`),
}

// Deadlines
export const deadlinesAPI = {
  getAll: (params) => api.get('/deadlines', { params }),
  getOne: (id) => api.get(`/deadlines/${id}`),
  create: (data) => api.post('/deadlines', data),
  update: (id, data) => api.put(`/deadlines/${id}`, data),
  complete: (id) => api.patch(`/deadlines/${id}/complete`),
  delete: (id) => api.delete(`/deadlines/${id}`),
}

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete('/notifications/clear-read'),
}

// Analytics
export const analyticsAPI = {
  getAll: () => api.get('/analytics'),
}
