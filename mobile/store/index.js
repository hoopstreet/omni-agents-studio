import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, chatAPI, agentsAPI, tasksAPI, projectsAPI, connectorsAPI, knowledgeAPI } from '../services/api';

export const useStore = create((set, get) => ({
  // ============ Auth State ============
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ============ Data State ============
  chats: [],
  agents: [],
  tasks: [],
  projects: [],
  connectors: [],
  knowledge: [],

  // ============ UI State ============
  selectedProject: null,
  selectedAgent: null,
  activeTab: 'chat',

  // ============ Auth Actions ============
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.result.data;

      // Store credentials
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authAPI.logout();
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        chats: [],
        agents: [],
        tasks: [],
        projects: [],
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          token,
          user,
          isAuthenticated: true,
        });

        // Verify token is still valid
        try {
          const response = await authAPI.me();
          set({ user: response.data.result.data });
        } catch (error) {
          // Token invalid, clear session
          await get().logout();
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  },

  // ============ Chat Actions ============
  fetchChats: async () => {
    try {
      const response = await chatAPI.getHistory(50, 0);
      set({ chats: response.data.result.data });
    } catch (error) {
      set({ error: 'Failed to fetch chats' });
      console.error('Error fetching chats:', error);
    }
  },

  sendMessage: async (message) => {
    try {
      const response = await chatAPI.sendMessage(message);
      set((state) => ({
        chats: [...state.chats, response.data.result.data],
      }));
      return response.data.result.data;
    } catch (error) {
      set({ error: 'Failed to send message' });
      console.error('Error sending message:', error);
      throw error;
    }
  },

  clearChats: async () => {
    try {
      await chatAPI.clearHistory();
      set({ chats: [] });
    } catch (error) {
      set({ error: 'Failed to clear chats' });
      console.error('Error clearing chats:', error);
    }
  },

  // ============ Agents Actions ============
  fetchAgents: async (filters = {}) => {
    try {
      const response = await agentsAPI.list(filters);
      set({ agents: response.data.result.data });
    } catch (error) {
      set({ error: 'Failed to fetch agents' });
      console.error('Error fetching agents:', error);
    }
  },

  createAgent: async (agentData) => {
    try {
      const response = await agentsAPI.create(agentData);
      set((state) => ({
        agents: [...state.agents, response.data.result.data],
      }));
      return response.data.result.data;
    } catch (error) {
      set({ error: 'Failed to create agent' });
      console.error('Error creating agent:', error);
      throw error;
    }
  },

  updateAgent: async (id, agentData) => {
    try {
      const response = await agentsAPI.update(id, agentData);
      set((state) => ({
        agents: state.agents.map((a) => (a.id === id ? response.data.result.data : a)),
      }));
      return response.data.result.data;
    } catch (error) {
      set({ error: 'Failed to update agent' });
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  deleteAgent: async (id) => {
    try {
      await agentsAPI.delete(id);
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete agent' });
      console.error('Error deleting agent:', error);
      throw error;
    }
  },

  // ============ Tasks Actions ============
  fetchTasks: async (filters = {}) => {
    try {
      const response = await tasksAPI.list(filters);
      set({ tasks: response.data.result.data });
    } catch (error) {
      set({ error: 'Failed to fetch tasks' });
      console.error('Error fetching tasks:', error);
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await tasksAPI.create(taskData);
      set((state) => ({
        tasks: [...state.tasks, response.data.result.data],
      }));
      return response.data.result.data;
    } catch (error) {
      set({ error: 'Failed to create task' });
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const response = await tasksAPI.updateStatus(id, status);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? response.data.result.data : t)),
      }));
      return response.data.result.data;
    } catch (error) {
      set({ error: 'Failed to update task status' });
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  // ============ Projects Actions ============
  fetchProjects: async () => {
    try {
      const response = await projectsAPI.list();
      set({ projects: response.data.result.data });
    } catch (error) {
      set({ error: 'Failed to fetch projects' });
      console.error('Error fetching projects:', error);
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await projectsAPI.create(projectData);
      set((state) => ({
        projects: [...state.projects, response.data.result.data],
      }));
      return response.data.result.data;
    } catch (error) {
      set({ error: 'Failed to create project' });
      console.error('Error creating project:', error);
      throw error;
    }
  },

  selectProject: (projectId) => {
    set({ selectedProject: projectId });
  },

  // ============ Connectors Actions ============
  fetchConnectors: async () => {
    try {
      const response = await connectorsAPI.list();
      set({ connectors: response.data.result.data });
    } catch (error) {
      set({ error: 'Failed to fetch connectors' });
      console.error('Error fetching connectors:', error);
    }
  },

  authenticateConnector: async (connectorId, credentials) => {
    try {
      const response = await connectorsAPI.authenticate(connectorId, credentials);
      set((state) => ({
        connectors: state.connectors.map((c) =>
          c.id === connectorId ? response.data.result.data : c
        ),
      }));
      return response.data.result.data;
    } catch (error) {
      set({ error: 'Failed to authenticate connector' });
      console.error('Error authenticating connector:', error);
      throw error;
    }
  },

  // ============ UI Actions ============
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  clearError: () => {
    set({ error: null });
  },

  // ============ Initialization ============
  initialize: async () => {
    await get().restoreSession();
    if (get().isAuthenticated) {
      await get().fetchChats();
      await get().fetchAgents();
      await get().fetchTasks();
      await get().fetchProjects();
      await get().fetchConnectors();
    }
  },
}));
