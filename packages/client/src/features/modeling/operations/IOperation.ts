import type * as THREE from 'three'
import type { ValidationResult } from '@adem-cad/shared'
import type { OcctAdapterBridge } from '../services/OcctAdapterBridge'

export interface OperationInput {
  sketchId?: string
  params: Record<string, unknown>
}

export interface OperationOutput {
  solidId: string
  geometry: THREE.BufferGeometry
}

export interface IOperation {
  validate(input: OperationInput): ValidationResult
  getPreviewGeometry(input: OperationInput): THREE.BufferGeometry
  execute(input: OperationInput): Promise<OperationOutput>
}

export type OperationConstructor = new (adapter: OcctAdapterBridge) => IOperation
