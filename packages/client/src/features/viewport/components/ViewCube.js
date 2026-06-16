import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const FACES = [
    { label: 'TOP', id: 'top', style: 'top-0 left-1/2 -translate-x-1/2' },
    { label: 'FRONT', id: 'front', style: 'bottom-0 left-1/2 -translate-x-1/2' },
    { label: 'RIGHT', id: 'right', style: 'right-0 top-1/2 -translate-y-1/2' },
    { label: 'LEFT', id: 'left', style: 'left-0 top-1/2 -translate-y-1/2' },
];
export function ViewCube({ onFace }) {
    return (_jsx("div", { className: "absolute top-4 right-4 w-16 h-16 select-none", children: _jsxs("div", { className: "relative w-full h-full", children: [FACES.map((f) => (_jsx("button", { onClick: () => onFace(f.id), className: `absolute px-1 py-0.5 text-[9px] font-mono text-zinc-400 hover:text-white bg-surface-700/60 hover:bg-surface-600/80 border border-surface-500/40 rounded transition-colors ${f.style}`, children: f.label }, f.id))), _jsx("div", { className: "absolute inset-4 border border-surface-500/40 rounded-sm bg-surface-800/40" })] }) }));
}
