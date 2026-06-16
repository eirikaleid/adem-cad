import * as THREE from 'three';
import { OperationFactory } from './OperationFactory';
export class ExtrudeOperation {
    adapter;
    constructor(adapter) {
        this.adapter = adapter;
    }
    validate(input) {
        const errors = [];
        if (!input.sketchId)
            errors.push('Sketch ID required');
        const depth = input.params['depth'];
        if (typeof depth !== 'number' || depth <= 0) {
            errors.push('Depth must be a positive number');
        }
        return { valid: errors.length === 0, errors };
    }
    getPreviewGeometry(input) {
        const depth = typeof input.params['depth'] === 'number' ? input.params['depth'] : 1;
        const symmetric = input.params['symmetric'] === true;
        const geo = new THREE.BoxGeometry(1, depth, 1);
        const yOffset = symmetric ? 0 : depth / 2;
        geo.translate(0, yOffset, 0);
        return geo;
    }
    async execute(input) {
        const validation = this.validate(input);
        if (!validation.valid)
            throw new Error(validation.errors.join(', '));
        const result = await this.adapter.extrude(input.sketchId, {
            depth: input.params['depth'],
            symmetric: input.params['symmetric'] ?? false,
        });
        return { solidId: result.solidId, geometry: result.geometry };
    }
}
// Self-register — bu modül import edildiğinde factory'ye kaydeder
OperationFactory.register('extrude', ExtrudeOperation);
