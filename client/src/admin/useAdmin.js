import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'vtu-admin-2024';

export const adminApi = axios.create({ baseURL: `${API_URL}/api/admin` });

adminApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${ADMIN_TOKEN}`;
  return config;
});
