// authStore.js — FlowDesk Member 1
// Central Zustand store for authentication state.
// WHY: Any component in the app needs to know who is logged in.
//      Zustand gives us a global store without the complexity of Redux.
// HOW: Uses immer middleware so we can write "mutating" style updates
//      that are actually immutable under the hood.

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useAuthStore = create()(
  immer((set) => ({
    // The JWT token string — null means "not logged in"
    token: null,

    // The logged-in user's profile (id, name, email, role, tenantId)
    user: null,

    // Called after successful login — stores both token and user together
    setAuth: (token, user) =>
      set((state) => {
        state.token = token;
        state.user = user;
      }),

    // Called on logout — wipes everything
    clearAuth: () =>
      set((state) => {
        state.token = null;
        state.user = null;
      }),
  }))
);