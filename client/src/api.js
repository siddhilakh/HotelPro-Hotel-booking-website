import axios from 'axios';

// In production the API usually lives on another host: set VITE_API_URL (e.g. https://api.example.com) at build time.
const api = axios.create({ baseURL: `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const toISO = (d) => new Date(d).toISOString().slice(0, 10);

export const addDays = (iso, n) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export default api;
