import * as THREE from 'three'

export function buildScene(): THREE.Scene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0d0d0f)
  scene.fog = new THREE.FogExp2(0x0d0d0f, 0.002)
  return scene
}

export function buildCamera(aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 10000)
  camera.position.set(5, 4, 7)
  camera.lookAt(0, 0, 0)
  return camera
}

export function buildLights(): THREE.Object3D[] {
  const ambient = new THREE.AmbientLight(0xffffff, 0.4)

  const key = new THREE.DirectionalLight(0xffffff, 1.2)
  key.position.set(8, 12, 6)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.1
  key.shadow.camera.far = 100
  key.shadow.camera.left = -20
  key.shadow.camera.right = 20
  key.shadow.camera.top = 20
  key.shadow.camera.bottom = -20

  const fill = new THREE.DirectionalLight(0x6699ff, 0.3)
  fill.position.set(-5, 3, -5)

  return [ambient, key, fill]
}

export function buildGrid(): THREE.Object3D {
  const group = new THREE.Group()

  // Main grid
  const grid = new THREE.GridHelper(40, 40, 0x2a2a35, 0x1e1e28)
  grid.material.opacity = 0.8
  grid.material.transparent = true
  group.add(grid)

  // Axis lines
  const axisMat = (color: number) =>
    new THREE.LineBasicMaterial({ color, linewidth: 1.5 })

  const xGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-20, 0, 0),
    new THREE.Vector3(20, 0, 0),
  ])
  const yGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -20),
    new THREE.Vector3(0, 0, 20),
  ])

  group.add(new THREE.Line(xGeo, axisMat(0x3b82f6))) // X = blue
  group.add(new THREE.Line(yGeo, axisMat(0x22c55e))) // Z = green

  return group
}
