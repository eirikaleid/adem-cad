import type { BoundingBox, Transform } from './geometry.types.js'

export interface SolidMetadata {
  id: string
  name: string
  operationId: string
  visible: boolean
  color: string
  transform: Transform
  boundingBox?: BoundingBox
}

export interface ProjectMetadata {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  description?: string
}
