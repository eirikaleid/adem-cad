import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useId } from 'react';
export function ExtrudePanel({ onExtrude }) {
    const [depth, setDepth] = useState(10);
    const [symmetric, setSymmetric] = useState(false);
    const depthId = useId();
    const symmetricId = useId();
    const validationId = useId();
    const depthError = depth <= 0 ? 'Depth must be greater than 0' : null;
    const canExtrude = depthError === null;
    const handleDepthChange = useCallback((e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value))
            setDepth(value);
    }, []);
    const handleSymmetricChange = useCallback((e) => {
        setSymmetric(e.target.checked);
    }, []);
    const handleExtrude = useCallback(() => {
        if (!canExtrude)
            return;
        onExtrude(depth, symmetric);
    }, [canExtrude, onExtrude, depth, symmetric]);
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ')
            handleExtrude();
    }, [handleExtrude]);
    return (_jsxs("section", { "aria-label": "Extrude Operation", className: "flex flex-col gap-4 p-4 bg-zinc-800 rounded-lg", children: [_jsx("h2", { className: "text-xs font-semibold uppercase tracking-wider text-zinc-400", children: "Extrude" }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: depthId, className: "font-mono text-xs text-zinc-400", children: "Depth" }), _jsx("input", { id: depthId, type: "number", min: 0.1, step: 0.1, value: depth, onChange: handleDepthChange, "aria-describedby": depthError ? validationId : undefined, "aria-invalid": depthError !== null, className: [
                            'w-full px-3 py-2 rounded bg-zinc-700 text-zinc-100 font-mono text-sm',
                            'border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800 focus:ring-blue-400',
                            depthError ? 'border-red-500' : 'border-zinc-600',
                        ].join(' ') }), depthError && (_jsx("p", { id: validationId, role: "alert", className: "text-xs text-red-400 font-mono", children: depthError }))] }), _jsxs("div", { className: "flex items-center gap-3 min-h-[44px]", children: [_jsx("input", { id: symmetricId, type: "checkbox", checked: symmetric, onChange: handleSymmetricChange, className: "w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-400 focus:ring-offset-zinc-800 cursor-pointer" }), _jsx("label", { htmlFor: symmetricId, className: "font-mono text-xs text-zinc-300 cursor-pointer select-none", children: "Symmetric" })] }), _jsx("button", { type: "button", disabled: !canExtrude, onClick: handleExtrude, onKeyDown: handleKeyDown, "aria-disabled": !canExtrude, className: [
                    'w-full py-2 px-4 rounded text-sm font-semibold text-white',
                    'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-800 focus:ring-blue-400',
                    // min 44px touch target via py-2 + text-sm = ~42px, explicit min-h ensures compliance
                    'min-h-[44px]',
                    canExtrude
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-zinc-600 text-zinc-400 cursor-not-allowed',
                ].join(' '), children: "Extrude" })] }));
}
