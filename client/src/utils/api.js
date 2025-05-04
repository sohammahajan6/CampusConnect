import axios from 'axios';
import config from '../config';

// Create an axios instance with the base URL from config
const api = axios.create({
  baseURL: config.apiUrl,
});

// Add a request interceptor to set the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
