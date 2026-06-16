interface ViewCubeProps {
  onFace: (face: 'top' | 'front' | 'right' | 'left' | 'back' | 'bottom') => void
}

const FACES = [
  { label: 'TOP', id: 'top' as const, style: 'top-0 left-1/2 -translate-x-1/2' },
  { label: 'FRONT', id: 'front' as const, style: 'bottom-0 left-1/2 -translate-x-1/2' },
  { label: 'RIGHT', id: 'right' as const, style: 'right-0 top-1/2 -translate-y-1/2' },
  { label: 'LEFT', id: 'left' as const, style: 'left-0 top-1/2 -translate-y-1/2' },
]

export function ViewCube({ onFace }: ViewCubeProps) {
  return (
    <div className="absolute top-4 right-4 w-16 h-16 select-none">
      <div className="relative w-full h-full">
        {FACES.map((f) => (
          <button
            key={f.id}
            onClick={() => onFace(f.id)}
            className={`absolute px-1 py-0.5 text-[9px] font-mono text-zinc-400 hover:text-white bg-surface-700/60 hover:bg-surface-600/80 border border-surface-500/40 rounded transition-colors ${f.style}`}
          >
            {f.label}
          </button>
        ))}
        <div className="absolute inset-4 border border-surface-500/40 rounded-sm bg-surface-800/40" />
      </div>
    </div>
  )
}
