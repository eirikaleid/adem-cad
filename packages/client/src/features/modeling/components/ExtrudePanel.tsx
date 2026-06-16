import React, { useState, useCallback, useId, useMemo } from 'react'
import { useSketchStore } from '@/features/sketch/store/sketchStore'

type Unit = 'mm' | 'cm' | 'm' | 'in'
const UNIT_FACTORS: Record<Unit, number> = { mm: 1, cm: 10, m: 1000, in: 25.4 }

interface Props {
  onExtrude: (depth: number, symmetric: boolean) => void
}

function NumInput({
  id, label, value, onChange, unit, error, errorId,
}: {
  id: string; label: string; value: number
  onChange: (v: number) => void; unit: Unit
  error?: string | null; errorId?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-mono text-[11px] text-zinc-400">{label}</label>
        <span className="font-mono text-[10px] text-zinc-600">{unit}</span>
      </div>
      <input
        id={id}
        type="number"
        min={0.01}
        step={0.1}
        value={value}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }}
        aria-describedby={error && errorId ? errorId : undefined}
        aria-invalid={!!error}
        className={[
          'w-full px-2 py-1.5 rounded bg-zinc-700 text-zinc-100 font-mono text-sm',
          'border focus:outline-none focus:ring-1 focus:ring-blue-400',
          error ? 'border-red-500' : 'border-zinc-600',
        ].join(' ')}
      />
      {error && errorId && (
        <p id={errorId} role="alert" className="text-[10px] text-red-400 font-mono">{error}</p>
      )}
    </div>
  )
}

export function ExtrudePanel({ onExtrude }: Props) {
  const { lastFinishedSketch, activeSketch } = useSketchStore()
  const sketch = activeSketch ?? lastFinishedSketch

  const [depth, setDepth] = useState<number>(10)
  const [symmetric, setSymmetric] = useState<boolean>(false)
  const [unit, setUnit] = useState<Unit>('mm')

  const depthId = useId()
  const symmetricId = useId()
  const depthErrId = useId()
  const unitId = useId()

  const depthMm = depth * UNIT_FACTORS[unit]
  const depthError = depthMm <= 0 ? 'Must be > 0' : null
  const canExtrude = !depthError && !!sketch

  // Bounding box of sketch entities for display
  const bbox = useMemo(() => {
    if (!sketch || sketch.entities.length === 0) return null
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const ent of sketch.entities) {
      if (ent.type === 'line') {
        minX = Math.min(minX, ent.start.x, ent.end.x)
        minY = Math.min(minY, ent.start.y, ent.end.y)
        maxX = Math.max(maxX, ent.start.x, ent.end.x)
        maxY = Math.max(maxY, ent.start.y, ent.end.y)
      } else if (ent.type === 'circle') {
        minX = Math.min(minX, ent.center.x - ent.radius)
        minY = Math.min(minY, ent.center.y - ent.radius)
        maxX = Math.max(maxX, ent.center.x + ent.radius)
        maxY = Math.max(maxY, ent.center.y + ent.radius)
      }
    }
    if (!isFinite(minX)) return null
    return { w: maxX - minX, h: maxY - minY }
  }, [sketch])

  const handleExtrude = useCallback(() => {
    if (!canExtrude) return
    onExtrude(depthMm, symmetric)
  }, [canExtrude, onExtrude, depthMm, symmetric])

  return (
    <section aria-label="Extrude Operation" className="flex flex-col gap-3 p-3 bg-zinc-800 rounded-lg">
      <h2 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Extrude</h2>

      {/* Sketch info */}
      {sketch ? (
        <div className="bg-zinc-900/60 rounded px-2 py-1.5 border border-zinc-700/50">
          <div className="font-mono text-[10px] text-zinc-500 mb-1">Sketch</div>
          <div className="font-mono text-[11px] text-zinc-300">{sketch.plane} plane · {sketch.entities.length} entities</div>
          {bbox && (
            <div className="font-mono text-[10px] text-zinc-600 mt-0.5">
              W: {bbox.w.toFixed(2)} · H: {bbox.h.toFixed(2)}
            </div>
          )}
        </div>
      ) : (
        <div className="font-mono text-[11px] text-zinc-600 bg-zinc-900/40 rounded px-2 py-1.5">
          No sketch — finish a sketch first
        </div>
      )}

      {/* Unit selector */}
      <div className="flex flex-col gap-1">
        <label htmlFor={unitId} className="font-mono text-[11px] text-zinc-400">Unit</label>
        <select
          id={unitId}
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="w-full px-2 py-1.5 rounded bg-zinc-700 text-zinc-100 font-mono text-sm border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="mm">mm — millimeter</option>
          <option value="cm">cm — centimeter</option>
          <option value="m">m — meter</option>
          <option value="in">in — inch</option>
        </select>
      </div>

      {/* Depth */}
      <NumInput
        id={depthId}
        label="Depth (extrusion)"
        value={depth}
        onChange={setDepth}
        unit={unit}
        error={depthError}
        errorId={depthErrId}
      />

      {/* Depth visual indicator */}
      <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
        <div className="flex-1 h-px bg-zinc-700" />
        <span>{depthMm.toFixed(2)} mm</span>
        <div className="flex-1 h-px bg-zinc-700" />
      </div>

      {/* Symmetric */}
      <div className="flex items-center gap-2">
        <input
          id={symmetricId}
          type="checkbox"
          checked={symmetric}
          onChange={(e) => setSymmetric(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-400 focus:ring-offset-zinc-800 cursor-pointer"
        />
        <label htmlFor={symmetricId} className="font-mono text-[11px] text-zinc-300 cursor-pointer select-none">
          Symmetric (both sides)
        </label>
      </div>

      <button
        type="button"
        disabled={!canExtrude}
        onClick={handleExtrude}
        className={[
          'w-full py-2 px-4 rounded text-sm font-semibold text-white min-h-[40px]',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400',
          canExtrude
            ? 'bg-blue-600 hover:bg-blue-500'
            : 'bg-zinc-700 text-zinc-500 cursor-not-allowed',
        ].join(' ')}
      >
        {canExtrude ? `Extrude ${depthMm.toFixed(1)} mm` : 'No sketch selected'}
      </button>
    </section>
  )
}
