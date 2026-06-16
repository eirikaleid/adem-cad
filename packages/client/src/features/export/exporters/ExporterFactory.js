export class ExporterFactory {
    static registry = new Map();
    static register(format, ctor) {
        ExporterFactory.registry.set(format, ctor);
    }
    static create(format) {
        const Ctor = ExporterFactory.registry.get(format);
        if (!Ctor)
            throw new Error(`No exporter registered for format: ${format}`);
        return new Ctor();
    }
    static getFormats() {
        return Array.from(ExporterFactory.registry.keys());
    }
}
