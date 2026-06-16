import { useSketchStore } from '../store/sketchStore'

type DrawTool = 'select' | 'line' | 'circle' | 'arc'

interface ToolItem {
  id: DrawTool
  label: string
  title: string
}

const TOOLS: ToolItem[] = [
  { id: 'select', label: 'Select', title: 'Select entities (Q)' },
  { id: 'line', label: 'Line', title: 'Draw line (L)' },
  { id: 'circle', label: 'Circle', title: 'Draw circle (C)' },
  { id: 'arc', label: 'Arc', title: 'Draw arc (A)' },
]

export function SketchToolbar() {
  const { activeTool, setTool, endSketch, activeSketch } = useSketchStore()

  if (!activeSketch) return null

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 bg-surface-800 border border-surface-600/50 rounded"
      role="toolbar"
      aria-label="Sketch tools"
    >
      {TOOLS.map((tool) => {
        const isActive = activeTool === tool.id
        return (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            title={tool.title}
            aria-pressed={isActive}
            aria-label={tool.title}
            className={`
              px-3 py-1.5 font-mono text-[11px] rounded border transition-colors
              min-h-[36px]
              ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-surface-600'
              }
            `}
          >
            {tool.label}
          </button>
        )
      })}

      <div className="w-px h-5 bg-surface-600 mx-1" aria-hidden="true" />

      <button
        onClick={endSketch}
        title="Finish sketch and return to 3D view"
        aria-label="Finish sketch"
        className="
          px-3 py-1.5 font-mono text-[11px] rounded border transition-colors
          min-h-[36px]
          border-green-600/50 text-green-400 hover:bg-green-500/10 hover:border-green-500
        "
      >
        Finish Sketch
      </button>
    </div>
  )
}
