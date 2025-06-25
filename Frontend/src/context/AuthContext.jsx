import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL, getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/config';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data from localStorage first
          const userData = getUser();
          if (userData) {
            setUserState(userData);
          }

          // Verify token with backend
          const response = await axiosInstance.get('/auth/verify-token');
          if (response.data.user) {
            setUserState(response.data.user);
            setUser(response.data.user);
          } else {
            // If token is invalid, clear everything
            removeToken();
            removeUser();
            delete axios.defaults.headers.common['Authorization'];
            setUserState(null);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          // If there's an error, clear everything
          removeToken();
          removeUser();
          delete axios.defaults.headers.common['Authorization'];
          setUserState(null);
          setError(err.message);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token, userData) => {
    try {
      setToken(token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserState(userData);
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to process login');
      throw err;
    }
  };

  const logout = () => {
    try {
      removeToken();
      removeUser();
      delete axios.defaults.headers.common['Authorization'];
      setUserState(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to process logout');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 