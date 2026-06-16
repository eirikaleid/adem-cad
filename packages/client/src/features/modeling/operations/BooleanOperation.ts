import type { IOperation, OperationInput, OperationOutput } from './IOperation'
import * as THREE from 'three'
import type { OcctAdapterBridge } from '../services/OcctAdapterBridge'
import type { ValidationResult } from '@adem-cad/shared'
import { OperationFactory } from './OperationFactory'

function extractBooleanParams(input: OperationInput): { targetId: string; toolId: string } | null {
  const { targetId, toolId } = input.params
  if (typeof targetId === 'string' && typeof toolId === 'string') {
    return { targetId, toolId }
  }
  return null
}

export class BooleanOperation implements IOperation {
  // Adapter reserved for real OCCT BRepAlgoAPI_Fuse / Cut / Common calls
  constructor(private readonly adapter: OcctAdapterBridge) {}

  validate(input: OperationInput): ValidationResult {
    const errors: string[] = []
    const parsed = extractBooleanParams(input)

    if (!parsed) {
      errors.push('params must contain targetId and toolId strings')
      return { valid: false, errors }
    }

    if (!parsed.targetId.trim()) errors.push('targetId is required')
    if (!parsed.toolId.trim()) errors.push('toolId is required')
    if (parsed.targetId && parsed.toolId && parsed.targetId === parsed.toolId) {
      errors.push('targetId and toolId must be different solids')
    }

    return { valid: errors.length === 0, errors }
  }

  getPreviewGeometry(_input: OperationInput): THREE.BufferGeometry {
    return new THREE.BufferGeometry()
  }

  async execute(input: OperationInput): Promise<OperationOutput> {
    const validation = this.validate(input)
    if (!validation.valid) throw new Error(validation.errors.join(', '))

    // placeholder — real OCCT call via this.adapter.performBoolean goes here
    void this.adapter

    return {
      solidId: `boolean_solid_${Date.now()}`,
      geometry: new THREE.BufferGeometry(),
    }
  }
}

OperationFactory.register('boolean-union', BooleanOperation)
OperationFactory.register('boolean-subtract', BooleanOperation)
OperationFactory.register('boolean-intersect', BooleanOperation)
