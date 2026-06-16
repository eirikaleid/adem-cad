import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from 'react';
import { useTreeStore } from '../store/treeStore';
const TYPE_STYLES = {
    extrude: { label: 'Extrude', color: 'text-blue-400' },
    revolve: { label: 'Revolve', color: 'text-purple-400' },
    'boolean-union': { label: 'Union', color: 'text-green-400' },
    'boolean-subtract': { label: 'Subtract', color: 'text-red-400' },
    'boolean-intersect': { label: 'Intersect', color: 'text-amber-400' },
};
function formatTimestamp(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
const OperationRow = React.memo(function OperationRow({ op, index, isRolledBack, isSelected, onRollback, onDelete, }) {
    const typeStyle = TYPE_STYLES[op.type] ?? { label: op.type, color: 'text-zinc-400' };
    const handleRowClick = useCallback(() => {
        onRollback(index);
    }, [onRollback, index]);
    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDelete(op.id);
    }, [onDelete, op.id]);
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRollback(index);
        }
    }, [onRollback, index]);
    return (_jsxs("div", { role: "button", tabIndex: 0, "aria-label": `Rollback to ${op.name}`, "aria-pressed": isSelected, onClick: handleRowClick, onKeyDown: handleKeyDown, className: [
            'flex items-center justify-between px-3 py-2 cursor-pointer select-none',
            'hover:bg-zinc-700 transition-colors duration-150',
            isSelected ? 'border-l-2 border-blue-500 bg-zinc-750' : 'border-l-2 border-transparent',
            isRolledBack ? 'opacity-40' : 'opacity-100',
        ].join(' '), children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("span", { className: ['font-mono text-xs font-semibold shrink-0', typeStyle.color].join(' '), "aria-label": `Operation type: ${typeStyle.label}`, children: typeStyle.label.toUpperCase() }), _jsx("span", { className: "font-mono text-sm text-zinc-200 truncate", title: op.name, children: op.name })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0 ml-2", children: [_jsx("span", { className: "font-mono text-xs text-zinc-500", "aria-label": "Timestamp", children: formatTimestamp(op.timestamp) }), _jsx("button", { type: "button", "aria-label": `Delete ${op.name}`, onClick: handleDelete, className: [
                            'flex items-center justify-center w-5 h-5 rounded',
                            'text-zinc-500 hover:text-red-400 hover:bg-zinc-600',
                            'transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-red-400',
                        ].join(' '), children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) })] })] }));
});
export function FeatureTree() {
    const history = useTreeStore((s) => s.history);
    const rollbackIndex = useTreeStore((s) => s.rollbackIndex);
    const rollbackTo = useTreeStore((s) => s.rollbackTo);
    const restoreHead = useTreeStore((s) => s.restoreHead);
    const removeOperation = useTreeStore((s) => s.removeOperation);
    const handleRollback = useCallback((index) => {
        if (rollbackIndex === index) {
            restoreHead();
        }
        else {
            rollbackTo(index);
        }
    }, [rollbackIndex, rollbackTo, restoreHead]);
    const handleRestoreHead = useCallback(() => {
        restoreHead();
    }, [restoreHead]);
    return (_jsxs("section", { "aria-label": "Feature Tree", className: "flex flex-col h-full bg-zinc-800 text-zinc-100 select-none", children: [_jsxs("header", { className: "flex items-center justify-between px-3 py-2 border-b border-zinc-700 shrink-0", children: [_jsx("h2", { className: "text-xs font-semibold uppercase tracking-wider text-zinc-400", children: "Feature Tree" }), rollbackIndex !== null && (_jsx("button", { type: "button", onClick: handleRestoreHead, className: [
                            'text-xs font-mono px-2 py-1 rounded',
                            'bg-blue-600 hover:bg-blue-500 text-white',
                            'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400',
                        ].join(' '), children: "Restore HEAD" }))] }), _jsxs("div", { role: "list", "aria-label": "Operation history", className: "flex-1 overflow-y-auto", children: [history.length === 0 && (_jsx("p", { className: "px-3 py-4 text-xs text-zinc-500 font-mono", children: "No operations yet." })), history.map((op, index) => {
                        const activeLength = rollbackIndex === null ? history.length : rollbackIndex + 1;
                        const isRolledBack = index >= activeLength;
                        const isSelected = rollbackIndex !== null && index === rollbackIndex;
                        return (_jsx("div", { role: "listitem", children: _jsx(OperationRow, { op: op, index: index, isRolledBack: isRolledBack, isSelected: isSelected, onRollback: handleRollback, onDelete: removeOperation }) }, op.id));
                    })] })] }));
}
