# Omni-Agents Studio - Android API Integration Guide

## Overview

This guide explains how to integrate the Android React Native application with the Omni-Agents Studio backend API. The backend is built with tRPC and provides type-safe API endpoints for all platform features.

## Backend API Details

**Base URL:** `https://omniagents-zycdtw8o.manus.space/api/trpc`

**Authentication:** OAuth 2.0 with Manus authentication system

**Protocol:** tRPC (TypeScript RPC) with JSON-RPC 2.0

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Android React Native App                        │
│  (Chat, Agents, Tasks, Projects, Settings)             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTPS/tRPC
                       │
┌──────────────────────▼──────────────────────────────────┐
│      Omni-Agents Studio Backend (tRPC)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Authentication Layer (Manus OAuth)                │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ tRPC Routers:                                      │ │
│  │ • chat.router.ts                                  │ │
│  │ • agents.router.ts                                │ │
│  │ • tasks.router.ts                                 │ │
│  │ • projects.router.ts                              │ │
│  │ • connectors.router.ts                            │ │
│  │ • knowledge.router.ts                             │ │
│  │ • marketplace.router.ts                           │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Database Layer (Supabase PostgreSQL)              │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## API Service Layer

### 1. Authentication Service

**File:** `services/auth.js`

```javascript
import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth.login', {
        email,
        password,
      });
      
      const { token, user } = response.data.result.data;
      
      // Store token securely
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/auth.logout', {});
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.post('/auth.me', {});
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch current user');
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth.refreshToken', {});
      const { token } = response.data.result.data;
      await AsyncStorage.setItem('auth_token', token);
      return token;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  // OAuth login with Manus
  loginWithManus: async (code) => {
    try {
      const response = await apiClient.post('/auth.loginWithManus', {
        code,
      });
      
      const { token, user } = response.data.result.data;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw new Error('Manus login failed');
    }
  },
};
```

### 2. Chat Service

**File:** `services/chat.js`

```javascript
import apiClient from './api';

export const chatService = {
  // Send a message
  sendMessage: async (message, projectId = null) => {
    try {
      const response = await apiClient.post('/chat.sendMessage', {
        message,
        projectId,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  // Get chat history
  getHistory: async (limit = 50, offset = 0) => {
    try {
      const response = await apiClient.post('/chat.getHistory', {
        limit,
        offset,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch chat history');
    }
  },

  // Clear chat history
  clearHistory: async () => {
    try {
      await apiClient.post('/chat.clearHistory', {});
    } catch (error) {
      throw new Error('Failed to clear chat history');
    }
  },

  // Create a new chat session
  createSession: async (name, projectId = null) => {
    try {
      const response = await apiClient.post('/chat.createSession', {
        name,
        projectId,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to create chat session');
    }
  },

  // Get chat sessions
  getSessions: async () => {
    try {
      const response = await apiClient.post('/chat.getSessions', {});
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch chat sessions');
    }
  },
};
```

### 3. Agents Service

**File:** `services/agents.js`

```javascript
import apiClient from './api';

export const agentsService = {
  // List all agents
  list: async (filters = {}) => {
    try {
      const response = await apiClient.post('/agents.list', filters);
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch agents');
    }
  },

  // Get agent details
  get: async (id) => {
    try {
      const response = await apiClient.post('/agents.get', { id });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch agent');
    }
  },

  // Create a new agent
  create: async (agentData) => {
    try {
      const response = await apiClient.post('/agents.create', agentData);
      return response.data.result.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create agent');
    }
  },

  // Update agent
  update: async (id, agentData) => {
    try {
      const response = await apiClient.post('/agents.update', {
        id,
        ...agentData,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to update agent');
    }
  },

  // Delete agent
  delete: async (id) => {
    try {
      await apiClient.post('/agents.delete', { id });
    } catch (error) {
      throw new Error('Failed to delete agent');
    }
  },

  // Execute agent action
  execute: async (id, action, params = {}) => {
    try {
      const response = await apiClient.post('/agents.execute', {
        id,
        action,
        params,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to execute agent action');
    }
  },
};
```

### 4. Tasks Service

**File:** `services/tasks.js`

```javascript
import apiClient from './api';

export const tasksService = {
  // List tasks with filters
  list: async (filters = {}) => {
    try {
      const response = await apiClient.post('/tasks.list', filters);
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch tasks');
    }
  },

  // Get task details
  get: async (id) => {
    try {
      const response = await apiClient.post('/tasks.get', { id });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch task');
    }
  },

  // Create a new task
  create: async (taskData) => {
    try {
      const response = await apiClient.post('/tasks.create', taskData);
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to create task');
    }
  },

  // Update task
  update: async (id, taskData) => {
    try {
      const response = await apiClient.post('/tasks.update', {
        id,
        ...taskData,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to update task');
    }
  },

  // Delete task
  delete: async (id) => {
    try {
      await apiClient.post('/tasks.delete', { id });
    } catch (error) {
      throw new Error('Failed to delete task');
    }
  },

  // Update task status
  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.post('/tasks.updateStatus', {
        id,
        status,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to update task status');
    }
  },
};
```

### 5. Projects Service

**File:** `services/projects.js`

```javascript
import apiClient from './api';

export const projectsService = {
  // List all projects
  list: async () => {
    try {
      const response = await apiClient.post('/projects.list', {});
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch projects');
    }
  },

  // Get project details
  get: async (id) => {
    try {
      const response = await apiClient.post('/projects.get', { id });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to fetch project');
    }
  },

  // Create a new project
  create: async (projectData) => {
    try {
      const response = await apiClient.post('/projects.create', projectData);
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to create project');
    }
  },

  // Update project
  update: async (id, projectData) => {
    try {
      const response = await apiClient.post('/projects.update', {
        id,
        ...projectData,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to update project');
    }
  },

  // Delete project
  delete: async (id) => {
    try {
      await apiClient.post('/projects.delete', { id });
    } catch (error) {
      throw new Error('Failed to delete project');
    }
  },

  // Add member to project
  addMember: async (projectId, userId, role = 'member') => {
    try {
      const response = await apiClient.post('/projects.addMember', {
        projectId,
        userId,
        role,
      });
      return response.data.result.data;
    } catch (error) {
      throw new Error('Failed to add member to project');
    }
  },
};
```

## State Management with Zustand

**File:** `store/index.js`

```javascript
import { create } from 'zustand';
import { authService } from '../services/auth';
import { chatService } from '../services/chat';
import { agentsService } from '../services/agents';
import { tasksService } from '../services/tasks';
import { projectsService } from '../services/projects';

export const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Data state
  chats: [],
  agents: [],
  tasks: [],
  projects: [],

  // Auth actions
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, user } = await authService.login(email, password);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Chat actions
  fetchChats: async () => {
    try {
      const chats = await chatService.getHistory();
      set({ chats });
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  },

  sendMessage: async (message) => {
    try {
      const response = await chatService.sendMessage(message);
      set((state) => ({
        chats: [...state.chats, response],
      }));
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Agents actions
  fetchAgents: async () => {
    try {
      const agents = await agentsService.list();
      set({ agents });
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  },

  // Tasks actions
  fetchTasks: async (filters = {}) => {
    try {
      const tasks = await tasksService.list(filters);
      set({ tasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  },

  // Projects actions
  fetchProjects: async () => {
    try {
      const projects = await projectsService.list();
      set({ projects });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  },
}));
```

## API Request/Response Format

### Request Format

All requests follow the tRPC JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "method": "POST",
  "params": {
    "message": "Hello, world!",
    "projectId": "proj_123"
  }
}
```

### Response Format

Successful responses:

```json
{
  "result": {
    "data": {
      "id": "msg_123",
      "text": "Hello, world!",
      "createdAt": "2026-06-25T04:00:00Z"
    }
  }
}
```

Error responses:

```json
{
  "error": {
    "code": -32603,
    "message": "Internal server error",
    "data": {
      "code": "INTERNAL_SERVER_ERROR"
    }
  }
}
```

## Error Handling

Implement comprehensive error handling:

```javascript
// In API service
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - refresh or redirect to login
      store.logout();
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Permission denied');
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);
```

## Authentication Flow

1. **User Login:** Send credentials to `/auth.login`
2. **Token Storage:** Store JWT token in AsyncStorage
3. **Token Injection:** Add token to all subsequent requests
4. **Token Refresh:** Automatically refresh expired tokens
5. **Logout:** Clear token and redirect to login

## Data Synchronization

Implement data sync for offline support:

```javascript
// Sync data when connection is restored
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      // Sync all pending changes
      syncPendingChanges();
    }
  });
  return unsubscribe;
}, []);
```

## Performance Optimization

1. **Pagination:** Implement limit/offset for large datasets
2. **Caching:** Use AsyncStorage for frequently accessed data
3. **Debouncing:** Debounce search and filter requests
4. **Lazy Loading:** Load data on-demand
5. **Compression:** Enable gzip compression for requests/responses

## Security Best Practices

1. **HTTPS Only:** All API calls use HTTPS
2. **Token Security:** Store tokens securely in AsyncStorage
3. **Certificate Pinning:** Implement SSL pinning for production
4. **Input Validation:** Validate all user inputs before sending
5. **XSS Prevention:** Sanitize all API responses
6. **CORS:** Backend handles CORS for mobile clients

## Testing API Integration

```javascript
// Example test
import { render, screen, waitFor } from '@testing-library/react-native';
import ChatScreen from '../screens/ChatScreen';

test('sends message and displays response', async () => {
  render(<ChatScreen />);
  
  const input = screen.getByPlaceholderText('Type your message...');
  fireEvent.changeText(input, 'Hello');
  fireEvent.press(screen.getByTestId('send-button'));
  
  await waitFor(() => {
    expect(screen.getByText('Hello')).toBeOnTheScreen();
  });
});
```

## Troubleshooting

### Connection Issues

- Verify backend is running: `curl https://omniagents-zycdtw8o.manus.space/api/trpc`
- Check network connectivity on device
- Verify API URL in app configuration
- Check firewall and proxy settings

### Authentication Errors

- Verify credentials are correct
- Check token expiration
- Clear AsyncStorage and re-login
- Verify OAuth configuration

### Data Sync Issues

- Check network connection
- Verify API response format
- Check for rate limiting
- Review server logs for errors

## Additional Resources

- Backend API Documentation: See `/home/ubuntu/omni-agents-studio/API_DOCUMENTATION.md`
- tRPC Documentation: https://trpc.io
- React Native Documentation: https://reactnative.dev
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
