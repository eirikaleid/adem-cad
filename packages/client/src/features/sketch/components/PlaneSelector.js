import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSketchStore } from '../store/sketchStore';
const PLANES = ['XY', 'YZ', 'XZ'];
const PLANE_DESC = {
    XY: 'Top view',
    YZ: 'Right view',
    XZ: 'Front view',
};
export function PlaneSelector({ onSelect }) {
    const { startSketch, activeSketch } = useSketchStore();
    const handleSelect = (plane) => {
        startSketch(plane);
        onSelect?.();
    };
    return (_jsxs("div", { className: "flex flex-col gap-3 p-4 bg-surface-800 border border-surface-600/50 rounded-lg shadow-xl", role: "group", "aria-label": "Select sketch plane", children: [_jsx("span", { className: "font-mono text-[10px] text-zinc-500 uppercase tracking-widest", children: "Select Plane" }), _jsx("div", { className: "flex gap-2", children: PLANES.map((plane) => {
                    const isActive = activeSketch?.plane === plane;
                    return (_jsxs("button", { onClick: () => handleSelect(plane), "aria-pressed": isActive, "aria-label": `${plane} plane — ${PLANE_DESC[plane]}`, className: `
                flex flex-col items-center gap-1 px-4 py-3 font-mono rounded border transition-colors
                min-w-[64px]
                ${isActive
                            ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                            : 'border-surface-600/50 text-zinc-300 hover:text-white hover:bg-surface-600 hover:border-surface-500'}
              `, children: [_jsx("span", { className: "text-sm font-semibold", children: plane }), _jsx("span", { className: "text-[9px] text-zinc-500", children: PLANE_DESC[plane] })] }, plane));
                }) })] }));
}
