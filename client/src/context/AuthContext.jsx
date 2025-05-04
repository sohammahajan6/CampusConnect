import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token expiration
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token expired
          localStorage.removeItem('token');
          setCurrentUser(null);
        } else {
          // Set auth header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Fetch current user data
          fetchCurrentUser();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login with:', { email });

      // Add a timeout to ensure we don't hang indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password
        }, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Login response:', response.data);

        const { token, user } = response.data;

        // Save token to localStorage
        localStorage.setItem('token', token);

        // Set auth header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Set user in state
        setCurrentUser(user);

        return user;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (error.name === 'AbortError') {
        setError('Login request timed out. Please check your connection and try again.');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        setError(error.response.data?.message || `Login failed with status: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setError('No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError(`Login failed: ${error.message}`);
      }
      throw error;
    }
  };

  const register = async (name, email, password, role = 'student') => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role
      });

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Set auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user in state
      setCurrentUser(user);

      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];

    // Clear user from state
    setCurrentUser(null);
  };

  const hasRole = (roles) => {
    if (!currentUser) return false;
    if (!roles) return true;

    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }

    return currentUser.role === roles;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      error,
      login,
      register,
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
