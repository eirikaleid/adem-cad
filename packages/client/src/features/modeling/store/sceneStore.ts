import { create } from 'zustand'
import type * as THREE from 'three'
import type { SolidMetadata } from '@adem-cad/shared'

interface SceneState {
  solids: Map<string, SolidMetadata>
  meshes: Map<string, THREE.BufferGeometry>
  selected: string[]

  addSolid: (meta: SolidMetadata, geometry: THREE.BufferGeometry) => void
  removeSolid: (id: string) => void
  selectSolid: (id: string, multi?: boolean) => void
  clearSelection: () => void
}

export const useSceneStore = create<SceneState>((set) => ({
  solids: new Map(),
  meshes: new Map(),
  selected: [],

  addSolid: (meta, geometry) =>
    set((s) => {
      const solids = new Map(s.solids)
      const meshes = new Map(s.meshes)
      solids.set(meta.id, meta)
      meshes.set(meta.id, geometry)
      return { solids, meshes }
    }),

  removeSolid: (id) =>
    set((s) => {
      const solids = new Map(s.solids)
      const meshes = new Map(s.meshes)
      solids.delete(id)
      meshes.delete(id)
      return { solids, meshes, selected: s.selected.filter((i) => i !== id) }
    }),

  selectSolid: (id, multi = false) =>
    set((s) => ({
      selected: multi ? [...s.selected, id] : [id],
    })),

  clearSelection: () => set({ selected: [] }),
}))
