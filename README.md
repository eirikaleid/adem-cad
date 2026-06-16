<div align="center">

# ADEM CAD

**Browser-native parametric CAD — sketch, extrude, boolean, export. No install required.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r171-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![OpenCascade](https://img.shields.io/badge/OpenCascade.js-WASM-orange?style=flat-square)](https://ocjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## What is adem_cad?

adem_cad is a **SolidWorks-inspired parametric CAD application** that runs entirely in the browser. It combines a real B-Rep CAD kernel (OpenCascade.js, compiled to WASM) with a Three.js WebGPU viewport — giving you genuine solid geometry operations without installing any software.

> **Sketch on a plane → Extrude into a solid → Boolean combine → Export as STEP**
> All in one browser tab.

---

## Features

### 3D Viewport
- WebGPU renderer (WebGL fallback) via Three.js r171
- Orbit / Pan / Zoom with scroll-to-cursor zoom
- ViewCube for instant axis-aligned view snapping (Top / Front / Right / Back / Bottom)
- Double-click to reset view, keyboard shortcuts `1 3 7 5` for standard views
- Hover highlight and click-to-select on meshes
- Coordinate legend (X → Y ↑ Z ↗) always visible

### 2D Sketcher
- Plane selection (XY / YZ / XZ) before sketching
- Draw **lines**, **arcs**, and **circles** on a 2D canvas overlay
- Entity selection and deletion (`Del`)
- `Ctrl+Z` undo, `Esc` to cancel
- Live entity count display

### Solid Modeling (OpenCascade.js B-Rep)
- **Extrude** — turn any closed sketch into a solid with configurable depth and symmetric option
- **Boolean** — Union / Subtract / Intersect between any two solids
- All heavy computation offloaded to a **Web Worker** (main thread never blocks)
- Auto-open Extrude panel after sketch completion

### Feature Tree
- Ordered operation history (Extrude, Boolean)
- Full rollback capability — remove any operation and rebuild

### Export
- **STEP** — industry-standard B-Rep exchange format
- **GLTF 2.0** — web-optimized for rendering pipelines
- **STL** — 3D printing ready

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `S` | New sketch |
| `E` | Extrude panel |
| `B` | Boolean panel |
| `X` | Export panel |
| `Esc` | Cancel / close panel |
| `F` | Fit view |
| `1 / 3 / 7 / 5` | Front / Right / Top / Perspective snap |
| `Ctrl+Z` | Undo (sketch mode) |
| `Del` | Delete selected entity / solid |

---

## Architecture

### Monorepo (pnpm workspaces)

```
adem_cad/
├── packages/
│   ├── client/          # React 19 frontend (Vite 6)
│   ├── server/          # Express backend (ESM, Node.js)
│   └── shared/          # Common TypeScript types
└── package.json
```

### Feature-Based Frontend Structure

```
packages/client/src/
├── core/                     # App shell, providers, router
├── features/
│   ├── viewport/             # Three.js canvas, camera, ViewCube
│   ├── sketch/               # 2D sketcher (line, arc, circle)
│   ├── modeling/             # Extrude, Boolean via OcctAdapter
│   ├── tree/                 # Feature history store + UI
│   ├── export/               # STEP / GLTF / STL exporters
│   └── project/              # Open/save, project metadata
├── shared/                   # Cross-feature UI primitives, types, utils
└── infrastructure/
    ├── occt/                 # WASM loader + Worker bridge
    └── three/                # WebGPU renderer setup
```

### Design Patterns

**Abstract Factory** — three factory instances, each open for extension without modification:

| Factory | Products |
|---------|---------|
| `OperationFactory` | `ExtrudeOperation`, `BooleanOperation`, *(Fillet, Chamfer…)* |
| `ExporterFactory` | `StepExporter`, `GltfExporter`, `StlExporter` |
| `RendererFactory` | `WebGPURenderer`, `WebGLRenderer` (fallback) |

**Adapter** — `OcctAdapter` is the single gateway to all OpenCascade.js calls. Components never touch OCCT directly.

**Worker offloading** — `OcctLoader` initializes the WASM singleton once. All B-Rep computations run in a Worker thread via `OcctAdapterBridge`.

**Zustand stores** — `sceneStore` (solids + meshes + selection), `sketchStore` (active sketch entities), `treeStore` (operation history). Stores are the single source of truth; Three.js scene is derived from them.

### SOLID Principles

| Principle | How it's applied |
|-----------|-----------------|
| **S**ingle Responsibility | Each feature folder owns exactly one domain. `OcctAdapter` only wraps OCCT. |
| **O**pen/Closed | New operations (Fillet, Chamfer) → add a new class and call `OperationFactory.register()`. Zero edits to existing code. |
| **L**iskov Substitution | All exporters implement `IExporter`. All operations implement `IOperation`. Swap freely. |
| **I**nterface Segregation | `ISketchEntity` is `{ draw, getBounds }`. `IConstraint` is `{ apply, validate }`. No fat interfaces. |
| **D**ependency Inversion | Components depend on hooks (`useModeling`), not services. Services injected via context. |

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| UI Framework | React 19 + TypeScript 5.7 (strict) |
| Styling | Tailwind CSS 3 |
| Build | Vite 6 + `vite-plugin-wasm` |
| 3D Rendering | Three.js r171 (WebGPU / WebGL) |
| CAD Kernel | OpenCascade.js (WASM) |
| State | Zustand 5 |
| Backend | Node.js + Express 4 (ESM) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| File Storage | MinIO (S3-compatible) |
| Validation | Zod |
| Package Manager | pnpm (workspaces) |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** 15+
- **MinIO** (or any S3-compatible storage)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/adem_cad.git
cd adem_cad
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/adem_cad

# MinIO / S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=adem-cad-files

# Server
PORT=3001
```

### 3. Database Setup

```bash
pnpm --filter server db:generate
pnpm --filter server db:migrate
```

### 4. Run (Development)

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |

### 5. Build (Production)

```bash
pnpm build
```

Builds `shared` → `client` → `server` in dependency order.

### 6. Type Check

```bash
pnpm typecheck
```

Runs `tsc --noEmit` across all packages.

---

## Development Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Three.js WebGPU viewport, orbit controls, grid | ✅ Done |
| 2 | 2D sketcher (line, arc, circle) | ✅ Done |
| 3 | Extrude operation via OpenCascade.js | ✅ Done |
| 4 | Boolean operations (union / subtract / intersect) | ✅ Done |
| 5 | Feature tree (history, rollback) | ✅ Done |
| 6 | Export (STEP / GLTF / STL) | ✅ Done |
| 7 | Backend (project save/load, PostgreSQL, MinIO) | ✅ Done |
| 8 | Polish (fillet, chamfer, context menus, themes) | 🔄 In Progress |

---

## Project Structure Conventions

- **No cross-feature direct imports** — features communicate via Zustand stores or barrel exports (`@/features/modeling`)
- **No OCCT calls in components** — always through `OcctAdapter` / `OcctAdapterBridge`
- **No `any`** — strict TypeScript throughout; use `unknown` + type guards where needed
- **New operation type** — implement `IOperation`, then `OperationFactory.register('type', MyOperation)`
- **New exporter** — implement `IExporter`, then `ExporterFactory.register('format', MyExporter)`

---

## File Format Support

| Format | Read | Write | Use Case |
|--------|------|-------|----------|
| STEP | — | ✅ | Industry B-Rep exchange |
| GLTF 2.0 | — | ✅ | Web rendering, game engines |
| STL | — | ✅ | 3D printing |
| IGES | Planned | Planned | Legacy CAD interchange |

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
