import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSketchStore } from '../store/sketchStore';
const TOOLS = [
    { id: 'select', label: 'Select', title: 'Select entities (Q)' },
    { id: 'line', label: 'Line', title: 'Draw line (L)' },
    { id: 'circle', label: 'Circle', title: 'Draw circle (C)' },
    { id: 'arc', label: 'Arc', title: 'Draw arc (A)' },
];
export function SketchToolbar() {
    const { activeTool, setTool, endSketch, activeSketch } = useSketchStore();
    if (!activeSketch)
        return null;
    return (_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 bg-surface-800 border border-surface-600/50 rounded", role: "toolbar", "aria-label": "Sketch tools", children: [TOOLS.map((tool) => {
                const isActive = activeTool === tool.id;
                return (_jsx("button", { onClick: () => setTool(tool.id), title: tool.title, "aria-pressed": isActive, "aria-label": tool.title, className: `
              px-3 py-1.5 font-mono text-[11px] rounded border transition-colors
              min-h-[36px]
              ${isActive
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                        : 'border-transparent text-zinc-400 hover:text-white hover:bg-surface-600'}
            `, children: tool.label }, tool.id));
            }), _jsx("div", { className: "w-px h-5 bg-surface-600 mx-1", "aria-hidden": "true" }), _jsx("button", { onClick: endSketch, title: "Finish sketch and return to 3D view", "aria-label": "Finish sketch", className: "\n          px-3 py-1.5 font-mono text-[11px] rounded border transition-colors\n          min-h-[36px]\n          border-green-600/50 text-green-400 hover:bg-green-500/10 hover:border-green-500\n        ", children: "Finish Sketch" })] }));
}
