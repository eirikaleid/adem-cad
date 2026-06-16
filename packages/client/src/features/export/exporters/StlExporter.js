import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { ExporterFactory } from './ExporterFactory';
export class StlExporter {
    format = 'stl';
    async export(input) {
        const exporter = new STLExporter();
        const mesh = new THREE.Mesh(input.geometry, new THREE.MeshStandardMaterial());
        const result = exporter.parse(mesh, { binary: true });
        // binary: true returns a DataView backed by a regular ArrayBuffer at runtime;
        // cast required because DOM BlobPart types exclude SharedArrayBuffer
        const blobData = result instanceof DataView
            ? result.buffer
            : result;
        const blob = new Blob([blobData], { type: 'application/octet-stream' });
        const filename = `${input.name}.stl`;
        return { blob, filename, format: 'stl' };
    }
}
// Self-register on module load
ExporterFactory.register('stl', StlExporter);
