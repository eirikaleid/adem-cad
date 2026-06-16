import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { createRenderer, resizeRenderer } from '@/infrastructure/three/WebGPUSetup'
import { buildScene, buildCamera, buildLights, buildGrid } from '../services/SceneSetup'
import { useOrbitControls } from '../hooks/useOrbitControls'
import { ViewCube } from './ViewCube'
import { useSketchStore } from '@/features/sketch/store/sketchStore'
import { useSceneStore } from '@/features/modeling/store/sceneStore'
import { SketchCanvas } from '@/features/sketch/components/SketchCanvas'
import { SketchToolbar } from '@/features/sketch/components/SketchToolbar'
import { PlaneSelector } from '@/features/sketch/components/PlaneSelector'

const _raycaster = new THREE.Raycaster()
const _mouse = new THREE.Vector2()

export function Viewport3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const hoveredRef = useRef<string | null>(null)
  const rafRef = useRef<number>(0)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [showPlaneSelector, setShowPlaneSelector] = useState(false)

  const { activeSketch } = useSketchStore()
  const { meshes, selectSolid } = useSceneStore()

  // Pass refs directly — fixes the null-on-mount bug
  useOrbitControls(cameraRef, canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const scene = buildScene()
    sceneRef.current = scene

    const w = container.clientWidth
    const h = container.clientHeight
    setSize({ width: w, height: h })

    const camera = buildCamera(w / h)
    cameraRef.current = camera

    let renderer: THREE.WebGLRenderer

    createRenderer(canvas).then((r) => {
      renderer = r
      rendererRef.current = r

      buildLights().forEach((l) => scene.add(l))
      scene.add(buildGrid())

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate)
        resizeRenderer(r, camera, canvas)

        // Sync container size for sketch overlay
        const cw = container.clientWidth
        const ch = container.clientHeight
        if (cw !== size.width || ch !== size.height) {
          setSize({ width: cw, height: ch })
        }

        r.render(scene, camera)
      }
      animate()
    })

    // ResizeObserver for sketch overlay sync
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(rafRef.current)
      renderer?.dispose()
      ro.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync scene meshes from store whenever meshes Map changes
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const map = meshMapRef.current

    meshes.forEach((geo, id) => {
      if (!map.has(id)) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5, metalness: 0.1 })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.userData.solidId = id
        mesh.castShadow = true
        map.set(id, mesh)
        scene.add(mesh)
      }
    })
    // Remove deleted
    map.forEach((mesh, id) => {
      if (!meshes.has(id)) {
        scene.remove(mesh)
        map.delete(id)
      }
    })
  }, [meshes])

  // Hover raycaster
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMove = (e: MouseEvent) => {
      const inSketch = activeSketch !== null
      if (inSketch) return
      const rect = canvas.getBoundingClientRect()
      _mouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const camera = cameraRef.current
      if (!camera) return
      _raycaster.setFromCamera(_mouse, camera)
      const meshes3d = Array.from(meshMapRef.current.values())
      const hits = _raycaster.intersectObjects(meshes3d, false)

      const prevId = hoveredRef.current
      const newId = hits[0]?.object.userData.solidId as string | undefined ?? null

      if (prevId !== newId) {
        if (prevId) {
          const m = meshMapRef.current.get(prevId)
          if (m) (m.material as THREE.MeshStandardMaterial).emissive.set(0x000000)
        }
        if (newId) {
          const m = meshMapRef.current.get(newId)
          if (m) (m.material as THREE.MeshStandardMaterial).emissive.set(0x1d4ed8)
        }
        hoveredRef.current = newId
      }
    }

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return
      const inSketch = activeSketch !== null
      if (inSketch) return
      const id = hoveredRef.current
      if (id) {
        selectSolid(id)
        const m = meshMapRef.current.get(id)
        if (m) (m.material as THREE.MeshStandardMaterial).color.set(0x60a5fa)
      }
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('click', onClick)
    return () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [activeSketch, selectSolid])

  const handleFace = useCallback((face: 'top' | 'front' | 'right' | 'left' | 'back' | 'bottom') => {
    const camera = cameraRef.current
    if (!camera) return
    const d = 10
    const positions: Record<string, [number, number, number]> = {
      top:    [0,  d,  0.001],
      front:  [0,  0,  d],
      right:  [d,  0,  0],
      left:   [-d, 0,  0],
      back:   [0,  0, -d],
      bottom: [0, -d,  0.001],
    }
    const [x, y, z] = positions[face]
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
  }, [])

  const inSketchMode = activeSketch !== null

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">

      {/* Three.js canvas — hidden pointer-events in sketch mode */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          touchAction: 'none',
          pointerEvents: inSketchMode ? 'none' : 'auto',
        }}
      />

      {/* Sketch 2D canvas overlay */}
      {inSketchMode && size.width > 0 && (
        <SketchCanvas
          width={size.width}
          height={size.height}
          plane={activeSketch.plane}
        />
      )}

      {/* ViewCube — hidden in sketch mode */}
      {!inSketchMode && <ViewCube onFace={handleFace} />}

      {/* Sketch toolbar — floats center-top when in sketch mode */}
      {inSketchMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <SketchToolbar />
        </div>
      )}

      {/* Plane selector popup */}
      {showPlaneSelector && !inSketchMode && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 z-10"
          onClick={() => setShowPlaneSelector(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PlaneSelector onSelect={() => setShowPlaneSelector(false)} />
          </div>
        </div>
      )}

      {/* Bottom-left: coordinate legend */}
      <div className="absolute bottom-4 left-4 font-mono text-[11px] text-zinc-600 select-none pointer-events-none">
        X <span className="text-blue-500">→</span>
        &nbsp;Y <span className="text-green-500">↑</span>
        &nbsp;Z <span className="text-red-400">↗</span>
      </div>

      {/* Bottom-right: controls hint */}
      {!inSketchMode && (
        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-zinc-700 select-none pointer-events-none text-right leading-relaxed">
          <div>Middle drag — Orbit</div>
          <div>Right drag — Pan</div>
          <div>Scroll — Zoom to cursor</div>
          <div>Double-click — Reset view</div>
          <div>F — Fit &nbsp; 1/3/7/5 — Snap</div>
        </div>
      )}
      {!inSketchMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] text-zinc-700 select-none pointer-events-none text-center leading-relaxed">
          <div>Click mesh to select &nbsp; Delete to remove</div>
        </div>
      )}

      {/* Top-left: mode badge */}
      <div className="absolute top-4 left-4 font-mono text-[11px] text-zinc-500 bg-surface-800/70 px-2 py-1 rounded border border-surface-600/40 pointer-events-none">
        {inSketchMode ? `SKETCH — ${activeSketch.plane}` : 'ORBIT'}
      </div>

      {/* Sketch mode: entity count + shortcut hint */}
      {inSketchMode && (
        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-zinc-700 select-none pointer-events-none text-right leading-relaxed">
          <div>{activeSketch.entities.length} entities</div>
          <div>Ctrl+Z — Undo &nbsp; ESC — Cancel</div>
          <div>Click entity — Select &nbsp; Del — Remove</div>
        </div>
      )}
    </div>
  )
}
