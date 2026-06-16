// OpenCascade.js WASM loader — singleton pattern
// opencascade.js npm paketi henüz kurulmadığı için dynamic import ile lazy load
// Real API gelince: import initOpenCascade from 'opencascade.js' ile swap edilecek
function isOcctInstance(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'BRepPrimAPI_MakeBox' in value &&
        'BRepMesh_IncrementalMesh' in value &&
        typeof value['BRepPrimAPI_MakeBox'] === 'function' &&
        typeof value['BRepMesh_IncrementalMesh'] === 'function');
}
export class OcctLoader {
    static instance = null;
    occt = null;
    loading = null;
    constructor() { }
    static getInstance() {
        if (!OcctLoader.instance)
            OcctLoader.instance = new OcctLoader();
        return OcctLoader.instance;
    }
    async load() {
        if (this.occt)
            return this.occt;
        if (this.loading)
            return this.loading;
        // Stub implementation — opencascade.js kurulunca gerçek dynamic import gelecek:
        // this.loading = import('opencascade.js').then(m => m.default({ ... }))
        const stub = {
            BRepPrimAPI_MakeBox: (_x, _y, _z) => ({
                type: 'box',
                dims: { x: _x, y: _y, z: _z },
            }),
            BRepMesh_IncrementalMesh: (_shape, _deflection) => ({
                type: 'mesh',
                deflection: _deflection,
            }),
        };
        // Type guard ile satisfies yerine runtime doğrulama
        if (!isOcctInstance(stub)) {
            throw new Error('OcctLoader: stub does not satisfy OcctInstance interface');
        }
        this.loading = Promise.resolve(stub);
        this.occt = await this.loading;
        return this.occt;
    }
    isLoaded() {
        return this.occt !== null;
    }
    // Test ortamında instance'ı sıfırlamak için
    static resetForTesting() {
        OcctLoader.instance = null;
    }
}
