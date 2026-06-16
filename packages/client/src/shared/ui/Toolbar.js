import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSketchStore } from '@/features/sketch/store/sketchStore';
const TOOLS = [
    { id: 'sketch', label: 'Sketch', key: 'S', desc: 'New sketch on plane' },
    { id: 'extrude', label: 'Extrude', key: 'E', desc: 'Extrude sketch' },
    { id: 'boolean', label: 'Boolean', key: 'B', desc: 'Boolean operation' },
    { id: 'export', label: 'Export', key: 'X', desc: 'Export model' },
];
export function Toolbar({ activeTool, onTool }) {
    const { activeSketch, endSketch } = useSketchStore();
    const inSketch = activeSketch !== null;
    return (_jsxs("header", { className: "flex items-center h-10 px-3 bg-surface-800 border-b border-surface-600/50 gap-3 shrink-0 select-none", children: [_jsxs("span", { className: "font-mono text-sm font-semibold text-zinc-200 tracking-wider shrink-0", children: ["adem", _jsx("span", { className: "text-blue-500", children: "_" }), "cad"] }), _jsx("div", { className: "w-px h-5 bg-surface-600 shrink-0" }), inSketch ? (
            /* Sketch mode: show sketch tools hint + exit */
            _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-mono text-[11px] text-blue-400", children: ["Sketching on ", activeSketch.plane, " plane"] }), _jsx("button", { onClick: endSketch, className: "px-2.5 py-1 text-[11px] font-mono text-green-400 border border-green-600/50 rounded hover:bg-green-500/10 transition-colors", children: "\u2713 Finish Sketch" }), _jsx("button", { onClick: endSketch, className: "px-2.5 py-1 text-[11px] font-mono text-zinc-500 border border-surface-600/50 rounded hover:text-red-400 hover:border-red-600/50 transition-colors", children: "\u2715 Cancel" })] })) : (
            /* Normal mode: main tools */
            _jsx("div", { className: "flex gap-0.5", children: TOOLS.map((t) => {
                    const isActive = activeTool === t.id;
                    return (_jsxs("button", { onClick: () => onTool(t.id), title: `${t.desc} (${t.key})`, "aria-pressed": isActive, className: `
                  flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded transition-colors
                  ${isActive
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                            : 'text-zinc-400 hover:text-white hover:bg-surface-600 border border-transparent'}
                `, children: [_jsx("span", { className: "text-[9px] text-zinc-600", children: t.key }), t.label] }, t.id));
                }) })), _jsx("div", { className: "flex-1" }), _jsx("span", { className: "font-mono text-[10px] text-zinc-700 shrink-0", children: "adem_cad v0.1" })] }));
}
