import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { FeatureTree } from '@/features/tree/components/FeatureTree';
import { ExtrudePanel } from '@/features/modeling/components/ExtrudePanel';
import { BooleanPanel } from '@/features/modeling/components/BooleanPanel';
import { ExportPanel } from '@/features/export/components/ExportPanel';
import { useSceneStore } from '@/features/modeling/store/sceneStore';
export function FeaturePanel({ side, activeTool, onExtrude }) {
    const { solids, meshes, selected } = useSceneStore();
    const solidIds = Array.from(solids.keys());
    const selectedId = selected[0] ?? null;
    const selectedGeo = selectedId ? (meshes.get(selectedId) ?? null) : null;
    const selectedMeta = selectedId ? solids.get(selectedId) : null;
    return (_jsxs("aside", { className: `w-52 bg-surface-800 shrink-0 flex flex-col overflow-hidden ${side === 'left' ? 'border-r border-surface-600/50' : 'border-l border-surface-600/50'}`, children: [side === 'left' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "px-3 py-2 border-b border-surface-600/50 shrink-0", children: _jsx("span", { className: "font-mono text-[10px] text-zinc-500 uppercase tracking-widest", children: "Feature Tree" }) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx(FeatureTree, {}) })] })), side === 'right' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "px-3 py-2 border-b border-surface-600/50 shrink-0", children: _jsx("span", { className: "font-mono text-[10px] text-zinc-500 uppercase tracking-widest", children: activeTool ? activeTool.toUpperCase() : 'PROPERTIES' }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-2 flex flex-col gap-2", children: [selectedMeta && (_jsxs("div", { className: "font-mono text-[10px] text-zinc-400 bg-surface-700/50 rounded px-2 py-1.5 border border-surface-600/30", children: [_jsx("div", { className: "text-zinc-300 truncate", children: selectedMeta.name }), _jsxs("div", { className: "text-zinc-600 mt-0.5", children: [selectedMeta.id.slice(0, 12), "\u2026"] })] })), !selectedMeta && !activeTool && (_jsx("p", { className: "font-mono text-[11px] text-zinc-700 px-1 py-2", children: "No selection" })), activeTool === 'extrude' && onExtrude && (_jsx(ExtrudePanel, { onExtrude: onExtrude })), activeTool === 'boolean' && (_jsx(BooleanPanel, { solidIds: solidIds, onBoolean: (_type, _targetId, _toolId) => {
                                    // TODO: wire to OperationFactory in Phase 3 integration
                                } })), activeTool === 'export' && (_jsx(ExportPanel, { solidId: selectedId ?? '', geometry: selectedGeo, name: selectedMeta?.name ?? 'model' })), !activeTool && selectedMeta && (_jsx(ExportPanel, { solidId: selectedId, geometry: selectedGeo, name: selectedMeta.name }))] })] }))] }));
}
