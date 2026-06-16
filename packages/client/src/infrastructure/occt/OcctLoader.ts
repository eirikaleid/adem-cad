// OpenCascade.js WASM loader — singleton pattern
// opencascade.js npm paketi henüz kurulmadığı için dynamic import ile lazy load
// Real API gelince: import initOpenCascade from 'opencascade.js' ile swap edilecek

export interface OcctInstance {
  BRepPrimAPI_MakeBox: (x: number, y: number, z: number) => unknown
  BRepMesh_IncrementalMesh: (shape: unknown, deflection: number) => unknown
}

function isOcctInstance(value: unknown): value is OcctInstance {
  return (
    typeof value === 'object' &&
    value !== null &&
    'BRepPrimAPI_MakeBox' in value &&
    'BRepMesh_IncrementalMesh' in value &&
    typeof (value as Record<string, unknown>)['BRepPrimAPI_MakeBox'] === 'function' &&
    typeof (value as Record<string, unknown>)['BRepMesh_IncrementalMesh'] === 'function'
  )
}

export class OcctLoader {
  private static instance: OcctLoader | null = null
  private occt: OcctInstance | null = null
  private loading: Promise<OcctInstance> | null = null

  private constructor() {}

  static getInstance(): OcctLoader {
    if (!OcctLoader.instance) OcctLoader.instance = new OcctLoader()
    return OcctLoader.instance
  }

  async load(): Promise<OcctInstance> {
    if (this.occt) return this.occt
    if (this.loading) return this.loading

    // Stub implementation — opencascade.js kurulunca gerçek dynamic import gelecek:
    // this.loading = import('opencascade.js').then(m => m.default({ ... }))
    const stub: OcctInstance = {
      BRepPrimAPI_MakeBox: (_x: number, _y: number, _z: number): unknown => ({
        type: 'box',
        dims: { x: _x, y: _y, z: _z },
      }),
      BRepMesh_IncrementalMesh: (_shape: unknown, _deflection: number): unknown => ({
        type: 'mesh',
        deflection: _deflection,
      }),
    }

    // Type guard ile satisfies yerine runtime doğrulama
    if (!isOcctInstance(stub)) {
      throw new Error('OcctLoader: stub does not satisfy OcctInstance interface')
    }

    this.loading = Promise.resolve(stub)
    this.occt = await this.loading
    return this.occt
  }

  isLoaded(): boolean {
    return this.occt !== null
  }

  // Test ortamında instance'ı sıfırlamak için
  static resetForTesting(): void {
    OcctLoader.instance = null
  }
}
