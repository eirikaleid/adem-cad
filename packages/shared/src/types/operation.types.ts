import type { Plane } from './geometry.types.js'

export type OperationType = 'extrude' | 'revolve' | 'boolean-union' | 'boolean-subtract' | 'boolean-intersect'

export type BooleanOpType = 'union' | 'subtract' | 'intersect'

export interface ExtrudeParams {
  depth: number
  symmetric: boolean
}

export interface RevolveParams {
  angle: number  // degrees
  axis: 'X' | 'Y' | 'Z'
}

export interface BooleanParams {
  type: BooleanOpType
  targetId: string
  toolId: string
}

export interface BaseOperation {
  id: string
  type: OperationType
  name: string
  plane?: Plane
  timestamp: number
}

export interface ExtrudeOperation extends BaseOperation {
  type: 'extrude'
  sketchId: string
  params: ExtrudeParams
}

export interface RevolveOperation extends BaseOperation {
  type: 'revolve'
  sketchId: string
  params: RevolveParams
}

export interface BooleanOperation extends BaseOperation {
  type: 'boolean-union' | 'boolean-subtract' | 'boolean-intersect'
  params: BooleanParams
}

export type Operation = ExtrudeOperation | RevolveOperation | BooleanOperation

export interface ValidationResult {
  valid: boolean
  errors: string[]
}
