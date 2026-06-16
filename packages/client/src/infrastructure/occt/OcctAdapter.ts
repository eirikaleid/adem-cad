// Wraps raw OCCT calls, converts to Three.js-friendly data
// Real impl: BRepPrimAPI_MakePrism(sketch_wire, gp_Vec direction)
import * as THREE from 'three'
import { OcctLoader } from './OcctLoader'
import type { ExtrudeParams } from '@adem-cad/shared'

export interface ExtrudedMeshData {
  geometry: THREE.BufferGeometry
  solidId: string
}

export class OcctAdapter {
  private loader = OcctLoader.getInstance()

  async extrudeSketch(sketchId: string, params: ExtrudeParams): Promise<ExtrudedMeshData> {
    // OCCT instance'ı yükle — gerçek impl'de BRepPrimAPI_MakePrism çağrısı burada
    await this.loader.load()

    // Stub: sketch profilini temsil eden box geometry
    // Real OCCT: wire → BRepBuilderAPI_MakeWire → BRepPrimAPI_MakePrism(wire, direction)
    const geo = new THREE.BoxGeometry(1, params.depth, 1)

    // Symmetric: merkeze göre, değilse tabandan yukarı
    const yOffset = params.symmetric ? 0 : params.depth / 2
    geo.translate(0, yOffset, 0)

    return {
      geometry: geo,
      solidId: `solid_${sketchId}_${Date.now()}`,
    }
  }
}
