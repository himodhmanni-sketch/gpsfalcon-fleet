/**
 * API and Gateway Configuration
 * Reads from Vite environment variables with fallback to local development server.
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export const API_ENDPOINTS = {
  login: `${API_BASE}/api/auth/login`,
  register: `${API_BASE}/api/auth/register`,
  me: `${API_BASE}/api/auth/me`,
  devices: `${API_BASE}/api/devices`,
  geofences: `${API_BASE}/api/geofences`,
  events: `${API_BASE}/api/events`,
  clients: `${API_BASE}/api/clients`,
  expenses: `${API_BASE}/api/expenses`,
  protocols: `${API_BASE}/api/protocols`,
  command: `${API_BASE}/api/command`,
  history: (imei, limit = 500) => `${API_BASE}/api/history/${imei}?limit=${limit}`
};
