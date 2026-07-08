const DEFAULT_API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

// Helper to get auth header
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Generic fetch handler
const request = async (endpoint: string, options: RequestInit = {}, isMultipart = false) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(isMultipart),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json().catch(() => null);
};

export const api = {
  // Auth API
  auth: {
    login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    googleLogin: (data: { email: string; fullName?: string; role?: string; avatarUrl?: string }) => request('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me', { method: 'GET' }),
  },

  // Documents (Knowledge Base) API
  documents: {
    list: () => request('/documents', { method: 'GET' }),
    upload: (formData: FormData) => request('/documents/upload', { method: 'POST', body: formData }, true),
    generate: (type: string, data: any) => request('/documents/generate', { method: 'POST', body: JSON.stringify({ type, data }) }),
    delete: (id: string) => request(`/documents/${id}`, { method: 'DELETE' }),
  },

  // Chat API
  chat: {
    listSessions: () => request('/chat/sessions', { method: 'GET' }),
    createSession: (title?: string) => request('/chat/sessions', { method: 'POST', body: JSON.stringify({ title }) }),
    listMessages: (sessionId: string) => request(`/chat/sessions/${sessionId}/messages`, { method: 'GET' }),
    sendMessage: (sessionId: string, content: string) => request(`/chat/sessions/${sessionId}/message`, { method: 'POST', body: JSON.stringify({ content }) }),
    deleteSession: (id: string) => request(`/chat/sessions/${id}`, { method: 'DELETE' }),
  },

  // Workflows Automation API
  workflows: {
    list: () => request('/workflows', { method: 'GET' }),
    create: (workflow: any) => request('/workflows', { method: 'POST', body: JSON.stringify(workflow) }),
    update: (id: string, workflow: any) => request(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(workflow) }),
    delete: (id: string) => request(`/workflows/${id}`, { method: 'DELETE' }),
    execute: (id: string, initialData: any) => request(`/workflows/${id}/execute`, { method: 'POST', body: JSON.stringify({ initialData }) }),
    listLogs: () => request('/workflows/logs', { method: 'GET' }),
    listApprovals: () => request('/workflows/approvals', { method: 'GET' }),
    resolveApproval: (id: string, status: 'approved' | 'rejected', comments: string) => request(`/workflows/approvals/${id}/resolve`, { method: 'POST', body: JSON.stringify({ status, comments }) }),
  },

  // Analytics API
  analytics: {
    get: () => request('/analytics', { method: 'GET' }),
  },

  // Notifications API
  notifications: {
    list: () => request('/notifications', { method: 'GET' }),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    delete: (id: string) => request(`/notifications/${id}`, { method: 'DELETE' }),
  },

  // User Management API
  users: {
    list: () => request('/users', { method: 'GET' }),
    updateRole: (id: string, role: string) => request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    audits: () => request('/users/audits', { method: 'GET' }),
  },

  // Business Operating System API
  business: {
    tasks: {
      list: () => request('/business/tasks', { method: 'GET' }),
      create: (task: any) => request('/business/tasks', { method: 'POST', body: JSON.stringify(task) }),
      update: (id: string, task: any) => request(`/business/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
      delete: (id: string) => request(`/business/tasks/${id}`, { method: 'DELETE' }),
    },
    leaves: {
      list: () => request('/business/leaves', { method: 'GET' }),
      create: (leave: any) => request('/business/leaves', { method: 'POST', body: JSON.stringify(leave) }),
      resolve: (id: string, status: 'approved' | 'rejected') => request(`/business/leaves/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    },
    expenses: {
      list: () => request('/business/expenses', { method: 'GET' }),
      create: (expense: any) => request('/business/expenses', { method: 'POST', body: JSON.stringify(expense) }),
    },
    leads: {
      list: () => request('/business/leads', { method: 'GET' }),
      create: (lead: any) => request('/business/leads', { method: 'POST', body: JSON.stringify(lead) }),
      update: (id: string, lead: any) => request(`/business/leads/${id}`, { method: 'PUT', body: JSON.stringify(lead) }),
    }
  },

  // Global Natural Language Search
  search: (query: string) => request(`/search?q=${encodeURIComponent(query)}`, { method: 'GET' }),
};
