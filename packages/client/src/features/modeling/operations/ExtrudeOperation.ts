import * as THREE from 'three'
import type { IOperation, OperationInput, OperationOutput } from './IOperation'
import type { OcctAdapterBridge } from '../services/OcctAdapterBridge'
import type { ValidationResult } from '@adem-cad/shared'
import { OperationFactory } from './OperationFactory'

export class ExtrudeOperation implements IOperation {
  constructor(private adapter: OcctAdapterBridge) {}

  validate(input: OperationInput): ValidationResult {
    const errors: string[] = []

    if (!input.sketchId) errors.push('Sketch ID required')

    const depth = input.params['depth']
    if (typeof depth !== 'number' || depth <= 0) {
      errors.push('Depth must be a positive number')
    }

    return { valid: errors.length === 0, errors }
  }

  getPreviewGeometry(input: OperationInput): THREE.BufferGeometry {
    const depth = typeof input.params['depth'] === 'number' ? input.params['depth'] : 1
    const symmetric = input.params['symmetric'] === true

    const geo = new THREE.BoxGeometry(1, depth, 1)
    const yOffset = symmetric ? 0 : depth / 2
    geo.translate(0, yOffset, 0)
    return geo
  }

  async execute(input: OperationInput): Promise<OperationOutput> {
    const validation = this.validate(input)
    if (!validation.valid) throw new Error(validation.errors.join(', '))

    const result = await this.adapter.extrude(input.sketchId!, {
      depth: input.params['depth'] as number,
      symmetric: (input.params['symmetric'] as boolean | undefined) ?? false,
    })

    return { solidId: result.solidId, geometry: result.geometry }
  }
}

// Self-register — bu modül import edildiğinde factory'ye kaydeder
OperationFactory.register('extrude', ExtrudeOperation)
