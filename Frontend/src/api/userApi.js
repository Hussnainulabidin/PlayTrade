import API from './index';

const userApi = {
  // User authentication
  login: (credentials) => API.post('/users/login', credentials),
  signup: (userData) => API.post('/users/signup', userData),
  logout: () => API.post('/users/logout'),
  logoutAll: () => API.post('/users/logout-all'),
  
  // User profile
  getMe: () => API.get('/users/me'),
  updatePassword: (passwordData) => API.post('/users/update-password', passwordData),
  updateProfilePicture: (formData) => API.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // 2FA
  toggle2FA: (data) => API.post('/users/toggle-2fa', data),
  
  // Notification preferences
  updateNotificationPreferences: (preferences) => API.post('/users/update-notification-prefs', preferences),
  
  // Admin specific
  getSellers: () => API.get('/users/getSeller'),
  getSellerById: (id) => API.get(`/users/getSeller/${id}`),
};

export default userApi; 