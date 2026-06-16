import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useExport } from '../hooks/useExport';
const FORMAT_LABELS = {
    step: 'STEP',
    gltf: 'GLTF',
    stl: 'STL',
};
const FORMATS = ['step', 'gltf', 'stl'];
export function ExportPanel({ solidId, geometry, name }) {
    const [selected, setSelected] = useState('step');
    const { exportSolid, exporting, error } = useExport();
    const handleExport = () => {
        if (!geometry)
            return;
        void exportSolid(selected, { solidId, geometry, name });
    };
    return (_jsxs("div", { className: "flex flex-col gap-3 p-3 bg-surface-800 border border-surface-600/50 rounded font-mono", children: [_jsx("span", { className: "text-[10px] text-zinc-500 uppercase tracking-widest", children: "Export" }), _jsx("div", { className: "flex gap-1", children: FORMATS.map((fmt) => (_jsx("button", { onClick: () => setSelected(fmt), "aria-pressed": selected === fmt, className: [
                        'flex-1 py-1 text-[11px] rounded border transition-colors',
                        selected === fmt
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-surface-700 border-surface-600/50 text-zinc-400 hover:text-zinc-200 hover:border-surface-500',
                    ].join(' '), children: FORMAT_LABELS[fmt] }, fmt))) }), _jsx("button", { onClick: handleExport, disabled: !geometry || exporting, "aria-disabled": !geometry || exporting, className: [
                    'w-full py-1.5 text-[11px] rounded border transition-colors',
                    geometry && !exporting
                        ? 'bg-surface-700 border-surface-600/50 text-zinc-300 hover:bg-surface-600 hover:text-white'
                        : 'bg-surface-800 border-surface-600/30 text-zinc-600 cursor-not-allowed',
                ].join(' '), children: exporting ? 'Exporting...' : `Export .${selected}` }), !geometry && (_jsx("p", { className: "text-[10px] text-zinc-600", children: "No geometry selected" })), error && (_jsx("div", { role: "alert", className: "px-2 py-1.5 text-[10px] text-red-400 bg-red-950/40 border border-red-800/50 rounded", children: error }))] }));
}
