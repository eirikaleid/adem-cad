import * as THREE from 'three'

export async function createRenderer(canvas: HTMLCanvasElement): Promise<THREE.WebGLRenderer> {
  // Three.js r171: WebGPU renderer via WebGPURenderer (addons)
  // Fallback: WebGLRenderer for unsupported browsers
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  return renderer
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement
): void {
  const width = canvas.clientWidth
  const height = canvas.clientHeight

  if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
}
