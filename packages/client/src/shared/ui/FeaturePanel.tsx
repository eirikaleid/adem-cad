import { FeatureTree } from '@/features/tree/components/FeatureTree'
import { ExtrudePanel } from '@/features/modeling/components/ExtrudePanel'
import { BooleanPanel } from '@/features/modeling/components/BooleanPanel'
import { ExportPanel } from '@/features/export/components/ExportPanel'
import { useSceneStore } from '@/features/modeling/store/sceneStore'
import type * as THREE from 'three'

type AppTool = 'sketch' | 'extrude' | 'boolean' | 'export'

interface Props {
  side: 'left' | 'right'
  activeTool?: AppTool | null
  onExtrude?: (depth: number, symmetric: boolean) => void
}

export function FeaturePanel({ side, activeTool, onExtrude }: Props) {
  const { solids, meshes, selected } = useSceneStore()
  const solidIds = Array.from(solids.keys())

  const selectedId = selected[0] ?? null
  const selectedGeo: THREE.BufferGeometry | null = selectedId ? (meshes.get(selectedId) ?? null) : null
  const selectedMeta = selectedId ? solids.get(selectedId) : null

  return (
    <aside
      className={`w-52 bg-surface-800 shrink-0 flex flex-col overflow-hidden ${
        side === 'left' ? 'border-r border-surface-600/50' : 'border-l border-surface-600/50'
      }`}
    >
      {side === 'left' && (
        <>
          <div className="px-3 py-2 border-b border-surface-600/50 shrink-0">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              Feature Tree
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FeatureTree />
          </div>
        </>
      )}

      {side === 'right' && (
        <>
          <div className="px-3 py-2 border-b border-surface-600/50 shrink-0">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              {activeTool ? activeTool.toUpperCase() : 'PROPERTIES'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {/* Selection info */}
            {selectedMeta && (
              <div className="font-mono text-[10px] text-zinc-400 bg-surface-700/50 rounded px-2 py-1.5 border border-surface-600/30">
                <div className="text-zinc-300 truncate">{selectedMeta.name}</div>
                <div className="text-zinc-600 mt-0.5">{selectedMeta.id.slice(0, 12)}…</div>
              </div>
            )}

            {!selectedMeta && !activeTool && (
              <p className="font-mono text-[11px] text-zinc-700 px-1 py-2">
                No selection
              </p>
            )}

            {/* Extrude panel */}
            {activeTool === 'extrude' && onExtrude && (
              <ExtrudePanel onExtrude={onExtrude} />
            )}

            {/* Boolean panel */}
            {activeTool === 'boolean' && (
              <BooleanPanel
                solidIds={solidIds}
                onBoolean={(_type, _targetId, _toolId) => {
                  // TODO: wire to OperationFactory in Phase 3 integration
                }}
              />
            )}

            {/* Export panel */}
            {activeTool === 'export' && (
              <ExportPanel
                solidId={selectedId ?? ''}
                geometry={selectedGeo}
                name={selectedMeta?.name ?? 'model'}
              />
            )}

            {/* No active tool but has selection → show export shortcut */}
            {!activeTool && selectedMeta && (
              <ExportPanel
                solidId={selectedId!}
                geometry={selectedGeo}
                name={selectedMeta.name}
              />
            )}
          </div>
        </>
      )}
    </aside>
  )
}
