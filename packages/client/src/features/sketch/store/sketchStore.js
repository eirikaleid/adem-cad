import { create } from 'zustand';
export const useSketchStore = create((set, get) => ({
    activeSketch: null,
    activeTool: null,
    sketches: new Map(),
    startSketch: (plane) => {
        const id = `sketch-${Date.now()}`;
        const sketch = { id, plane, entities: [] };
        set((state) => {
            const next = new Map(state.sketches);
            next.set(id, sketch);
            return { activeSketch: sketch, activeTool: 'select', sketches: next };
        });
    },
    endSketch: () => {
        const { activeSketch } = get();
        if (!activeSketch)
            return;
        set((state) => {
            const next = new Map(state.sketches);
            next.set(activeSketch.id, activeSketch);
            return { activeSketch: null, activeTool: null, sketches: next };
        });
    },
    addEntity: (entity) => {
        set((state) => {
            if (!state.activeSketch)
                return state;
            const updated = {
                ...state.activeSketch,
                entities: [...state.activeSketch.entities, entity],
            };
            const next = new Map(state.sketches);
            next.set(updated.id, updated);
            return { activeSketch: updated, sketches: next };
        });
    },
    removeEntity: (id) => {
        set((state) => {
            if (!state.activeSketch)
                return state;
            const updated = {
                ...state.activeSketch,
                entities: state.activeSketch.entities.filter((e) => e.id !== id),
            };
            const next = new Map(state.sketches);
            next.set(updated.id, updated);
            return { activeSketch: updated, sketches: next };
        });
    },
    setTool: (tool) => {
        set({ activeTool: tool });
    },
}));
