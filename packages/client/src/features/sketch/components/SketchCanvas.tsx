import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import type { PlaneType, SketchEntity, SketchLine, SketchCircle, SketchArc, SketchPoint } from '@adem-cad/shared'
import { useSketchStore } from '../store/sketchStore'

interface Props {
  width: number
  height: number
  plane: PlaneType
}

const GRID_SNAP = 0.5
const SCALE = 60

function snap(value: number): number {
  return Math.round(value / GRID_SNAP) * GRID_SNAP
}

function toWorld(svgX: number, svgY: number, cx: number, cy: number): SketchPoint {
  return {
    x: snap((svgX - cx) / SCALE),
    y: snap((cy - svgY) / SCALE),
  }
}

function toSvg(worldX: number, worldY: number, cx: number, cy: number): [number, number] {
  return [cx + worldX * SCALE, cy - worldY * SCALE]
}

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  svgCx: number,
  svgCy: number,
): string {
  const [x1, y1] = toSvg(
    cx + radius * Math.cos(startAngle),
    cy + radius * Math.sin(startAngle),
    svgCx,
    svgCy,
  )
  const [x2, y2] = toSvg(
    cx + radius * Math.cos(endAngle),
    cy + radius * Math.sin(endAngle),
    svgCx,
    svgCy,
  )
  const rSvg = radius * SCALE
  const sweep = ((endAngle - startAngle + Math.PI * 2) % (Math.PI * 2)) > Math.PI ? 1 : 0
  return `M ${x1} ${y1} A ${rSvg} ${rSvg} 0 ${sweep} 0 ${x2} ${y2}`
}

function renderEntity(
  entity: SketchEntity,
  svgCx: number,
  svgCy: number,
  selected: boolean,
): React.ReactElement {
  const sel = selected ? 2.5 : 1.5
  const glow = selected ? 'drop-shadow(0 0 3px rgba(96,165,250,0.8))' : undefined

  if (entity.type === 'line') {
    const [x1, y1] = toSvg(entity.start.x, entity.start.y, svgCx, svgCy)
    const [x2, y2] = toSvg(entity.end.x, entity.end.y, svgCx, svgCy)
    return (
      <g key={entity.id} style={{ filter: glow }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={selected ? '#93c5fd' : '#3b82f6'} strokeWidth={sel} strokeLinecap="round" />
        {selected && <circle cx={x1} cy={y1} r={3} fill="#93c5fd" />}
        {selected && <circle cx={x2} cy={y2} r={3} fill="#93c5fd" />}
      </g>
    )
  }

  if (entity.type === 'circle') {
    const [ox, oy] = toSvg(entity.center.x, entity.center.y, svgCx, svgCy)
    return (
      <g key={entity.id} style={{ filter: glow }}>
        <circle cx={ox} cy={oy} r={entity.radius * SCALE} stroke={selected ? '#86efac' : '#22c55e'} strokeWidth={sel} fill="none" />
        {selected && <circle cx={ox} cy={oy} r={3} fill="#86efac" />}
      </g>
    )
  }

  return (
    <g key={entity.id} style={{ filter: glow }}>
      <path
        d={arcPath(entity.center.x, entity.center.y, entity.radius, entity.startAngle, entity.endAngle, svgCx, svgCy)}
        stroke={selected ? '#fde68a' : '#f59e0b'}
        strokeWidth={sel}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

type DrawState =
  | { phase: 'idle' }
  | { phase: 'line-start'; start: SketchPoint }
  | { phase: 'line-preview'; start: SketchPoint; current: SketchPoint }
  | { phase: 'circle-center'; center: SketchPoint }
  | { phase: 'circle-preview'; center: SketchPoint; current: SketchPoint }
  | { phase: 'arc-center'; center: SketchPoint }
  | { phase: 'arc-start'; center: SketchPoint; startAngle: number }
  | { phase: 'arc-preview'; center: SketchPoint; radius: number; startAngle: number; current: SketchPoint }

export function SketchCanvas({ width, height, plane }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { activeSketch, activeTool, addEntity, removeEntity } = useSketchStore()
  const [drawState, setDrawState] = useState<DrawState>({ phase: 'idle' })
  const [cursor, setCursor] = useState<SketchPoint | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const cx = width / 2
  const cy = height / 2

  const getSvgPoint = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): SketchPoint => {
      const rect = svgRef.current!.getBoundingClientRect()
      return toWorld(e.clientX - rect.left, e.clientY - rect.top, cx, cy)
    },
    [cx, cy],
  )

  const gridLines = useMemo(() => {
    const lines: React.ReactElement[] = []
    const cols = Math.ceil(width / 2 / SCALE / GRID_SNAP)
    const rows = Math.ceil(height / 2 / SCALE / GRID_SNAP)

    for (let i = -cols; i <= cols; i++) {
      const x = cx + i * GRID_SNAP * SCALE
      const isAxis = i === 0
      lines.push(
        <line
          key={`v${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={isAxis ? '#52525b' : '#27272a'}
          strokeWidth={isAxis ? 1 : 0.5}
        />,
      )
    }
    for (let j = -rows; j <= rows; j++) {
      const y = cy + j * GRID_SNAP * SCALE
      const isAxis = j === 0
      lines.push(
        <line
          key={`h${j}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={isAxis ? '#52525b' : '#27272a'}
          strokeWidth={isAxis ? 1 : 0.5}
        />,
      )
    }
    return lines
  }, [width, height, cx, cy])

  // Undo: Ctrl+Z removes last entity; Escape cancels current draw; Delete removes selected
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        setDrawState({ phase: 'idle' })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (activeSketch && activeSketch.entities.length > 0) {
          const last = activeSketch.entities[activeSketch.entities.length - 1]
          removeEntity(last.id)
          setSelectedId(null)
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          removeEntity(selectedId)
          setSelectedId(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSketch, selectedId, removeEntity])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const pt = getSvgPoint(e)

      // Select mode: pick nearest entity
      if (!activeTool || activeTool === 'select') {
        if (!activeSketch) return
        const HIT = 0.3
        const hit = activeSketch.entities.find((ent) => {
          if (ent.type === 'line') {
            const dx = ent.end.x - ent.start.x; const dy = ent.end.y - ent.start.y
            const len2 = dx * dx + dy * dy
            if (len2 === 0) return Math.hypot(pt.x - ent.start.x, pt.y - ent.start.y) < HIT
            const t = Math.max(0, Math.min(1, ((pt.x - ent.start.x) * dx + (pt.y - ent.start.y) * dy) / len2))
            return Math.hypot(pt.x - (ent.start.x + t * dx), pt.y - (ent.start.y + t * dy)) < HIT
          }
          if (ent.type === 'circle') {
            return Math.abs(Math.hypot(pt.x - ent.center.x, pt.y - ent.center.y) - ent.radius) < HIT
          }
          return false
        })
        setSelectedId(hit?.id ?? null)
        return
      }

      if (activeTool === 'line') {
        if (drawState.phase === 'idle') {
          setDrawState({ phase: 'line-start', start: pt })
        } else if (drawState.phase === 'line-start' || drawState.phase === 'line-preview') {
          const start = drawState.start
          const entity: SketchLine = { id: `line-${Date.now()}`, type: 'line', start, end: pt }
          addEntity(entity)
          // Continuous: start next line from this endpoint
          setDrawState({ phase: 'line-start', start: pt })
        }
      }

      if (activeTool === 'circle') {
        if (drawState.phase === 'idle') {
          setDrawState({ phase: 'circle-center', center: pt })
        } else if (drawState.phase === 'circle-center' || drawState.phase === 'circle-preview') {
          const center = drawState.center
          const current = drawState.phase === 'circle-preview' ? drawState.current : pt
          const radius = Math.hypot(current.x - center.x, current.y - center.y)
          if (radius > 0) {
            const entity: SketchCircle = { id: `circle-${Date.now()}`, type: 'circle', center, radius }
            addEntity(entity)
          }
          setDrawState({ phase: 'idle' })
        }
      }

      if (activeTool === 'arc') {
        if (drawState.phase === 'idle') {
          setDrawState({ phase: 'arc-center', center: pt })
        } else if (drawState.phase === 'arc-center') {
          const startAngle = Math.atan2(pt.y - drawState.center.y, pt.x - drawState.center.x)
          setDrawState({ phase: 'arc-start', center: drawState.center, startAngle })
        } else if (drawState.phase === 'arc-preview') {
          const { center, radius, startAngle, current } = drawState
          const endAngle = Math.atan2(current.y - center.y, current.x - center.x)
          const entity: SketchArc = { id: `arc-${Date.now()}`, type: 'arc', center, radius, startAngle, endAngle }
          addEntity(entity)
          setDrawState({ phase: 'idle' })
        }
      }
    },
    [activeTool, drawState, getSvgPoint, addEntity, activeSketch],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const pt = getSvgPoint(e)
      setCursor(pt)
      if (!activeTool || activeTool === 'select') return

      if (activeTool === 'line' && (drawState.phase === 'line-start' || drawState.phase === 'line-preview')) {
        setDrawState({ phase: 'line-preview', start: drawState.start, current: pt })
      }
      if (activeTool === 'circle' && (drawState.phase === 'circle-center' || drawState.phase === 'circle-preview')) {
        setDrawState({ phase: 'circle-preview', center: drawState.center, current: pt })
      }
      if (activeTool === 'arc' && drawState.phase === 'arc-start') {
        const radius = Math.hypot(pt.x - drawState.center.x, pt.y - drawState.center.y)
        setDrawState({ phase: 'arc-preview', center: drawState.center, radius, startAngle: drawState.startAngle, current: pt })
      }
      if (activeTool === 'arc' && drawState.phase === 'arc-preview') {
        setDrawState({ ...drawState, current: pt })
      }
    },
    [activeTool, drawState, getSvgPoint],
  )

  const handleMouseLeave = useCallback(() => setCursor(null), [])

  const previewElement = useMemo((): React.ReactElement | null => {
    if (drawState.phase === 'line-preview') {
      const [x1, y1] = toSvg(drawState.start.x, drawState.start.y, cx, cy)
      const [x2, y2] = toSvg(drawState.current.x, drawState.current.y, cx, cy)
      const len = Math.hypot(drawState.current.x - drawState.start.x, drawState.current.y - drawState.start.y)
      const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6} />
          <circle cx={x1} cy={y1} r={4} fill="none" stroke="#22c55e" strokeWidth={1.5} />
          <rect x={mx - 22} y={my - 9} width={44} height={16} rx={3} fill="#18181b" opacity={0.85} />
          <text x={mx} y={my + 4} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontFamily="monospace">{len.toFixed(2)}</text>
        </g>
      )
    }

    if (drawState.phase === 'circle-preview') {
      const radius = Math.hypot(drawState.current.x - drawState.center.x, drawState.current.y - drawState.center.y)
      const [pcx, pcy] = toSvg(drawState.center.x, drawState.center.y, cx, cy)
      const [ex, ey] = toSvg(drawState.current.x, drawState.current.y, cx, cy)
      return (
        <g>
          <circle cx={pcx} cy={pcy} r={radius * SCALE} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" fill="none" opacity={0.6} />
          <circle cx={pcx} cy={pcy} r={3} fill="#22c55e" />
          <line x1={pcx} y1={pcy} x2={ex} y2={ey} stroke="#22c55e" strokeWidth={0.8} strokeDasharray="2 2" opacity={0.4} />
          <rect x={ex - 22} y={ey - 9} width={44} height={16} rx={3} fill="#18181b" opacity={0.85} />
          <text x={ex} y={ey + 4} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontFamily="monospace">R {radius.toFixed(2)}</text>
        </g>
      )
    }

    if (drawState.phase === 'arc-preview') {
      const endAngle = Math.atan2(drawState.current.y - drawState.center.y, drawState.current.x - drawState.center.x)
      const [ex, ey] = toSvg(drawState.current.x, drawState.current.y, cx, cy)
      return (
        <g>
          <path
            d={arcPath(drawState.center.x, drawState.center.y, drawState.radius, drawState.startAngle, endAngle, cx, cy)}
            stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" fill="none" opacity={0.6}
          />
          <rect x={ex - 22} y={ey - 9} width={44} height={16} rx={3} fill="#18181b" opacity={0.85} />
          <text x={ex} y={ey + 4} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontFamily="monospace">R {drawState.radius.toFixed(2)}</text>
        </g>
      )
    }

    return null
  }, [drawState, cx, cy])

  const planeLabel = useMemo((): [string, string] => {
    if (plane === 'XY') return ['X', 'Y']
    if (plane === 'YZ') return ['Y', 'Z']
    return ['X', 'Z']
  }, [plane])

  if (!activeSketch) return null

  const crosshairColor = '#3f3f46'

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="absolute inset-0 cursor-none select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={`Sketch canvas on ${plane} plane`}
      role="img"
    >
      {/* Grid */}
      <g>{gridLines}</g>

      {/* Axis labels */}
      <text x={width - 16} y={cy - 6} fill="#52525b" fontSize={10} fontFamily="monospace" textAnchor="middle">{planeLabel[0]}</text>
      <text x={cx + 6} y={14} fill="#52525b" fontSize={10} fontFamily="monospace" textAnchor="start">{planeLabel[1]}</text>

      {/* Committed entities */}
      <g>
        {activeSketch.entities.map((e) => renderEntity(e, cx, cy, e.id === selectedId))}
      </g>

      {/* Preview */}
      {previewElement}

      {/* Cursor crosshair */}
      {cursor && (() => {
        const [svgX, svgY] = toSvg(cursor.x, cursor.y, cx, cy)
        return (
          <g pointerEvents="none">
            <line x1={svgX} y1={0} x2={svgX} y2={height} stroke={crosshairColor} strokeWidth={0.8} />
            <line x1={0} y1={svgY} x2={width} y2={svgY} stroke={crosshairColor} strokeWidth={0.8} />
            <circle cx={svgX} cy={svgY} r={3} fill="none" stroke="#60a5fa" strokeWidth={1.2} />
          </g>
        )
      })()}

      {/* Coordinate readout */}
      {cursor && (
        <g pointerEvents="none">
          <rect x={8} y={height - 22} width={110} height={16} rx={3} fill="#18181b" opacity={0.85} />
          <text x={14} y={height - 10} fill="#71717a" fontSize={10} fontFamily="monospace">
            {`X: ${cursor.x.toFixed(2).padStart(6)}  Y: ${cursor.y.toFixed(2).padStart(6)}`}
          </text>
        </g>
      )}

      {/* Snap point indicator at start of line (endpoint snap) */}
      {drawState.phase === 'line-start' && (() => {
        const [sx, sy] = toSvg(drawState.start.x, drawState.start.y, cx, cy)
        return <circle cx={sx} cy={sy} r={6} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="2 2" pointerEvents="none" />
      })()}
    </svg>
  )
}
