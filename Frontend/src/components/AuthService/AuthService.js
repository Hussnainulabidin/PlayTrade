import axios from "axios"

const API_URL = "http://localhost:3003"

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem("token")

// Set auth token for all requests
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common["Authorization"]
  }
}

// Initialize auth header from localStorage
const initAuthHeader = () => {
  const token = getToken()
  if (token) {
    setAuthHeader(token)
  }
}

// Login user
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password,
    })

    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      setAuthHeader(response.data.token)
      return response.data
    }

    return null
  } catch (error) {
    throw error
  }
}

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/signup`, userData)

    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      setAuthHeader(response.data.token)
      return response.data
    }

    return null
  } catch (error) {
    throw error
  }
}

// Get current user profile
const getCurrentUser = async () => {
  try {
    const token = getToken()
    if (!token) return null

    const response = await axios.get(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

// Logout user
const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("userRole")
  setAuthHeader(null)
}

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken()
}

const AuthService = {
  login,
  register,
  getCurrentUser,
  logout,
  isAuthenticated,
  initAuthHeader,
}

export default AuthService

