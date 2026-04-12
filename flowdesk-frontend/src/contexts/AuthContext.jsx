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
  const [isHydrated, setIsHydrated] = useState(() => {
    const persistApi = useAuthStore.persist;
    return persistApi?.hasHydrated ? persistApi.hasHydrated() : true;
  });

  // isLoading = true while we're checking if a stored token is still valid
  // This prevents a flash of the login page on refresh when user IS logged in
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    if (!persistApi?.onFinishHydration) {
      setIsHydrated(true);
      return undefined;
    }

    if (persistApi.hasHydrated()) {
      setIsHydrated(true);
    }

    const unsubscribe = persistApi.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  // Restore session from token on app load
  useEffect(() => {
    if (!isHydrated) {
      setIsLoading(true);
      return;
    }

    if (token && !user) {
      // Token exists but user info is missing, try to fetch user data
      const restoreSession = async () => {
        try {
          const res = await api.get('/api/auth/me');
          setAuth(token, res.data);
        } catch (err) {
          console.warn('Session restoration failed:', err);
          clearAuth();
        } finally {
          setIsLoading(false);
        }
      };
      restoreSession();
    } else {
      setIsLoading(false);
    }
  }, [token, user, isHydrated, setAuth, clearAuth]);

  // login() — called by the Login page form submit
  // Takes email + password, hits the backend, stores the result
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, ...user } = res.data;

      // Store in Zustand — Axios interceptor will now attach this to every request
      setAuth(token, user);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  }, [setAuth]);

  // register() — added for Phase 2
  const register = useCallback(async (data) => {
    try {
      const res = await api.post('/api/auth/register', data);
      const { token, ...user } = res.data;
      setAuth(token, user);
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  }, [setAuth]);

  // logout() — called by sidebar logout button
  const logout = useCallback(() => {
    clearAuth();
    // In Phase 2, we could also call api.post('/api/auth/logout') if tracking tokens
  }, [clearAuth]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,  // true if token exists, false if null
    isLoading,
    login,
    register,
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