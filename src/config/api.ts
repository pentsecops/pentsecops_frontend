export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091/api',
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      CHANGE_PASSWORD: '/auth/change-password'
    },
    ADMIN: {
      DASHBOARD: '/admin/dashboard',
      USERS: '/admin/users',
      PROJECTS: '/admin/projects',
      REPORTS: '/admin/reports',
      VULNERABILITIES: '/admin/vulnerabilities',
      NOTIFICATIONS: '/admin/notifications',
      DOMAINS: '/admin/domains',
      TASKS: '/admin/tasks'
    },
    PENTESTER: {
      DASHBOARD: '/pentester/dashboard',
      PROJECTS: '/pentester/projects',
      REPORTS: '/pentester/reports',
      TASKS: '/pentester/tasks',
      ALERTS: '/pentester/alerts'
    },
    STAKEHOLDER: {
      DASHBOARD: '/stakeholder/dashboard',
      REPORTS: '/stakeholder/reports',
      VULNERABILITIES: '/stakeholder/vulnerabilities'
    }
  }
};
