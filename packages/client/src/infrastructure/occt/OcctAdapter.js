// Wraps raw OCCT calls, converts to Three.js-friendly data
// Real impl: BRepPrimAPI_MakePrism(sketch_wire, gp_Vec direction)
import * as THREE from 'three';
import { OcctLoader } from './OcctLoader';
export class OcctAdapter {
    loader = OcctLoader.getInstance();
    async extrudeSketch(sketchId, params) {
        // OCCT instance'ı yükle — gerçek impl'de BRepPrimAPI_MakePrism çağrısı burada
        await this.loader.load();
        // Stub: sketch profilini temsil eden box geometry
        // Real OCCT: wire → BRepBuilderAPI_MakeWire → BRepPrimAPI_MakePrism(wire, direction)
        const geo = new THREE.BoxGeometry(1, params.depth, 1);
        // Symmetric: merkeze göre, değilse tabandan yukarı
        const yOffset = params.symmetric ? 0 : params.depth / 2;
        geo.translate(0, yOffset, 0);
        return {
            geometry: geo,
            solidId: `solid_${sketchId}_${Date.now()}`,
        };
    }
}
