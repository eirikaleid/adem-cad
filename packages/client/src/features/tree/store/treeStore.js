import { create } from 'zustand';
export const useTreeStore = create((set, get) => ({
    history: [],
    rollbackIndex: null,
    addOperation: (op) => set((s) => ({ history: [...s.history, op], rollbackIndex: null })),
    removeOperation: (id) => set((s) => ({ history: s.history.filter((o) => o.id !== id) })),
    rollbackTo: (index) => set({ rollbackIndex: index }),
    restoreHead: () => set({ rollbackIndex: null }),
    getActiveOperations: () => {
        const { history, rollbackIndex } = get();
        return rollbackIndex === null ? history : history.slice(0, rollbackIndex + 1);
    },
}));
