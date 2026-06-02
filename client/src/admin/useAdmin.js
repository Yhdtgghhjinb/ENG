import axios from 'axios';

export const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'vtu-admin-2024';

export const adminApi = axios.create({ baseURL: '/api/admin' });

adminApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${ADMIN_TOKEN}`;
  return config;
});
