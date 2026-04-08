import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useUIStore = create()(immer((set) => ({
    selectedTaskId: null,
    isDrawerOpen: false,
    isCommandPaletteOpen: false,
    isCreateTaskModalOpen: false,
    lastProjectId: null,
    setLastProjectId: (id) => set((s) => {
        s.lastProjectId = id;
    }),
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
    openCreateTaskModal: (status = 'TODO') => set((s) => {
        s.isCreateTaskModalOpen = true;
        s.modalDefaultStatus = status;
    }),
    closeCreateTaskModal: () => set((s) => {
        s.isCreateTaskModalOpen = false;
    }),
})));
