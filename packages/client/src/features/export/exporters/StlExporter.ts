import * as THREE from 'three'
import { STLExporter } from 'three/addons/exporters/STLExporter.js'
import { ExporterFactory } from './ExporterFactory'
import type { IExporter, ExportInput, ExportResult } from './IExporter'

export class StlExporter implements IExporter {
  readonly format = 'stl' as const

  async export(input: ExportInput): Promise<ExportResult> {
    const exporter = new STLExporter()
    const mesh = new THREE.Mesh(
      input.geometry,
      new THREE.MeshStandardMaterial()
    )

    const result = exporter.parse(mesh, { binary: true })
    // binary: true returns a DataView backed by a regular ArrayBuffer at runtime;
    // cast required because DOM BlobPart types exclude SharedArrayBuffer
    const blobData = result instanceof DataView
      ? (result.buffer as ArrayBuffer)
      : (result as unknown as ArrayBuffer)
    const blob = new Blob([blobData], { type: 'application/octet-stream' })
    const filename = `${input.name}.stl`

    return { blob, filename, format: 'stl' }
  }
}

// Self-register on module load
ExporterFactory.register('stl', StlExporter)
