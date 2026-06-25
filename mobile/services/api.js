import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://omniagents-zycdtw8o.manus.space/api/trpc';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(`${API_BASE_URL}/auth.refreshToken`, {});
        const { token } = response.data.result.data;

        // Store new token
        await AsyncStorage.setItem('auth_token', token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');
        // Trigger logout event (implement in your app)
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Chat API endpoints
export const chatAPI = {
  sendMessage: (message, projectId = null) =>
    apiClient.post('/chat.sendMessage', { message, projectId }),
  getHistory: (limit = 50, offset = 0) =>
    apiClient.post('/chat.getHistory', { limit, offset }),
  clearHistory: () =>
    apiClient.post('/chat.clearHistory', {}),
  createSession: (name, projectId = null) =>
    apiClient.post('/chat.createSession', { name, projectId }),
  getSessions: () =>
    apiClient.post('/chat.getSessions', {}),
};

// Agents API endpoints
export const agentsAPI = {
  list: (filters = {}) =>
    apiClient.post('/agents.list', filters),
  get: (id) =>
    apiClient.post('/agents.get', { id }),
  create: (data) =>
    apiClient.post('/agents.create', data),
  update: (id, data) =>
    apiClient.post('/agents.update', { id, ...data }),
  delete: (id) =>
    apiClient.post('/agents.delete', { id }),
  execute: (id, action, params = {}) =>
    apiClient.post('/agents.execute', { id, action, params }),
};

// Tasks API endpoints
export const tasksAPI = {
  list: (filters = {}) =>
    apiClient.post('/tasks.list', filters),
  get: (id) =>
    apiClient.post('/tasks.get', { id }),
  create: (data) =>
    apiClient.post('/tasks.create', data),
  update: (id, data) =>
    apiClient.post('/tasks.update', { id, ...data }),
  delete: (id) =>
    apiClient.post('/tasks.delete', { id }),
  updateStatus: (id, status) =>
    apiClient.post('/tasks.updateStatus', { id, status }),
};

// Projects API endpoints
export const projectsAPI = {
  list: () =>
    apiClient.post('/projects.list', {}),
  get: (id) =>
    apiClient.post('/projects.get', { id }),
  create: (data) =>
    apiClient.post('/projects.create', data),
  update: (id, data) =>
    apiClient.post('/projects.update', { id, ...data }),
  delete: (id) =>
    apiClient.post('/projects.delete', { id }),
  addMember: (projectId, userId, role = 'member') =>
    apiClient.post('/projects.addMember', { projectId, userId, role }),
};

// Connectors API endpoints
export const connectorsAPI = {
  list: () =>
    apiClient.post('/connectorsManagement.list', {}),
  get: (id) =>
    apiClient.post('/connectorsManagement.get', { id }),
  authenticate: (connectorId, credentials) =>
    apiClient.post('/connectorsManagement.authenticate', { connectorId, credentials }),
  sync: (connectorId) =>
    apiClient.post('/connectorsManagement.sync', { connectorId }),
  disconnect: (connectorId) =>
    apiClient.post('/connectorsManagement.disconnect', { connectorId }),
};

// Knowledge API endpoints
export const knowledgeAPI = {
  search: (query, limit = 20) =>
    apiClient.post('/knowledge.search', { query, limit }),
  getCollections: () =>
    apiClient.post('/knowledge.getCollections', {}),
  createCollection: (name, description) =>
    apiClient.post('/knowledge.createCollection', { name, description }),
  addDocument: (collectionId, document) =>
    apiClient.post('/knowledge.addDocument', { collectionId, document }),
};

// Marketplace API endpoints
export const marketplaceAPI = {
  listAgents: (filters = {}) =>
    apiClient.post('/marketplace.listAgents', filters),
  listSkills: (filters = {}) =>
    apiClient.post('/marketplace.listSkills', filters),
  installAgent: (agentId) =>
    apiClient.post('/marketplace.installAgent', { agentId }),
  installSkill: (skillId) =>
    apiClient.post('/marketplace.installSkill', { skillId }),
};

// Auth API endpoints
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth.login', { email, password }),
  logout: () =>
    apiClient.post('/auth.logout', {}),
  me: () =>
    apiClient.post('/auth.me', {}),
  refreshToken: () =>
    apiClient.post('/auth.refreshToken', {}),
  loginWithManus: (code) =>
    apiClient.post('/auth.loginWithManus', { code }),
};

export default apiClient;
