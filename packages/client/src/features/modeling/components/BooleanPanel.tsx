import React, { useState, useCallback, useMemo } from 'react'
import type { BooleanOpType } from '@adem-cad/shared'

interface Props {
  solidIds: string[]
  onBoolean: (type: BooleanOpType, targetId: string, toolId: string) => void
}

interface ButtonConfig {
  type: BooleanOpType
  label: string
  activeClass: string
  inactiveClass: string
}

const BUTTON_CONFIGS: ButtonConfig[] = [
  {
    type: 'union',
    label: 'Union',
    activeClass: 'bg-green-600 text-white border-green-500',
    inactiveClass: 'bg-zinc-700 text-zinc-300 border-zinc-600 hover:bg-zinc-600 hover:border-green-600',
  },
  {
    type: 'subtract',
    label: 'Subtract',
    activeClass: 'bg-red-600 text-white border-red-500',
    inactiveClass: 'bg-zinc-700 text-zinc-300 border-zinc-600 hover:bg-zinc-600 hover:border-red-600',
  },
  {
    type: 'intersect',
    label: 'Intersect',
    activeClass: 'bg-amber-600 text-white border-amber-500',
    inactiveClass: 'bg-zinc-700 text-zinc-300 border-zinc-600 hover:bg-zinc-600 hover:border-amber-600',
  },
]

const APPLY_ACTIVE_CLASSES: Record<BooleanOpType, string> = {
  union: 'bg-green-600 hover:bg-green-500 focus:ring-green-400',
  subtract: 'bg-red-600 hover:bg-red-500 focus:ring-red-400',
  intersect: 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-400',
}

export function BooleanPanel({ solidIds, onBoolean }: Props) {
  const [activeType, setActiveType] = useState<BooleanOpType>('union')
  const [targetId, setTargetId] = useState<string>('')
  const [toolId, setToolId] = useState<string>('')

  const validationError = useMemo<string | null>(() => {
    if (!targetId) return 'Select a target solid'
    if (!toolId) return 'Select a tool solid'
    if (targetId === toolId) return 'Target and tool must be different solids'
    return null
  }, [targetId, toolId])

  const canApply = validationError === null

  const handleApply = useCallback(() => {
    if (!canApply) return
    onBoolean(activeType, targetId, toolId)
  }, [canApply, onBoolean, activeType, targetId, toolId])

  const handleTargetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetId(e.target.value)
  }, [])

  const handleToolChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setToolId(e.target.value)
  }, [])

  const applyButtonClass = APPLY_ACTIVE_CLASSES[activeType]

  return (
    <section
      aria-label="Boolean Operations"
      className="flex flex-col gap-4 p-4 bg-zinc-800 rounded-lg"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Boolean Operation
      </h2>

      <fieldset>
        <legend className="text-xs text-zinc-500 mb-2">Operation Type</legend>
        <div role="group" aria-label="Boolean operation type" className="flex gap-2">
          {BUTTON_CONFIGS.map(({ type, label, activeClass, inactiveClass }) => (
            <button
              key={type}
              type="button"
              aria-pressed={activeType === type}
              onClick={() => setActiveType(type)}
              className={[
                'flex-1 py-2 px-3 rounded border text-xs font-semibold',
                'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800',
                activeType === type ? activeClass : inactiveClass,
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="boolean-target"
            className="text-xs text-zinc-400"
          >
            Target Solid
          </label>
          <select
            id="boolean-target"
            value={targetId}
            onChange={handleTargetChange}
            aria-describedby="boolean-validation"
            className={[
              'w-full px-3 py-2 rounded bg-zinc-700 text-zinc-100 text-sm',
              'border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800 focus:ring-blue-400',
              targetId && targetId === toolId
                ? 'border-red-500'
                : 'border-zinc-600',
            ].join(' ')}
          >
            <option value="">— Select solid —</option>
            {solidIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="boolean-tool"
            className="text-xs text-zinc-400"
          >
            Tool Solid
          </label>
          <select
            id="boolean-tool"
            value={toolId}
            onChange={handleToolChange}
            aria-describedby="boolean-validation"
            className={[
              'w-full px-3 py-2 rounded bg-zinc-700 text-zinc-100 text-sm',
              'border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800 focus:ring-blue-400',
              toolId && targetId === toolId
                ? 'border-red-500'
                : 'border-zinc-600',
            ].join(' ')}
          >
            <option value="">— Select solid —</option>
            {solidIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {validationError && (
        <p
          id="boolean-validation"
          role="alert"
          className="text-xs text-red-400 font-mono"
        >
          {validationError}
        </p>
      )}

      <button
        type="button"
        disabled={!canApply}
        onClick={handleApply}
        aria-disabled={!canApply}
        className={[
          'w-full py-2 px-4 rounded text-sm font-semibold text-white',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800',
          canApply
            ? applyButtonClass
            : 'bg-zinc-600 text-zinc-400 cursor-not-allowed',
        ].join(' ')}
      >
        Apply Boolean
      </button>
    </section>
  )
}
