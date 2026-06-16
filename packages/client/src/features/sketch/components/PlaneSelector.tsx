import type { PlaneType } from '@adem-cad/shared'
import { useSketchStore } from '../store/sketchStore'

const PLANES: PlaneType[] = ['XY', 'YZ', 'XZ']

const PLANE_DESC: Record<PlaneType, string> = {
  XY: 'Top view',
  YZ: 'Right view',
  XZ: 'Front view',
}

interface Props {
  onSelect?: () => void
}

export function PlaneSelector({ onSelect }: Props) {
  const { startSketch, activeSketch } = useSketchStore()

  const handleSelect = (plane: PlaneType) => {
    startSketch(plane)
    onSelect?.()
  }

  return (
    <div
      className="flex flex-col gap-3 p-4 bg-surface-800 border border-surface-600/50 rounded-lg shadow-xl"
      role="group"
      aria-label="Select sketch plane"
    >
      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
        Select Plane
      </span>
      <div className="flex gap-2">
        {PLANES.map((plane) => {
          const isActive = activeSketch?.plane === plane
          return (
            <button
              key={plane}
              onClick={() => handleSelect(plane)}
              aria-pressed={isActive}
              aria-label={`${plane} plane — ${PLANE_DESC[plane]}`}
              className={`
                flex flex-col items-center gap-1 px-4 py-3 font-mono rounded border transition-colors
                min-w-[64px]
                ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-surface-600/50 text-zinc-300 hover:text-white hover:bg-surface-600 hover:border-surface-500'
                }
              `}
            >
              <span className="text-sm font-semibold">{plane}</span>
              <span className="text-[9px] text-zinc-500">{PLANE_DESC[plane]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
