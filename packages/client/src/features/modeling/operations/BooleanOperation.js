import * as THREE from 'three';
import { OperationFactory } from './OperationFactory';
function extractBooleanParams(input) {
    const { targetId, toolId } = input.params;
    if (typeof targetId === 'string' && typeof toolId === 'string') {
        return { targetId, toolId };
    }
    return null;
}
export class BooleanOperation {
    adapter;
    // Adapter reserved for real OCCT BRepAlgoAPI_Fuse / Cut / Common calls
    constructor(adapter) {
        this.adapter = adapter;
    }
    validate(input) {
        const errors = [];
        const parsed = extractBooleanParams(input);
        if (!parsed) {
            errors.push('params must contain targetId and toolId strings');
            return { valid: false, errors };
        }
        if (!parsed.targetId.trim())
            errors.push('targetId is required');
        if (!parsed.toolId.trim())
            errors.push('toolId is required');
        if (parsed.targetId && parsed.toolId && parsed.targetId === parsed.toolId) {
            errors.push('targetId and toolId must be different solids');
        }
        return { valid: errors.length === 0, errors };
    }
    getPreviewGeometry(_input) {
        return new THREE.BufferGeometry();
    }
    async execute(input) {
        const validation = this.validate(input);
        if (!validation.valid)
            throw new Error(validation.errors.join(', '));
        // placeholder — real OCCT call via this.adapter.performBoolean goes here
        void this.adapter;
        return {
            solidId: `boolean_solid_${Date.now()}`,
            geometry: new THREE.BufferGeometry(),
        };
    }
}
OperationFactory.register('boolean-union', BooleanOperation);
OperationFactory.register('boolean-subtract', BooleanOperation);
OperationFactory.register('boolean-intersect', BooleanOperation);
