export interface Vec2 {
  x: number
  y: number
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface BoundingBox {
  min: Vec3
  max: Vec3
}

export type PlaneType = 'XY' | 'YZ' | 'XZ'

export interface Plane {
  type: PlaneType
  offset: number
}

export interface Transform {
  position: Vec3
  rotation: Vec3
  scale: Vec3
}
