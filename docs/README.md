# Video DirectX – Project Documentation

This document summarises the full-stack video editor that lives in this repository. It complements the other files in the `docs/` directory and is intended to give new contributors (or your future self) an at-a-glance refresher of how everything fits together.

---

## 1. Solution Overview

Video DirectX is a browser-based studio. The **frontend** is a React + Material UI experience that guides the user through a tool-driven workflow (import → edit → export). The **backend** is an Express 5 API that wraps FFmpeg to perform all heavy media work on the server. Assets are persisted on disk and tracked in a JSON “library” for quick lookups and re-use across operations.

The stack:

| Layer     | Technology                                                                                    |
| --------- | --------------------------------------------------------------------------------------------- |
| Frontend  | React 19, Material UI v7, Context + custom hooks, CRA tooling                                 |
| Backend   | Node.js 20, Express 5, Multer, Fluent-FFmpeg, Zod for validation                              |
| Media I/O | FFmpeg CLI (via fluent-ffmpeg), on-disk storage (`backend/storage/uploads`, `library.json`)   |

---

## 2. Repository Structure

```
.
├── backend/ 🔧                   # Express + FFmpeg service
│   ├── src/
│   │   ├── app.js               # Express app wiring (helmet, cors, routes, static hosting)
│   │   ├── server.js            # Bootstraps HTTP server & media library
│   │   ├── config/              # env + ffmpeg configuration helpers
│   │   ├── constants/           # Mime lists, export formats, speed presets
│   │   ├── controllers/         # HTTP controllers (media.controller.js)
│   │   ├── middleware/          # async handler, multer upload, zod validator, error handlers
│   │   ├── routes/              # Route declarations (media.routes.js)
│   │   ├── services/            # Core business logic (media.service.js, ffmpeg.service.js, metadata)
│   │   ├── storage/             # Library management for assets (indexing + persistence)
│   │   ├── utils/               # Logger + ApiError helpers
│   │   └── validators/          # Zod schemas per endpoint
│   └── storage/ 📁              # Upload/generated asset folders (+ library.json catalogue)
│
├── frontend/ 💻                 # React client
│   ├── src/
│   │   ├── App.js               # Shell (theme, layout, global providers)
│   │   ├── components/          # Layout, media player, common UI
│   │   ├── constants/           # Sidebar/tool definitions
│   │   ├── context/             # EditorContext (global state, snackbar, asset session)
│   │   ├── features/            # One file per panel (import, trim, filters, overlays, audio, speed, merge, export, library)
│   │   ├── hooks/               # `useEditor`, `useEditorActions`
│   │   ├── services/            # API client + media API wrappers
│   │   ├── theme/               # MUI theme customisations
│   │   └── utils/               # Format helpers (duration formatting, etc.)
│   └── public/ / build/         # CRA artefacts
│
├── docs/ 📚                     # Project documentation bundle
│   ├── README.md (this file)    # Master overview
│   ├── user-flow.md             # UI journey and tool-by-tool walkthrough
│   ├── api-specs.md             # HTTP endpoint catalogue (sync with backend routes)
│   ├── SRS.md                   # High-level software requirements
│   └── architecture-diagram.png # High-level diagram (placeholder / update as needed)
│
├── package.json                 # Root dependencies (shared)
└── README.md                    # Marketing-level overview for the repository
```

---

## 3. Backend walkthrough

### Entry point
- **`backend/src/server.js`** initialises the media library (`initLibrary()`), then starts the HTTP server.
- **`backend/src/app.js`** sets up middleware (helmet, cors, body parsing), serves `/media/files` statically, mounts routes under `/api/v1`, and plugs in the not-found / error handlers.

### Configuration
- **`config/env.js`** loads `.env`, resolves storage directories, ensures they exist, and exposes config (`port`, `storage`, `ffmpeg`, etc.).
- **`.env`** variables: `PORT`, `FFMPEG_PATH`, `FFPROBE_PATH`, `STORAGE_ROOT`, `CORS_ORIGIN`, `MAX_UPLOAD_SIZE_BYTES`.

### Media routes & validators
- **`routes/media.routes.js`** registers all endpoints:
  - `POST /media/assets` (single upload), `/media/assets/batch`
  - `GET /media/assets`, `/media/assets/:assetId`, stream/download endpoints
  - Transformations: `/trim`, `/filter`, `/text-overlays`, `/image-overlays`, audio mute/replace, `/speed`
  - Actions: `/actions/merge`, `/actions/export`
- **`validators/media.validators.js`** defines Zod schemas for each payload (trim, filter, overlays, replace audio, merge, speed, export).

### Controllers & services
- **`controllers/media.controller.js`** translate HTTP requests into service calls and handle 201 responses.
- **`services/media.service.js`** orchestrates workflows:
  - `uploadSingle` / `uploadMany` → adds assets to library and returns metadata enriched with FFprobe data.
  - `trimAsset`, `applyAssetFilter`, `addAssetText`, `addAssetImage`, `muteAssetAudio`, `replaceAssetAudio`, `changeAssetSpeed`, `mergeAssetClips`, `exportAsset` → each ensure the correct asset type, invoke FFmpeg helpers, and register the generated outputs.
  - `listAssetsWithMetadata` sorts session assets by recency.
- **`services/ffmpeg.service.js`** contains the low-level FFmpeg commands for trimming, filters (eq / hue), text overlays, image overlays, mute, replace audio, concat merges, transcoding, and the playback speed helper (`setpts` + `atempo`).
- **`services/metadata.service.js`** wraps FFprobe to read duration, resolution, codec info.

### Storage/lifecycle
- **`storage/library.js`** acts as an in-memory index backed by `storage/library.json`. It stores asset metadata (`id`, original filename, mimetype, size, kind) and exposes helpers for add/update/remove/list plus path resolution. On boot it loads the JSON so the app survives restarts.

### Middleware & utilities
- **`middleware/upload.js`** uses Multer, enforces allowed MIME/extension lists, and normalises octet-stream uploads. Limits are driven by config.
- **`middleware/validate.js`** attaches Zod validation to routes.
- **`middleware/errorHandler.js`** serialises `ApiError`s and unexpected exceptions.
- **`utils/logger.js`** provides environment-scoped console logging.
- **`constants/index.js`** gathers MIME whitelists, export formats, resolution filters, and speed presets ([0.5×, 0.75×, 1×, 1.25×, 1.5×, 2×]).

---

## 4. Frontend walkthrough

### Global state & services
- **`context/EditorContext.js`**: stores the active asset list for the current session, loading/error state, snackbar handling, undo stack, and functions to track session-specific IDs.
- **`hooks/useEditor.js`**: convenience wrapper around the context.
- **`hooks/useEditorActions.js`**: central command hub. Each action toggles UI feedback, handles undo registration, refreshes allowed assets, and calls into `services/mediaApi.js`.
- **`services/apiClient.js`**: fetch wrapper (JSON + blobs) with robust base URL handling and clearer error messaging (“Unable to reach media API…”).
- **`services/mediaApi.js`**: exports the typed calls to the backend (upload, trim, filter, overlays, audio controls, speed change, merge, export, download).

### Layout & shared UI
- **`App.js`**: wraps the entire experience in `EditorProvider`, `ThemeProvider`, and applies the animated background. Renders the `HeaderBar`, `Sidebar`, `MainStage`, `StatusOverlay`, and `SnackbarHost`.
- **`components/layout/HeaderBar.js`**: branding, refresh, and theme toggle.
- **`components/layout/Sidebar.js`**: lists tools defined in `constants/tools.js` (Import, Trim, Filters, Text, Image, Audio, Speed, Merge, Export). Import is the only tool enabled before a primary asset is uploaded.
- **`components/layout/MainStage.js`**: two-column layout (video player + active panel) with fade transitions, followed by the session-scoped asset library.
- **`components/media/VideoPlayer.js`**: displays the currently active asset, title, duration metadata, and video controls.
- **`components/common/StatusOverlay.js` / `SnackbarHost`**: global feedback components.

### Feature panels
Each panel lives under `frontend/src/features/` and maps 1:1 with a backend capability:

| Feature            | Panel file                               | What it does                                                                                     |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Import             | `import/ImportPanel.js`                  | Upload primary clip (resets session)                                                             |
| Trim               | `trim/TrimPanel.js`                      | Define start/end, request new trimmed clip                                                       |
| Filters            | `filters/FilterPanel.js`                 | Brightness, contrast, saturation, grayscale                                                      |
| Text overlay       | `overlays/TextOverlayPanel.js`           | Choose a preset or custom `(w-text_w)` expressions, font controls, render overlay                |
| Image overlay      | `overlays/ImageOverlayPanel.js`          | Upload overlay asset, choose preset position/size, optional custom pixel sizes, adjust opacity   |
| Audio              | `audio/AudioPanel.js`                    | Mute or replace soundtrack with another uploaded asset                                           |
| Speed              | `speed/SpeedPanel.js`                    | Render faster/slower variants using discrete presets (0.5× → 2×)                                 |
| Merge              | `merge/MergePanel.js`                    | Select primary + second clip (autofill with uploads), preview both, merge into new clip          |
| Export             | `export/ExportPanel.js`                  | Combine operations (trim, filters, overlays, audio tweaks, format/resolution transcode)          |
| Library            | `library/AssetLibraryPanel.js`           | Lists assets generated in the current session. “Session scoped” indicates it resets on new import |

The asset library panel and undo logic respect the session-based IDs managed by `EditorContext`. Generated clips remain available until the user imports a new primary video, at which point the session resets.

### Theme
- **`theme/index.js`** defines a light/dark palette, gradients, surface radii, and component overrides that the shell uses.

---

## 5. Typical workflow

1. **Import** a master video (Import panel). This clears any previous session assets.
2. The `Asset Library` (session scoped) contains the imported clip and any generated derivatives.
3. Pick tools in the sidebar to perform operations:
   - Trim segments, apply filters, add text/image overlays, mute/replace audio, render slow/fast motion variants, or merge the master with another clip.
4. Each action creates a new asset. Use the **Undo** button (available on most panels) to revert to the previous ID stored by the context.
5. Once satisfied, open **Export** to combine staged operations into a single output (with optional format + resolution changes).
6. Download the finished clip (via the export panel or the library’s download button).

The backend writes every generated file to `backend/storage/uploads/` and updates `library.json` so the session survives server restarts.

---

## 6. Development notes

### Environment setup
```bash
# Backend
cd backend
npm install
npm run dev    # starts Express with nodemon on PORT (default 5500)

# Frontend (new terminal)
cd frontend
npm install
npm start      # CRA dev server on http://localhost:3000/
```

Ensure FFmpeg/FFprobe are installed (and configure paths in `backend/.env` if not globally available). The frontend `.env` points at `http://127.0.0.1:5500/api/v1` by default.

### Testing
- Run `npm run build` in the frontend to confirm bundle integrity.
- Use the API specs (`docs/api-specs.md`) and Postman/HTTP clients if you want to exercise the backend directly.

### Storage & cleanup
- Media uploads live under `backend/storage/uploads/`. Delete unwanted files carefully; remove entries from `library.json` to keep the index clean.
- The project currently uses the filesystem for persistence; plug in a database later if multi-user isolation is required.

---

## 7. Additional resources

- **`docs/user-flow.md`** – step-by-step UI narrative with screenshots (update as UI evolves).
- **`docs/api-specs.md`** – list of endpoints and expected payloads (keep aligned with `media.routes.js`).
- **`docs/SRS.md`** – quick specification outline.
- **`docs/architecture-diagram.png`** – drop a visual diagram here if you update architecture.

Feel free to expand this documentation as new capabilities land—call out new panels, backend services, or deployment notes so the project remains approachable.
