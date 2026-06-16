export class OperationFactory {
    static registry = new Map();
    static register(type, ctor) {
        OperationFactory.registry.set(type, ctor);
    }
    static create(type, adapter) {
        const Ctor = OperationFactory.registry.get(type);
        if (!Ctor)
            throw new Error(`Unknown operation type: ${type}`);
        return new Ctor(adapter);
    }
    static getRegistered() {
        return Array.from(OperationFactory.registry.keys());
    }
    // Test ortamında registry'yi temizlemek için
    static clearForTesting() {
        OperationFactory.registry.clear();
    }
}
