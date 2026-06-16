import React, { useCallback } from 'react'
import type { Operation } from '@adem-cad/shared'
import { useTreeStore } from '../store/treeStore'

interface OperationRowProps {
  op: Operation
  index: number
  isRolledBack: boolean
  isSelected: boolean
  onRollback: (index: number) => void
  onDelete: (id: string) => void
}

const TYPE_STYLES: Record<Operation['type'], { label: string; color: string }> = {
  extrude: { label: 'Extrude', color: 'text-blue-400' },
  revolve: { label: 'Revolve', color: 'text-purple-400' },
  'boolean-union': { label: 'Union', color: 'text-green-400' },
  'boolean-subtract': { label: 'Subtract', color: 'text-red-400' },
  'boolean-intersect': { label: 'Intersect', color: 'text-amber-400' },
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const OperationRow = React.memo(function OperationRow({
  op,
  index,
  isRolledBack,
  isSelected,
  onRollback,
  onDelete,
}: OperationRowProps) {
  const typeStyle = TYPE_STYLES[op.type] ?? { label: op.type, color: 'text-zinc-400' }

  const handleRowClick = useCallback(() => {
    onRollback(index)
  }, [onRollback, index])

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete(op.id)
    },
    [onDelete, op.id],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onRollback(index)
      }
    },
    [onRollback, index],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Rollback to ${op.name}`}
      aria-pressed={isSelected}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      className={[
        'flex items-center justify-between px-3 py-2 cursor-pointer select-none',
        'hover:bg-zinc-700 transition-colors duration-150',
        isSelected ? 'border-l-2 border-blue-500 bg-zinc-750' : 'border-l-2 border-transparent',
        isRolledBack ? 'opacity-40' : 'opacity-100',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={['font-mono text-xs font-semibold shrink-0', typeStyle.color].join(' ')}
          aria-label={`Operation type: ${typeStyle.label}`}
        >
          {typeStyle.label.toUpperCase()}
        </span>
        <span className="font-mono text-sm text-zinc-200 truncate" title={op.name}>
          {op.name}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="font-mono text-xs text-zinc-500" aria-label="Timestamp">
          {formatTimestamp(op.timestamp)}
        </span>
        <button
          type="button"
          aria-label={`Delete ${op.name}`}
          onClick={handleDelete}
          className={[
            'flex items-center justify-center w-5 h-5 rounded',
            'text-zinc-500 hover:text-red-400 hover:bg-zinc-600',
            'transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-red-400',
          ].join(' ')}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  )
})

export function FeatureTree() {
  const history = useTreeStore((s) => s.history)
  const rollbackIndex = useTreeStore((s) => s.rollbackIndex)
  const rollbackTo = useTreeStore((s) => s.rollbackTo)
  const restoreHead = useTreeStore((s) => s.restoreHead)
  const removeOperation = useTreeStore((s) => s.removeOperation)

  const handleRollback = useCallback(
    (index: number) => {
      if (rollbackIndex === index) {
        restoreHead()
      } else {
        rollbackTo(index)
      }
    },
    [rollbackIndex, rollbackTo, restoreHead],
  )

  const handleRestoreHead = useCallback(() => {
    restoreHead()
  }, [restoreHead])

  return (
    <section
      aria-label="Feature Tree"
      className="flex flex-col h-full bg-zinc-800 text-zinc-100 select-none"
    >
      <header className="flex items-center justify-between px-3 py-2 border-b border-zinc-700 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Feature Tree
        </h2>
        {rollbackIndex !== null && (
          <button
            type="button"
            onClick={handleRestoreHead}
            className={[
              'text-xs font-mono px-2 py-1 rounded',
              'bg-blue-600 hover:bg-blue-500 text-white',
              'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400',
            ].join(' ')}
          >
            Restore HEAD
          </button>
        )}
      </header>

      <div
        role="list"
        aria-label="Operation history"
        className="flex-1 overflow-y-auto"
      >
        {history.length === 0 && (
          <p className="px-3 py-4 text-xs text-zinc-500 font-mono">
            No operations yet.
          </p>
        )}
        {history.map((op, index) => {
          const activeLength = rollbackIndex === null ? history.length : rollbackIndex + 1
          const isRolledBack = index >= activeLength
          const isSelected = rollbackIndex !== null && index === rollbackIndex

          return (
            <div key={op.id} role="listitem">
              <OperationRow
                op={op}
                index={index}
                isRolledBack={isRolledBack}
                isSelected={isSelected}
                onRollback={handleRollback}
                onDelete={removeOperation}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
