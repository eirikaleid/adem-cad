# adem_cad — Project Brain (v1)

> Web-based CAD application (SolidWorks-inspired). Read once per session, cache everything.

---

## 1. Project Identity

```
Name    : adem_cad
Type    : Web-based parametric CAD
Goal    : Browser-native 3D solid modeling (sketch → extrude → boolean → export)
Pattern : Feature-based architecture + SOLID principles + Abstract Factory
Lang    : TypeScript (strict, no `any`)
```

---

## 2. Tech Stack (Locked)

```
FRONTEND
├── React 19 + TypeScript (strict)
├── Three.js r171+          → WebGPU renderer (viewport)
├── OpenCascade.js (WASM)   → CAD kernel (B-rep, boolean, STEP)
├── Zustand                 → scene graph + model state
└── Tailwind CSS            → UI panels, toolbar, sidebar

BACKEND
├── Node.js + Express + TypeScript (ESM)
├── PostgreSQL              → project/file metadata
├── MinIO                   → 3D file storage (STEP, GLTF, STL)
└── Worker Threads          → heavy OCCT computations offloaded

FILE FORMATS
├── STEP / IGES             → industry standard import/export
├── GLTF 2.0                → web-optimized rendering
└── STL                     → 3D print export
```

---

## 3. Architecture: Feature-Based

```
src/
├── core/                        ← App shell, providers, router
│   ├── App.tsx
│   ├── providers/
│   │   ├── ThemeProvider.tsx
│   │   └── SceneProvider.tsx
│   └── router/
│       └── index.tsx
│
├── features/                    ← ONE folder per domain feature
│   ├── viewport/                ← 3D canvas, camera, controls
│   │   ├── components/
│   │   │   ├── Viewport3D.tsx
│   │   │   └── ViewCube.tsx
│   │   ├── hooks/
│   │   │   └── useOrbitControls.ts
│   │   ├── services/
│   │   │   └── RendererFactory.ts   ← Abstract Factory
│   │   └── index.ts                 ← public API (barrel)
│   │
│   ├── sketch/                  ← 2D sketcher on planes
│   │   ├── components/
│   │   │   ├── SketchCanvas.tsx
│   │   │   └── ConstraintPanel.tsx
│   │   ├── entities/
│   │   │   ├── Line.ts
│   │   │   ├── Arc.ts
│   │   │   └── Circle.ts
│   │   ├── services/
│   │   │   └── SketchKernelAdapter.ts
│   │   └── index.ts
│   │
│   ├── modeling/                ← Solid operations (extrude, revolve, boolean)
│   │   ├── operations/
│   │   │   ├── ExtrudeOperation.ts
│   │   │   ├── RevolveOperation.ts
│   │   │   ├── BooleanOperation.ts
│   │   │   └── OperationFactory.ts  ← Abstract Factory
│   │   ├── services/
│   │   │   └── OcctAdapter.ts       ← OpenCascade.js wrapper
│   │   └── index.ts
│   │
│   ├── tree/                    ← Feature tree (model history)
│   │   ├── components/
│   │   │   └── FeatureTree.tsx
│   │   ├── store/
│   │   │   └── treeStore.ts
│   │   └── index.ts
│   │
│   ├── export/                  ← STEP / GLTF / STL export
│   │   ├── exporters/
│   │   │   ├── StepExporter.ts
│   │   │   ├── GltfExporter.ts
│   │   │   └── ExporterFactory.ts   ← Abstract Factory
│   │   └── index.ts
│   │
│   └── project/                 ← File open/save, project metadata
│       ├── components/
│       │   └── ProjectPanel.tsx
│       ├── services/
│       │   └── ProjectService.ts
│       └── index.ts
│
├── shared/                      ← Cross-feature utilities (no business logic)
│   ├── types/
│   │   ├── geometry.types.ts
│   │   ├── scene.types.ts
│   │   └── operation.types.ts
│   ├── utils/
│   │   ├── math.ts
│   │   └── units.ts
│   └── ui/
│       ├── Button.tsx
│       ├── Panel.tsx
│       └── Toolbar.tsx
│
└── infrastructure/              ← External integrations, WASM loaders
    ├── occt/
    │   ├── OcctLoader.ts        ← WASM init + singleton
    │   └── OcctWorker.ts        ← Worker thread bridge
    ├── three/
    │   └── WebGPUSetup.ts       ← Three.js WebGPU renderer init
    └── storage/
        └── MinioClient.ts
```

---

## 4. SOLID Principles — Applied

```
S — Single Responsibility
    Each feature folder owns ONE domain. OcctAdapter only wraps OCCT.
    RendererFactory only creates renderers. No god classes.

O — Open/Closed
    New operations (Fillet, Chamfer) → add new class, never edit existing.
    OperationFactory.register('fillet', FilletOperation) pattern.

L — Liskov Substitution
    All exporters implement IExporter interface.
    All operations implement IOperation interface.
    Swap StepExporter → IgesExporter with zero consumer changes.

I — Interface Segregation
    ISketchEntity: { draw, getBounds }
    IConstraint: { apply, validate }
    Never one fat interface for everything.

D — Dependency Inversion
    OcctAdapter depends on IOcctKernel abstraction.
    Components depend on hooks (useModeling), not services directly.
    Services injected via context, not instantiated inside components.
```

---

## 5. Abstract Factory Pattern — Core Usage

### Pattern Contract

```typescript
// Base interfaces
interface IOperation {
  execute(input: OperationInput): Promise<Solid>
  preview(input: OperationInput): Mesh
  validate(input: OperationInput): ValidationResult
}

interface IOperationFactory {
  create(type: OperationType): IOperation
  register(type: OperationType, ctor: OperationConstructor): void
}

// Concrete factory
class ModelingOperationFactory implements IOperationFactory {
  private registry = new Map<OperationType, OperationConstructor>()

  create(type: OperationType): IOperation {
    const Ctor = this.registry.get(type)
    if (!Ctor) throw new Error(`Unknown operation: ${type}`)
    return new Ctor(this.occtAdapter)
  }
}
```

### Factory Instances (3 total)

```
OperationFactory   → Extrude | Revolve | Boolean | Fillet (modeling)
ExporterFactory    → STEP | GLTF | STL (export)
RendererFactory    → WebGPU | WebGL fallback (viewport)
```

---

## 6. State Management (Zustand)

```typescript
// Scene store — single source of truth
interface SceneStore {
  solids: Map<string, Solid>      // OCCT solid objects
  meshes: Map<string, Mesh>       // Three.js meshes (derived)
  selected: string[]              // selected solid IDs
  featureHistory: Operation[]     // ordered operation log

  addOperation: (op: Operation) => void
  removeOperation: (id: string) => void
  updateMesh: (id: string, mesh: Mesh) => void
  selectSolid: (id: string, multi?: boolean) => void
}
```

---

## 7. OpenCascade.js Integration Rules

```
1. WASM loads once → OcctLoader singleton, cached in infrastructure/occt/
2. Heavy ops → Worker Thread (never block main thread)
3. All OCCT calls → through OcctAdapter (never direct in components)
4. Mesh conversion → OCCT BRep → Three.js BufferGeometry in worker
5. Error boundary → every OCCT call wrapped in try/catch with typed errors
```

---

## 8. Feature Development Workflow

```
New Feature Request
  → Create: src/features/<name>/
  → Define: types in shared/types/
  → Implement: service → hook → component
  → Register: factory if new operation type
  → Export: public API via index.ts barrel
  → Never: import across features (use shared/ or events)
```

### Cross-Feature Communication

```
❌ WRONG: import { something } from '../modeling/services/OcctAdapter'
✅ RIGHT: import { something } from '@/features/modeling'   (barrel)
✅ RIGHT: Zustand store (shared state)
✅ RIGHT: Custom events (decoupled side effects)
```

---

## 9. TypeScript Rules

```
- strict: true (no exceptions)
- No `any` — use `unknown` + type guard
- Geometry types: geometry.types.ts (Vec3, Plane, BoundingBox, etc.)
- OCCT return types: always typed wrappers, never raw OCCT objects in UI
- Async: always Promise<T>, never callback hell
- ESM only: import/export, no require()
```

---

## 10. Build & Dev Setup

```
Package manager : pnpm (workspaces)
Bundler         : Vite 6
WASM loading    : Vite plugin for .wasm files (vite-plugin-wasm)
Worker          : vite-plugin-worker
Port            : Frontend :5173 | Backend :3001
Env             : .env (never commit)
```

### Monorepo Structure

```
adem_cad/
├── packages/
│   ├── client/     → React frontend
│   ├── server/     → Express backend
│   └── shared/     → Common types (shared between client+server)
├── CLAUDE.md       ← this file
├── package.json    → pnpm workspace root
└── .env.example
```

---

## 11. Development Phases

```
Phase 1 — Viewport        Three.js WebGPU canvas, orbit/pan/zoom, grid
Phase 2 — Sketch          2D plane selection, line/arc/circle drawing
Phase 3 — Extrude         First OCCT operation, mesh display
Phase 4 — Boolean         Union/subtract/intersect operations
Phase 5 — Feature Tree    Operation history, rollback
Phase 6 — Export          STEP/GLTF/STL download
Phase 7 — Backend         Project save/load, PostgreSQL, MinIO
Phase 8 — Polish          Keyboard shortcuts, context menus, themes
```

---

## 12. Claude Behavior Rules (Project-Specific)

```
- Read this file ONCE per session, cache it
- Never re-read unless user says "reload context"
- Feature additions → always check Phase order above
- New operation type → always use OperationFactory.register()
- Cross-feature imports → block and redirect to barrel/shared
- OCCT calls in components → block and redirect to OcctAdapter
- No `any` → hard block, ask for proper type
- Token save: reference "Per CLAUDE.md §X" instead of repeating rules
```

---

## Version
- **v1** — 2026-06-16 — Initial architecture definition
