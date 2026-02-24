// AuthContext.jsx — FlowDesk Member 1
// Provides auth state and actions to all React components via useAuth() hook.
//
// WHY a Context on top of Zustand?
//   - Zustand stores raw token/user data
//   - AuthContext adds LOGIC: login(), logout(), isAuthenticated
//   - Components get a clean, semantic API instead of raw store access
//   - The Axios interceptor reads Zustand directly (can't use React hooks)

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';

// 1. Create the context object
const AuthContext = createContext(null);

// 2. Provider component — wraps the whole app (added in App.jsx)
export function AuthProvider({ children }) {
  const { token, user, setAuth, clearAuth } = useAuthStore();

  // isLoading = true while we're checking if a stored token is still valid
  // This prevents a flash of the login page on refresh when user IS logged in
  const [isLoading, setIsLoading] = useState(false);

  // login() — called by the Login page form submit
  // Takes email + password, hits the backend, stores the result
  const login = useCallback(async (email, password) => {
    // Phase 1: Simulate a successful login with mock data
    // Phase 2: Replace with → const res = await api.post('/api/auth/login', { email, password });
    await new Promise((r) => setTimeout(r, 800)); // simulate network delay

    const mockToken = 'mock-jwt-token-phase1';
    const mockUser = {
      id: '1',
      email,
      name: 'Demo User',
      role: 'ADMIN',
      tenantId: 'org_demo',
    };

    // Store in Zustand — Axios interceptor will now attach this to every request
    setAuth(mockToken, mockUser);
  }, [setAuth]);

  // logout() — called by sidebar logout button (Phase 2)
  const logout = useCallback(() => {
    clearAuth();
    // Phase 2: also call api.post('/api/auth/logout') to blacklist token server-side
  }, [clearAuth]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,  // true if token exists, false if null
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook — this is what every component imports
// WHY a custom hook? So components don't need to import AuthContext directly.
// Usage: const { user, login, isAuthenticated } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Check your App.jsx.');
  }
  return context;
}