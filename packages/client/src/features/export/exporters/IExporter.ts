export type ExportFormat = 'step' | 'gltf' | 'stl'

export interface ExportInput {
  solidId: string
  geometry: import('three').BufferGeometry
  name: string
}

export interface ExportResult {
  blob: Blob
  filename: string
  format: ExportFormat
}

export interface IExporter {
  format: ExportFormat
  export(input: ExportInput): Promise<ExportResult>
}
