// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5000/api',
  },
  production: {
    apiUrl: 'https://your-render-backend-url.onrender.com/api',
  },
};

// Determine current environment
const env = import.meta.env.MODE || 'development';

export default config[env];
