import { useSketchStore } from '@/features/sketch/store/sketchStore'

type AppTool = 'sketch' | 'extrude' | 'boolean' | 'export'

interface ToolDef {
  id: AppTool
  label: string
  key: string
  desc: string
}

const TOOLS: ToolDef[] = [
  { id: 'sketch',  label: 'Sketch',  key: 'S', desc: 'New sketch on plane' },
  { id: 'extrude', label: 'Extrude', key: 'E', desc: 'Extrude sketch' },
  { id: 'boolean', label: 'Boolean', key: 'B', desc: 'Boolean operation' },
  { id: 'export',  label: 'Export',  key: 'X', desc: 'Export model' },
]

interface Props {
  activeTool: AppTool | null
  onTool: (tool: AppTool) => void
}

export function Toolbar({ activeTool, onTool }: Props) {
  const { activeSketch, endSketch } = useSketchStore()
  const inSketch = activeSketch !== null

  return (
    <header className="flex items-center h-10 px-3 bg-surface-800 border-b border-surface-600/50 gap-3 shrink-0 select-none">
      {/* Logo */}
      <span className="font-mono text-sm font-semibold text-zinc-200 tracking-wider shrink-0">
        adem<span className="text-blue-500">_</span>cad
      </span>

      <div className="w-px h-5 bg-surface-600 shrink-0" />

      {inSketch ? (
        /* Sketch mode: show sketch tools hint + exit */
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-blue-400">
            Sketching on {activeSketch.plane} plane
          </span>
          <button
            onClick={endSketch}
            className="px-2.5 py-1 text-[11px] font-mono text-green-400 border border-green-600/50 rounded hover:bg-green-500/10 transition-colors"
          >
            ✓ Finish Sketch
          </button>
          <button
            onClick={endSketch}
            className="px-2.5 py-1 text-[11px] font-mono text-zinc-500 border border-surface-600/50 rounded hover:text-red-400 hover:border-red-600/50 transition-colors"
          >
            ✕ Cancel
          </button>
        </div>
      ) : (
        /* Normal mode: main tools */
        <div className="flex gap-0.5">
          {TOOLS.map((t) => {
            const isActive = activeTool === t.id
            return (
              <button
                key={t.id}
                onClick={() => onTool(t.id)}
                title={`${t.desc} (${t.key})`}
                aria-pressed={isActive}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded transition-colors
                  ${isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-surface-600 border border-transparent'
                  }
                `}
              >
                <span className="text-[9px] text-zinc-600">{t.key}</span>
                {t.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex-1" />

      <span className="font-mono text-[10px] text-zinc-700 shrink-0">adem_cad v0.1</span>
    </header>
  )
}
