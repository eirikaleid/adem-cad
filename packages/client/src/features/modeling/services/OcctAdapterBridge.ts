// Feature-level bridge — components never import infrastructure directly
// Thin wrapper: izolasyon katmanı, infrastructure leak'i önler
import type * as THREE from 'three'
import type { BooleanOpType, ExtrudeParams } from '@adem-cad/shared'
import { OcctAdapter } from '@/infrastructure/occt/OcctAdapter'
import type { ExtrudedMeshData } from '@/infrastructure/occt/OcctAdapter'

export interface OcctBooleanResult {
  geometry: THREE.BufferGeometry
}

export class OcctAdapterBridge {
  private adapter = new OcctAdapter()

  async extrude(sketchId: string, params: ExtrudeParams): Promise<ExtrudedMeshData> {
    return this.adapter.extrudeSketch(sketchId, params)
  }

  // Boolean ops — real OCCT BRepAlgoAPI calls will replace stub
  async performBoolean(
    _type: BooleanOpType,
    _targetId: string,
    _toolId: string,
  ): Promise<OcctBooleanResult> {
    // Stub: gerçek impl'de OCCT'nin BRepAlgoAPI_Fuse/Cut/Common kullanılacak
    const { BufferGeometry } = await import('three')
    return { geometry: new BufferGeometry() }
  }
}
