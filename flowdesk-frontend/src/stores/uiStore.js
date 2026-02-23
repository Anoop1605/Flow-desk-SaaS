import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useUIStore = create()(immer((set) => ({
    selectedTaskId: null,
    isDrawerOpen: false,
    isCommandPaletteOpen: false,
    openTask: (taskId) => set((s) => {
        s.selectedTaskId = taskId;
        s.isDrawerOpen = true;
    }),
    closeDrawer: () => set((s) => {
        s.isDrawerOpen = false;
        s.selectedTaskId = null;
    }),
    toggleCommandPalette: () => set((s) => {
        s.isCommandPaletteOpen = !s.isCommandPaletteOpen;
    }),
})));
