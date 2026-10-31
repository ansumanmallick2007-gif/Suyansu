import axios from 'axios';
import {
  User,
  Document,
  Workflow,
  AuditLog,
  AnalyticsSummary,
  DepartmentType,
  TaskPriority,
  TaskStatus
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('synapse_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthorized to clear expired session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('synapse_auth_token');
        localStorage.removeItem('synapse_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ message: string; token: string; user: User }>('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: { name: string; email: string; password: string; department: string; role?: string }) => {
    const res = await api.post<{ message: string; token: string; user: User }>('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>('/users/me');
    return res.data.user;
  },
  getUsers: async () => {
    const res = await api.get<{ users: User[] }>('/users/users');
    return res.data.users;
  }
};

// Document endpoints
export const documentApi = {
  getDocuments: async (department?: DepartmentType) => {
    const res = await api.get<{ documents: Document[]; count: number }>('/documents', {
      params: department ? { department } : {}
    });
    return res.data.documents;
  },
  getDocument: async (id: string) => {
    const res = await api.get<{ document: Document }>(`/documents/${id}`);
    return res.data.document;
  },
  uploadDocument: async (data: {
    title: string;
    department: DepartmentType;
    file_type: string;
    raw_content: string;
  }) => {
    const res = await api.post<{ message: string; document: Document }>('/documents', data);
    return res.data;
  }
};

// Workflow endpoints
export const workflowApi = {
  getWorkflows: async (department?: DepartmentType) => {
    const res = await api.get<{ workflows: Workflow[]; count: number }>('/workflows', {
      params: department ? { department } : {}
    });
    return res.data.workflows;
  },
  createWorkflow: async (data: {
    title: string;
    description?: string;
    department: DepartmentType;
    priority: TaskPriority;
    dueDate?: string;
    assignedTo?: string | null;
  }) => {
    const res = await api.post<{ message: string; workflow: Workflow }>('/workflows', data);
    return res.data;
  },
  updateWorkflow: async (id: string, updates: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string | null;
    ai_suggestions?: any;
    title?: string;
    description?: string;
  }) => {
    const res = await api.patch<{ message: string; workflow: Workflow }>(`/workflows/${id}`, updates);
    return res.data;
  },
  deleteWorkflow: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/workflows/${id}`);
    return res.data;
  }
};

// Copilot endpoints
export const copilotApi = {
  query: async (query: string) => {
    const res = await api.post<{
      query: string;
      answer: string;
      citations: Array<{ title: string; department: string; type: string }>;
      confidence: number;
      suggestedFollowUps: string[];
      timestamp: string;
    }>('/ai/copilot', { query });
    return res.data;
  }
};

// Analytics endpoints
export const analyticsApi = {
  getSummary: async () => {
    const res = await api.get<AnalyticsSummary>('/analytics/summary');
    return res.data;
  }
};

// Audit logs
export const auditApi = {
  getLogs: async (limit = 50, action?: string) => {
    const res = await api.get<{ logs: AuditLog[]; total: number }>('/audit-logs', {
      params: { limit, action }
    });
    return res.data;
  }
};

// Reports
export const reportApi = {
  generateReport: async () => {
    const res = await api.post<{
      report: string;
      generatedAt: string;
      generatedBy: string;
      stats: { totalDocuments: number; totalWorkflows: number; completionRate: number };
    }>('/reports/generate');
    return res.data;
  }
};

export default api;
