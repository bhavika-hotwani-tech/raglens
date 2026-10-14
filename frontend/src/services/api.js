import axios from 'axios';

/**
 * Enterprise Axios Client configured for RAGLens API.
 * Pulls base URL from Vite environment variable with a clean fallback.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: Attach JWT token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('raglens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handler (e.g. 401 auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('raglens_token');
      localStorage.removeItem('raglens_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
