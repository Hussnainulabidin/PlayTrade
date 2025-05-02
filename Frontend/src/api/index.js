import axios from 'axios';

// Base API configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - adds auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors like 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token logic
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Import all API modules
import userApi from './userApi';
import orderApi from './orderApi';
import chatApi from './chatApi';
import ticketApi from './ticketApi';
import walletApi from './walletApi';
import gameAccountApi from './gameAccountApi';

// Export the base API instance
export default API;

// Export all API modules
export {
  userApi,
  orderApi,
  chatApi,
  ticketApi,
  walletApi,
  gameAccountApi
}; 