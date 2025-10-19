# ARMAO Video Editor

A full-stack browser video studio that keeps heavy lifting in Node/FFmpeg and presents a clean, modular React experience. The project now ships with a production-ready folder layout, strongly typed request validation, and clear separation between upload management, transformation pipelines, and UI feature panels.

## Tech Highlights
- **Backend:** Express 5, Fluent-FFmpeg, Zod validation, layered services/controllers, persistent media library.
- **Frontend:** React 19 (CRA), Material UI, central editor context + action hooks, feature-specific panels.
- **Video Processing:** Native FFmpeg via fluent-ffmpeg (configurable path), automatic asset cataloguing, pipeline-based export.

## Repository Layout
```
.
├── backend
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── storage/
│       ├── utils/
│       └── validators/
├── frontend
│   ├── package.json
│   └── src
│       ├── App.js
│       ├── components/
│       ├── context/
│       ├── features/
│       ├── hooks/
│       ├── services/
│       └── theme/
├── docs/
└── README.md
```

## Backend Overview
- **Express Application (`src/app.js`)** – registers security middleware, JSON parsing, static media hosting, and API routes.
- **Library Persistence (`src/storage/library.js`)** – every uploaded/generated asset is tracked with metadata, persisted to `storage/library.json`, and available to the client.
- **Services** – `media.service.js` orchestrates FFmpeg pipelines (trim, filter, overlays, audio, merge, export) and wraps outputs into library assets. Low-level FFmpeg operations live in `ffmpeg.service.js` with consistent helper utilities.
- **Validation** – all mutating routes validate bodies with Zod schemas to guarantee predictable FFmpeg calls.
- **Routing** – versioned under `/api/v1/media` with clean resource+action endpoints:
  - `POST /media/assets` – upload any media file
  - `POST /media/assets/:id/trim` – create trimmed clip
  - `POST /media/assets/:id/filter` – apply visual filters
  - `POST /media/assets/:id/text-overlays` – render text overlays
  - `POST /media/assets/:id/image-overlays` – composite image overlays
  - `POST /media/assets/:id/audio/mute|replace` – audio controls
  - `POST /media/actions/merge` – merge multiple clips
  - `POST /media/actions/export` – build final export (format/resolution/mute pipeline)
  - `GET /media/assets/:id/download|stream` – retrieve rendered media

Environment configuration lives in `.env` (optional). Key variables:
```
PORT=5000
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe
FFPROBE_PATH=C:\ffmpeg\bin\ffprobe.exe
STORAGE_ROOT=./storage
CORS_ORIGIN=http://localhost:3000
MAX_UPLOAD_SIZE_BYTES=1073741824
```

## Frontend Overview
- **Editor Context (`context/EditorContext.js`)** – centralises asset catalogue, active clip, loading state, and notifications. All panels consume this context via hooks.
- **Action Hooks (`hooks/useEditorActions.js`)** – declarative wrappers around the API that manage status overlays, success/error messaging, and state refresh.
- **Feature Panels (`features/*`)** – every editing capability (import, trim, filters, overlays, audio, merge, export) is isolated for maintainability.
- **Layout** – `Sidebar` drives tool selection, `MainStage` pairs the video preview with the active panel and an optional library view, `HeaderBar` handles brand + theme + refresh.
- **Services** – `services/mediaApi.js` mirrors backend endpoints and automatically builds media URLs for streaming/downloading.

## Getting Started
### 1. Install Root Prerequisites
Ensure FFmpeg is installed locally and its binaries are reachable by the backend (update `.env` if necessary).

### 2. Boot the Backend
```bash
cd backend
npm install
npm run dev   # hot reload with nodemon
# or: npm start
```
The server listens on `PORT` (default `5000`) and persists uploads to `storage/uploads`.

### 3. Boot the Frontend
```bash
cd frontend
npm install
npm start
```
The CRA dev server runs on `http://localhost:3000` and targets the backend at `http://localhost:5000/api/v1` (configurable with `REACT_APP_API_URL` and `REACT_APP_MEDIA_URL`).

## Development Tips
- When adding new transformations, implement the FFmpeg logic in `services/ffmpeg.service.js`, wrap it in `media.service.js`, validate inputs with Zod, and expose the controller/route.
- The frontend relies on asset IDs. Always upload supporting media (images/audio) first, then reuse the returned IDs across panels.
- All heavy operations toggle the global `StatusOverlay` and surface feedback through the snackbar host.

## Roadmap Ideas
1. Persist user projects in a database, storing asset relationships and timelines.
2. Add WebSocket progress reporting for long-running FFmpeg operations.
3. Extend export pipeline with LUTs, transitions, and subtitle burn-in.
4. Provide integration tests around the media service and controller layer.

Enjoy the revamped ARMAO editor – the codebase is now organised for fast iteration and clear troubleshooting.
