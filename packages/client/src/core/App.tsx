import { useState, useEffect, useCallback } from 'react'
import { Viewport3D } from '@/features/viewport'
import { Toolbar } from '@/shared/ui/Toolbar'
import { FeaturePanel } from '@/shared/ui/FeaturePanel'
import { useSketchStore } from '@/features/sketch/store/sketchStore'
import { PlaneSelector } from '@/features/sketch/components/PlaneSelector'
import { OcctAdapterBridge } from '@/features/modeling/services/OcctAdapterBridge'
import { useSceneStore } from '@/features/modeling/store/sceneStore'
import { useTreeStore } from '@/features/tree/store/treeStore'

// Import to self-register all operations
import '@/features/modeling/operations/ExtrudeOperation'
import '@/features/modeling/operations/BooleanOperation'

type AppTool = 'sketch' | 'extrude' | 'boolean' | 'export'

const bridge = new OcctAdapterBridge()

export default function App() {
  const [activeTool, setActiveTool] = useState<AppTool | null>(null)
  const [showPlaneSelector, setShowPlaneSelector] = useState(false)

  const { activeSketch, lastFinishedSketch } = useSketchStore()
  const { addSolid } = useSceneStore()
  const { addOperation } = useTreeStore()

  // When sketch finishes, auto-open extrude panel
  useEffect(() => {
    if (lastFinishedSketch) {
      setActiveTool('extrude')
    }
  }, [lastFinishedSketch])

  // Keyboard shortcuts for tool switching
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (activeSketch) return // sketch mode captures its own keys

      switch (e.key.toLowerCase()) {
        case 's': handleTool('sketch'); break
        case 'e': handleTool('extrude'); break
        case 'b': handleTool('boolean'); break
        case 'x': handleTool('export'); break
        case 'escape': setActiveTool(null); setShowPlaneSelector(false); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSketch]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTool = useCallback((tool: AppTool) => {
    if (tool === 'sketch') {
      setShowPlaneSelector(true)
      setActiveTool('sketch')
    } else {
      setActiveTool((prev) => prev === tool ? null : tool)
      setShowPlaneSelector(false)
    }
  }, [])

  const handleExtrude = useCallback(async (depth: number, symmetric: boolean) => {
    // Use active sketch if drawing, else use the last finished sketch
    const sketch = activeSketch ?? lastFinishedSketch
    if (!sketch) return

    try {
      const result = await bridge.extrude(sketch.id, { depth, symmetric })
      const id = result.solidId
      const now = Date.now()

      addSolid(
        {
          id,
          name: `Extrude_${now}`,
          operationId: id,
          visible: true,
          color: '#3b82f6',
          transform: { position: { x:0, y:0, z:0 }, rotation: { x:0, y:0, z:0 }, scale: { x:1, y:1, z:1 } },
        },
        result.geometry
      )

      addOperation({
        id,
        type: 'extrude',
        name: `Extrude ${depth.toFixed(1)}`,
        sketchId: sketch.id,
        params: { depth, symmetric },
        timestamp: now,
      })

      setActiveTool(null)
    } catch (err) {
      console.error('Extrude failed:', err)
    }
  }, [activeSketch, lastFinishedSketch, addSolid, addOperation])

  return (
    <div className="flex flex-col w-full h-full bg-surface-900">
      <Toolbar activeTool={activeTool} onTool={handleTool} />

      <div className="flex flex-1 overflow-hidden">
        <FeaturePanel side="left" />

        <main className="flex-1 relative overflow-hidden">
          <Viewport3D />

          {/* Plane selector modal */}
          {showPlaneSelector && !activeSketch && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
              onClick={() => { setShowPlaneSelector(false); setActiveTool(null) }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <PlaneSelector onSelect={() => setShowPlaneSelector(false)} />
              </div>
            </div>
          )}
        </main>

        <FeaturePanel
          side="right"
          activeTool={activeTool}
          onExtrude={handleExtrude}
        />
      </div>
    </div>
  )
}
