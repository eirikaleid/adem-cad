import type { PlaneType } from './geometry.types.js'

export type { PlaneType }

export type SketchEntityType = 'line' | 'circle' | 'arc'

export interface SketchPoint {
  x: number
  y: number
}

export interface SketchLine {
  id: string
  type: 'line'
  start: SketchPoint
  end: SketchPoint
}

export interface SketchCircle {
  id: string
  type: 'circle'
  center: SketchPoint
  radius: number
}

export interface SketchArc {
  id: string
  type: 'arc'
  center: SketchPoint
  radius: number
  startAngle: number
  endAngle: number
}

export type SketchEntity = SketchLine | SketchCircle | SketchArc

export interface Sketch {
  id: string
  plane: PlaneType
  entities: SketchEntity[]
}
