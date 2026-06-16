import type { Sketch } from '@adem-cad/shared'
import type { ValidationResult } from '@adem-cad/shared'

export interface ISketchKernel {
  validateSketch(sketch: Sketch): ValidationResult
  getSketchArea(sketch: Sketch): number
}

export class SketchKernelAdapter implements ISketchKernel {
  // OCCT integration placeholder — methods will delegate to WASM kernel once loaded

  validateSketch(sketch: Sketch): ValidationResult {
    if (sketch.entities.length === 0) {
      return { valid: false, errors: ['Sketch has no entities'] }
    }
    return { valid: true, errors: [] }
  }

  getSketchArea(_sketch: Sketch): number {
    // Stub: OCCT will compute closed-profile area
    return 0
  }
}
