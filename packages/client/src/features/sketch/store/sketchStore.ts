import { create } from 'zustand'
import type { Sketch, SketchEntity } from '@adem-cad/shared'
import type { PlaneType } from '@adem-cad/shared'

type SketchTool = 'line' | 'circle' | 'arc' | 'select' | null

interface SketchState {
  activeSketch: Sketch | null
  lastFinishedSketch: Sketch | null
  activeTool: SketchTool
  sketches: Map<string, Sketch>
}

interface SketchActions {
  startSketch: (plane: PlaneType) => void
  endSketch: () => Sketch | null
  addEntity: (entity: SketchEntity) => void
  removeEntity: (id: string) => void
  setTool: (tool: SketchTool) => void
}

type SketchStore = SketchState & SketchActions

export const useSketchStore = create<SketchStore>((set, get) => ({
  activeSketch: null,
  lastFinishedSketch: null,
  activeTool: null,
  sketches: new Map<string, Sketch>(),

  startSketch: (plane: PlaneType) => {
    const id = `sketch-${Date.now()}`
    const sketch: Sketch = { id, plane, entities: [] }
    set((state) => {
      const next = new Map(state.sketches)
      next.set(id, sketch)
      return { activeSketch: sketch, lastFinishedSketch: null, activeTool: 'line', sketches: next }
    })
  },

  endSketch: () => {
    const { activeSketch } = get()
    if (!activeSketch) return null
    set((state) => {
      const next = new Map(state.sketches)
      next.set(activeSketch.id, activeSketch)
      return { activeSketch: null, lastFinishedSketch: activeSketch, activeTool: null, sketches: next }
    })
    return activeSketch
  },

  addEntity: (entity: SketchEntity) => {
    set((state) => {
      if (!state.activeSketch) return state
      const updated: Sketch = {
        ...state.activeSketch,
        entities: [...state.activeSketch.entities, entity],
      }
      const next = new Map(state.sketches)
      next.set(updated.id, updated)
      return { activeSketch: updated, sketches: next }
    })
  },

  removeEntity: (id: string) => {
    set((state) => {
      if (!state.activeSketch) return state
      const updated: Sketch = {
        ...state.activeSketch,
        entities: state.activeSketch.entities.filter((e) => e.id !== id),
      }
      const next = new Map(state.sketches)
      next.set(updated.id, updated)
      return { activeSketch: updated, sketches: next }
    })
  },

  setTool: (tool: SketchTool) => {
    set({ activeTool: tool })
  },
}))
