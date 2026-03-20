// Base URL for backend API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  ADMIN_STAFF_LOGIN: '/api/auth/login',
  CREATE_STAFF: '/api/auth/create-staff',
  LIST_STAFF: '/api/auth/staff',                
  DELETE_STAFF: (id) => `/api/auth/staff/${id}`,  
  CUSTOMER_REGISTER: '/api/auth/customer/register',
  CUSTOMER_LOGIN: '/api/auth/customer/login',
};

// Machines
export const MACHINE_ENDPOINTS = {
  LIST: '/api/machines',
  AVAILABLE: '/api/machines/available',
  BY_ID: (id) => `/api/machines/${id}`,
};

// Customers
export const CUSTOMER_ENDPOINTS = {
  LIST: '/api/customers',
  BY_ID: (id) => `/api/customers/${id}`,
  RENTALS_BY_ID: (id) => `/api/customers/${id}/rentals`,
  PROFILE_ME: '/api/customers/profile/me',
  PROFILE_UPDATE: '/api/customers/profile/me',
  PROFILE_MY_RENTALS: '/api/customers/profile/my-rentals',
};

// Rentals
export const RENTAL_ENDPOINTS = {
  LIST: '/api/rentals',
  BY_ID: (id) => `/api/rentals/${id}`,
  CREATE_STAFF: '/api/rentals',
  UPDATE: (id) => `/api/rentals/${id}`,
  PAYMENT: (id) => `/api/rentals/${id}/payment`,
  REQUEST: '/api/rentals/request',
  MY_LIST: '/api/rentals/my/list',
  BILLING: (id) => `/api/rentals/${id}/billing`,
  BILLING_SUMMARY: '/api/rentals/billing/summary',
};

// Maintenance
export const MAINTENANCE_ENDPOINTS = {
  LIST: '/api/maintenance',
  BY_ID: (id) => `/api/maintenance/${id}`,
  CREATE: '/api/maintenance',
  UPDATE: (id) => `/api/maintenance/${id}`,
  DELETE: (id) => `/api/maintenance/${id}`,
};

// Reports
export const REPORT_ENDPOINTS = {
  RENTALS: '/api/reports/rentals',
  MACHINE_UTILIZATION: '/api/reports/machines/utilization',
  REVENUE: '/api/reports/revenue',
  CUSTOMER_RENTALS: (customerId) => `/api/reports/customers/${customerId}/rentals`,
};
