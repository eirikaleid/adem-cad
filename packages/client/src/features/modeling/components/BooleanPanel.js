import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo } from 'react';
const BUTTON_CONFIGS = [
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
];
const APPLY_ACTIVE_CLASSES = {
    union: 'bg-green-600 hover:bg-green-500 focus:ring-green-400',
    subtract: 'bg-red-600 hover:bg-red-500 focus:ring-red-400',
    intersect: 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-400',
};
export function BooleanPanel({ solidIds, onBoolean }) {
    const [activeType, setActiveType] = useState('union');
    const [targetId, setTargetId] = useState('');
    const [toolId, setToolId] = useState('');
    const validationError = useMemo(() => {
        if (!targetId)
            return 'Select a target solid';
        if (!toolId)
            return 'Select a tool solid';
        if (targetId === toolId)
            return 'Target and tool must be different solids';
        return null;
    }, [targetId, toolId]);
    const canApply = validationError === null;
    const handleApply = useCallback(() => {
        if (!canApply)
            return;
        onBoolean(activeType, targetId, toolId);
    }, [canApply, onBoolean, activeType, targetId, toolId]);
    const handleTargetChange = useCallback((e) => {
        setTargetId(e.target.value);
    }, []);
    const handleToolChange = useCallback((e) => {
        setToolId(e.target.value);
    }, []);
    const applyButtonClass = APPLY_ACTIVE_CLASSES[activeType];
    return (_jsxs("section", { "aria-label": "Boolean Operations", className: "flex flex-col gap-4 p-4 bg-zinc-800 rounded-lg", children: [_jsx("h2", { className: "text-xs font-semibold uppercase tracking-wider text-zinc-400", children: "Boolean Operation" }), _jsxs("fieldset", { children: [_jsx("legend", { className: "text-xs text-zinc-500 mb-2", children: "Operation Type" }), _jsx("div", { role: "group", "aria-label": "Boolean operation type", className: "flex gap-2", children: BUTTON_CONFIGS.map(({ type, label, activeClass, inactiveClass }) => (_jsx("button", { type: "button", "aria-pressed": activeType === type, onClick: () => setActiveType(type), className: [
                                'flex-1 py-2 px-3 rounded border text-xs font-semibold',
                                'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800',
                                activeType === type ? activeClass : inactiveClass,
                            ].join(' '), children: label }, type))) })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: "boolean-target", className: "text-xs text-zinc-400", children: "Target Solid" }), _jsxs("select", { id: "boolean-target", value: targetId, onChange: handleTargetChange, "aria-describedby": "boolean-validation", className: [
                                    'w-full px-3 py-2 rounded bg-zinc-700 text-zinc-100 text-sm',
                                    'border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800 focus:ring-blue-400',
                                    targetId && targetId === toolId
                                        ? 'border-red-500'
                                        : 'border-zinc-600',
                                ].join(' '), children: [_jsx("option", { value: "", children: "\u2014 Select solid \u2014" }), solidIds.map((id) => (_jsx("option", { value: id, children: id }, id)))] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: "boolean-tool", className: "text-xs text-zinc-400", children: "Tool Solid" }), _jsxs("select", { id: "boolean-tool", value: toolId, onChange: handleToolChange, "aria-describedby": "boolean-validation", className: [
                                    'w-full px-3 py-2 rounded bg-zinc-700 text-zinc-100 text-sm',
                                    'border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800 focus:ring-blue-400',
                                    toolId && targetId === toolId
                                        ? 'border-red-500'
                                        : 'border-zinc-600',
                                ].join(' '), children: [_jsx("option", { value: "", children: "\u2014 Select solid \u2014" }), solidIds.map((id) => (_jsx("option", { value: id, children: id }, id)))] })] })] }), validationError && (_jsx("p", { id: "boolean-validation", role: "alert", className: "text-xs text-red-400 font-mono", children: validationError })), _jsx("button", { type: "button", disabled: !canApply, onClick: handleApply, "aria-disabled": !canApply, className: [
                    'w-full py-2 px-4 rounded text-sm font-semibold text-white',
                    'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800',
                    canApply
                        ? applyButtonClass
                        : 'bg-zinc-600 text-zinc-400 cursor-not-allowed',
                ].join(' '), children: "Apply Boolean" })] }));
}
