import { create } from 'zustand';
export const useSceneStore = create((set) => ({
    solids: new Map(),
    meshes: new Map(),
    selected: [],
    addSolid: (meta, geometry) => set((s) => {
        const solids = new Map(s.solids);
        const meshes = new Map(s.meshes);
        solids.set(meta.id, meta);
        meshes.set(meta.id, geometry);
        return { solids, meshes };
    }),
    removeSolid: (id) => set((s) => {
        const solids = new Map(s.solids);
        const meshes = new Map(s.meshes);
        solids.delete(id);
        meshes.delete(id);
        return { solids, meshes, selected: s.selected.filter((i) => i !== id) };
    }),
    selectSolid: (id, multi = false) => set((s) => ({
        selected: multi ? [...s.selected, id] : [id],
    })),
    clearSelection: () => set({ selected: [] }),
}));
