import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || 'Something went wrong.';
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message: msg, status: err.response?.status });
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export const queryAPI = {
  generate: (data) => api.post('/query/generate', data),
  explain: (sql) => api.post('/query/explain', { sql }),
  optimize: (sql, historyId) => api.post('/query/optimize', { sql, historyId }),
  autoFix: (sql, errorMessage) => api.post('/query/autofix', { sql, errorMessage }),
  detectDanger: (sql) => api.post('/query/danger', { sql }),
  analyzeDifficulty: (sql) => api.post('/query/difficulty', { sql })
};

export const historyAPI = {
  getAll: (params) => api.get('/history', { params }),
  getById: (id) => api.get(`/history/${id}`),
  getStats: () => api.get('/history/stats'),
  toggleFavorite: (id) => api.put(`/history/${id}/favorite`),
  delete: (id) => api.delete(`/history/${id}`),
  clearAll: () => api.delete('/history/clear/all')
};

export const savedAPI = {
  getAll: (params) => api.get('/saved', { params }),
  save: (data) => api.post('/saved', data),
  update: (id, data) => api.put(`/saved/${id}`, data),
  delete: (id) => api.delete(`/saved/${id}`),
  toggleFavorite: (id) => api.put(`/saved/${id}/favorite`)
};

export const schemaAPI = {
  getAll: () => api.get('/schema'),
  create: (data) => api.post('/schema', data),
  delete: (id) => api.delete(`/schema/${id}`)
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`)
};

export default api;
