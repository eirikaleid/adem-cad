export class SketchKernelAdapter {
    // OCCT integration placeholder — methods will delegate to WASM kernel once loaded
    validateSketch(sketch) {
        if (sketch.entities.length === 0) {
            return { valid: false, errors: ['Sketch has no entities'] };
        }
        return { valid: true, errors: [] };
    }
    getSketchArea(_sketch) {
        // Stub: OCCT will compute closed-profile area
        return 0;
    }
}
