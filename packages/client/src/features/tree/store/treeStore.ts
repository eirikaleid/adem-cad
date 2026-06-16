import { create } from 'zustand'
import type { Operation } from '@adem-cad/shared'

interface TreeState {
  history: Operation[]
  rollbackIndex: number | null

  addOperation: (op: Operation) => void
  removeOperation: (id: string) => void
  rollbackTo: (index: number) => void
  restoreHead: () => void
  getActiveOperations: () => Operation[]
}

export const useTreeStore = create<TreeState>((set, get) => ({
  history: [],
  rollbackIndex: null,

  addOperation: (op) =>
    set((s) => ({ history: [...s.history, op], rollbackIndex: null })),

  removeOperation: (id) =>
    set((s) => ({ history: s.history.filter((o) => o.id !== id) })),

  rollbackTo: (index) => set({ rollbackIndex: index }),

  restoreHead: () => set({ rollbackIndex: null }),

  getActiveOperations: () => {
    const { history, rollbackIndex } = get()
    return rollbackIndex === null ? history : history.slice(0, rollbackIndex + 1)
  },
}))
