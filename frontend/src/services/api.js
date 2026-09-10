import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.';

    if (error.response?.status === 401) {
      localStorage.removeItem('cp_token');
      delete api.defaults.headers.common['Authorization'];
      const pub = ['/login', '/register', '/'];
      if (!pub.some((p) => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
    }

    const enhanced = new Error(message);
    enhanced.status = error.response?.status;
    enhanced.data   = error.response?.data;
    return Promise.reject(enhanced);
  }
);

export default api;
