import { OcctAdapter } from '@/infrastructure/occt/OcctAdapter';
export class OcctAdapterBridge {
    adapter = new OcctAdapter();
    async extrude(sketchId, params) {
        return this.adapter.extrudeSketch(sketchId, params);
    }
    // Boolean ops — real OCCT BRepAlgoAPI calls will replace stub
    async performBoolean(_type, _targetId, _toolId) {
        // Stub: gerçek impl'de OCCT'nin BRepAlgoAPI_Fuse/Cut/Common kullanılacak
        const { BufferGeometry } = await import('three');
        return { geometry: new BufferGeometry() };
    }
}
