import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../AuthService/AuthService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      
      if (storedToken && storedUserId) {
        AuthService.initAuthHeader(storedToken);
        const authenticated = AuthService.isAuthenticated(storedToken);
        setIsAuthenticated(authenticated);
        setToken(storedToken);

        if (authenticated) {
          const userData = await AuthService.getCurrentUser(storedToken);
          if (userData) {
            // Store the fetched user data in context
            setUser(userData);
          } else {
            // If no user data is returned (token might be invalid), clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setIsAuthenticated(false);
            setToken(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear storage on error to prevent invalid state
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setIsAuthenticated(false);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    if (!userData) {
      console.error('Login failed: No user data provided');
      return;
    }
    
    console.log('Logging in user:', userData);
    
    // Store user data in state
    setUser(userData);
    setToken(userData.token);
    setIsAuthenticated(true);
    
    // Initialize auth headers for API calls
    AuthService.initAuthHeader(userData.token);
    
    // Store only essential authentication data
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userId", userData._id);
    
    return userData;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  const updateUser = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData
    }));
    if (newUserData._id) {
      localStorage.setItem("userId", newUserData._id);
    }
  };

  const value = {
    user,
    token,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    initializeAuth
  };

  return (
    <UserContext.Provider value={value}>
      {!isLoading && children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};