import type { IExporter, ExportFormat } from './IExporter'

type ExporterConstructor = new () => IExporter

export class ExporterFactory {
  private static registry = new Map<ExportFormat, ExporterConstructor>()

  static register(format: ExportFormat, ctor: ExporterConstructor): void {
    ExporterFactory.registry.set(format, ctor)
  }

  static create(format: ExportFormat): IExporter {
    const Ctor = ExporterFactory.registry.get(format)
    if (!Ctor) throw new Error(`No exporter registered for format: ${format}`)
    return new Ctor()
  }

  static getFormats(): ExportFormat[] {
    return Array.from(ExporterFactory.registry.keys())
  }
}
