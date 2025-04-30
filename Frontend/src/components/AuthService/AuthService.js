import axios from "axios";

const API_URL = "http://localhost:3003";

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

const initAuthHeader = (token) => {
  setAuthHeader(token);
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password,
    });

    // Check if 2FA is required
    if (response.data.requiresTwoFactor) {
      return {
        requiresTwoFactor: true,
        userId: response.data.userId,
        message: response.data.message
      };
    }

    if (response.data.token) {
      const userData = { ...response.data.data.user };
      delete userData.passwordResetToken;
      delete userData.passwordResetExpires;
      delete userData.password;
      
      setAuthHeader(response.data.token);
      userData.token = response.data.token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", userData._id);
      return userData;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const verifyTwoFactorCode = async (userId, verificationCode) => {
  try {
    const response = await axios.post(`${API_URL}/users/verify-2fa`, {
      userId,
      verificationCode
    });

    if (response.data.token) {
      const userData = { ...response.data.data.user };
      delete userData.passwordResetToken;
      delete userData.passwordResetExpires;
      delete userData.password;
      
      setAuthHeader(response.data.token);
      userData.token = response.data.token
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", userData._id);
      return userData;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/signup`, userData);

    if (response.data.token) {
      const user = { ...response.data.data.user };
      delete user.passwordResetToken;
      delete user.passwordResetExpires;
      delete user.password;
      
      setAuthHeader(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", user._id);
      return user;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const getCurrentUser = async (token) => {
  try {
    if (!token) return null;
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = { ...response.data.data };

    delete userData.passwordResetToken;
    delete userData.passwordResetExpires;
    delete userData.password;

    return userData;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

const logout = () => {
  setAuthHeader(null);
  localStorage.removeItem("userId");
  localStorage.removeItem("token");
};

const isAuthenticated = (token) => {
  return !!token;
};

const AuthService = {
  login,
  register,
  getCurrentUser,
  logout,
  isAuthenticated,
  initAuthHeader,
  verifyTwoFactorCode
};

export default AuthService;