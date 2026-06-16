import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { ExporterFactory } from './ExporterFactory';
export class GltfExporter {
    format = 'gltf';
    async export(input) {
        const exporter = new GLTFExporter();
        const mesh = new THREE.Mesh(input.geometry, new THREE.MeshStandardMaterial());
        const gltfData = await exporter.parseAsync(mesh, { binary: false });
        const json = JSON.stringify(gltfData);
        const blob = new Blob([json], { type: 'application/json' });
        const filename = `${input.name}.gltf`;
        return { blob, filename, format: 'gltf' };
    }
}
// Self-register on module load
ExporterFactory.register('gltf', GltfExporter);
