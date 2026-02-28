import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// 1. CREATE THE AXIOS INSTANCE
// WHY: We create a custom instance instead of using plain axios so we can
//      set a base URL once and add shared config (headers, timeouts, etc.)
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});
// 2. REQUEST INTERCEPTOR — The "Badge Stapler"
// WHY: Every request to the backend needs the JWT token.
//      Instead of manually adding it in every component,
//      we intercept EVERY outgoing request and attach it automatically.
// HOW: Axios calls this function BEFORE the request leaves the browser.
api.interceptors.request.use((config) => {
    // We use getState() — NOT useAuthStore() as a hook
    // WHY: Axios interceptors are NOT React components.
    //      React hooks can only be called inside React components.
    //      getState() lets us read Zustand outside of React. ← KEY CONCEPT
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // WHY "Bearer"? It's part of the OAuth2 spec.
        // The backend Spring Security parser expects this exact prefix.
    }

    return config; // MUST return config or the request gets swallowed!
});
// 3. RESPONSE INTERCEPTOR — The "Security Response Team"
// WHY: If the backend says 401 (token expired or missing),
//      we need to log the user out globally — from ONE place,
//      not in every single component's error handler.
api.interceptors.response.use(
    (response) => response, // Success? Just pass it through.
    (error) => {
        if (error.response?.status === 401) {
            // Clear the token from Zustand store
            useAuthStore.getState().clearAuth();
            // Redirect to login page
            // WHY window.location instead of useNavigate()?
            // Same reason — we're outside React here. useNavigate() is a hook.
            window.location.href = '/login';
        }
        // Still reject the promise so the component can handle other errors
        return Promise.reject(error);
    }
);
// 4. AUTH API HELPERS
// WHY: These are typed, named functions for Member 1's endpoints.
//      Components call authApi.login() instead of api.post('/api/auth/login')
//      This is cleaner and easier to update if the endpoint changes.
export const authApi = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    me: () => api.get('/api/auth/me'),
    logout: () => api.post('/api/auth/logout'),
};
export const activityApi = {
    getActivityFeed: (params) => api.get('/api/activity', { params }),
};

// 5b. PROJECT API HELPERS — Member 2
export const projectApi = {
    getAll: () => api.get('/api/projects'),
    getById: (id) => api.get(`/api/projects/${id}`),
    create: (data) => api.post('/api/projects', data),
    update: (id, data) => api.put(`/api/projects/${id}`, data),
    delete: (id) => api.delete(`/api/projects/${id}`),
    getMembers: (id) => api.get(`/api/projects/${id}/members`),
    addMember: (id, data) => api.post(`/api/projects/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/api/projects/${id}/members/${userId}`),
    updateRole: (id, userId, data) => api.put(`/api/projects/${id}/members/${userId}`, data),
};
// 5. QUERY KEYS — Centralized for TanStack Query
// WHY: Every useQuery call needs a key. Defining them here means
//      if a key changes, we update ONE place, not 10 components.
export const queryKeys = {
    dashboard: ['dashboard'],
    tasks: (projectId) => ['tasks', projectId],
    myTasks: ['my-tasks'],
    comments: (taskId) => ['comments', taskId],
    me: ['me'],
    activity: (params) => ['activity', params],
    tenants: ['tenants'],
    projects: ['projects'],
    project: (id) => ['project', id],
    projectMembers: (id) => ['project-members', id],
};
