export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// Endpoint paths are relative to API_BASE (used as axios baseURL).
// Do NOT include the /api prefix here — axios adds it automatically.
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  properties: '/properties',
  applications: '/applications',
  reviews: '/reviews',
  users: '/users',
  auditLogs: '/audit-logs',
  taxpayers: '/taxpayers',
  settings: '/settings',
} as const
