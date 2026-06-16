import { useState } from 'react'
import type { BufferGeometry } from 'three'
import { useExport } from '../hooks/useExport'
import type { ExportFormat } from '../exporters/IExporter'

interface Props {
  solidId: string
  geometry: BufferGeometry | null
  name: string
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  step: 'STEP',
  gltf: 'GLTF',
  stl: 'STL',
}

const FORMATS: ExportFormat[] = ['step', 'gltf', 'stl']

export function ExportPanel({ solidId, geometry, name }: Props) {
  const [selected, setSelected] = useState<ExportFormat>('step')
  const { exportSolid, exporting, error } = useExport()

  const handleExport = () => {
    if (!geometry) return
    void exportSolid(selected, { solidId, geometry, name })
  }

  return (
    <div className="flex flex-col gap-3 p-3 bg-surface-800 border border-surface-600/50 rounded font-mono">
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
        Export
      </span>

      {/* Format selector */}
      <div className="flex gap-1">
        {FORMATS.map((fmt) => (
          <button
            key={fmt}
            onClick={() => setSelected(fmt)}
            aria-pressed={selected === fmt}
            className={[
              'flex-1 py-1 text-[11px] rounded border transition-colors',
              selected === fmt
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-surface-700 border-surface-600/50 text-zinc-400 hover:text-zinc-200 hover:border-surface-500',
            ].join(' ')}
          >
            {FORMAT_LABELS[fmt]}
          </button>
        ))}
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={!geometry || exporting}
        aria-disabled={!geometry || exporting}
        className={[
          'w-full py-1.5 text-[11px] rounded border transition-colors',
          geometry && !exporting
            ? 'bg-surface-700 border-surface-600/50 text-zinc-300 hover:bg-surface-600 hover:text-white'
            : 'bg-surface-800 border-surface-600/30 text-zinc-600 cursor-not-allowed',
        ].join(' ')}
      >
        {exporting ? 'Exporting...' : `Export .${selected}`}
      </button>

      {/* No geometry hint */}
      {!geometry && (
        <p className="text-[10px] text-zinc-600">
          No geometry selected
        </p>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="px-2 py-1.5 text-[10px] text-red-400 bg-red-950/40 border border-red-800/50 rounded"
        >
          {error}
        </div>
      )}
    </div>
  )
}
