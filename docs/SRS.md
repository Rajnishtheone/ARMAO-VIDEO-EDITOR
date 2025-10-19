# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose  
This document defines the software requirements for **Video DirectX**, a browser-based video editing suite composed of a React frontend and a Node.js/Express backend that orchestrates FFmpeg. It serves as the single source of truth for stakeholders, developers, and QA engineers regarding scope, functionality, constraints, and quality expectations.

### 1.2 Scope  
Video DirectX enables users to upload source media, perform common editing actions (trimming, filters, overlays, audio manipulation, playback speed changes, clip merging), and export processed clips. Assets persist on disk and are catalogued for the duration of a session. The system targets desktop browsers with a server-side FFmpeg runtime.

### 1.3 Definitions, acronyms, abbreviations  
- **Asset** – Any uploaded or generated media file (video, audio, image).  
- **Session** – The lifetime of the editor state after importing a primary clip; subsequent operations apply to assets within this session.  
- **FFmpeg** – External command-line suite used for media processing.  
- **Library** – In-memory and JSON-backed index of assets (`backend/storage/library.json`).  
- **REST API** – JSON HTTP endpoints exposed under `/api/v1`.  

### 1.4 References  
- `docs/README.md` – Architectural overview.  
- `docs/user-flow.md` – UI journey.  
- `docs/api-specs.md` – REST endpoint catalogue.  
- Backend source – `backend/src/`.  
- Frontend source – `frontend/src/`.

### 1.5 Document overview  
Sections 2–10 describe the product perspective, functional and non-functional requirements, interfaces, architecture, data management, constraints, and future considerations.

---

## 2. Overall description

### 2.1 Product perspective  
- Client–server application; the React SPA consumes REST APIs.  
- Backend persists assets on the filesystem and tracks metadata via JSON.  
- External dependency: FFmpeg binaries must be available on the host (configurable paths).  

### 2.2 Product functions (high level)  
1. Import media files.  
2. Display and manage session assets.  
3. Execute editing operations (trim, filters, text, image, audio, speed).  
4. Merge clips and export final outputs.  
5. Provide progress/error feedback.  
6. Allow downloads of generated media.  

### 2.3 User characteristics  
- Targeted at creators comfortable with basic editing terminology.  
- Technical skill: moderate computer literacy (drag/drop, file selection).  
- Users assume FFmpeg is installed on the server (self-hosted scenario).  

### 2.4 Assumptions and dependencies  
- Backend runs on Node.js ≥ 20 with FFmpeg/FFprobe accessible.  
- Frontend served via CRA dev server or static hosting.  
- Storage directory has sufficient disk space and write permissions.  

---

## 3. Specific requirements

### 3.1 Functional requirements

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall allow a user to upload a primary video asset via the Import panel. |
| FR-02 | The system shall disable editing tools until a primary video is uploaded. |
| FR-03 | The system shall list all session assets with metadata (name, type, duration if video) in the Asset Library. |
| FR-04 | The system shall provide trimming functionality with configurable start and end times. |
| FR-05 | The system shall apply colour filters (brightness, contrast, saturation, grayscale, custom) to a video and produce a new asset. |
| FR-06 | The system shall add text overlays with configurable content, colour, font size, background, and position presets or custom expressions. |
| FR-07 | The system shall add image overlays (logo/watermark) with preset or custom positions, size presets, optional pixel dimensions, and opacity control. |
| FR-08 | The system shall mute video audio tracks on demand. |
| FR-09 | The system shall replace a video audio track with a previously uploaded audio asset. |
| FR-10 | The system shall generate fast or slow motion variants using predefined speed multipliers (0.5× to 2×). |
| FR-11 | The system shall merge at least two video clips in order, producing a combined output in the requested format (MP4/WebM/MOV). |
| FR-12 | The system shall export a final clip supporting optional chained operations (trim, filter, text, image, mute/replace audio, format, resolution). |
| FR-13 | The system shall expose download and inline streaming endpoints for each asset. |
| FR-14 | The system shall provide an undo mechanism that restores the previous active asset when supported by the panel. |
| FR-15 | The system shall display success/error notifications and block UI during long-running operations. |
| FR-16 | The system shall maintain asset metadata in a persistent catalogue (`library.json`) across server restarts. |
| FR-17 | The system shall reject unsupported media uploads with a descriptive error. |

### 3.2 Non-functional requirements

**Performance**  
- NFR-01: Upload and transformation endpoints should respond with 201 and metadata within 2s for small clips (<50 MB) on reference hardware; longer durations are acceptable but progress indication must remain visible.  
- NFR-02: Asset library listing should complete within 500 ms for ≤100 session assets.  

**Reliability & availability**  
- NFR-03: Failures during FFmpeg execution must be logged and surfaced to the client with actionable messages.  
- NFR-04: Library index must remain consistent even after unexpected shutdowns (atomic write).  

**Usability**  
- NFR-05: UI must operate on modern desktop browsers (latest Chrome, Edge, Firefox, Safari).  
- NFR-06: All controls should be keyboard navigable and accessible labels provided via MUI defaults.  

**Security**  
- NFR-07: File uploads restricted by MIME/extension whitelist.  
- NFR-08: CORS only permits configured origins (default `http://localhost:3000`).  
- NFR-09: Helmet middleware hardens headers (CSP, HSTS, etc.).  

**Maintainability**  
- NFR-10: Backend logic must remain modular (controllers → services → ffmpeg utils).  
- NFR-11: Frontend panels should be isolated per feature for easier iteration.  

**Scalability**  
- NFR-12: Design should allow swapping file storage for a cloud bucket or database in future without major refactor.  

---

## 4. External interface requirements

- **REST API** – Documented in `docs/api-specs.md`. JSON bodies, standard HTTP status codes.  
- **Static file access** – `/media/files/:filename` served by Express for preview/download.  
- **Environment configuration** – `.env` files at project root, `backend/.env`, and `frontend/.env`.  
- **CLI dependencies** – FFmpeg/FFprobe accessible via PATH or configured absolute paths.  

---

## 5. System architecture summary

1. **Frontend**
   - React + Material UI single-page application.
   - State managed via `EditorContext` and action hooks.
   - Sidebar-based workflow with feature-specific panels.
2. **Backend**
   - Express app with modular routes and services.
   - Multer handles uploads; Zod validates payloads.
   - FFmpeg operations encapsulated in `ffmpeg.service.js`.
3. **Persistence**
   - Assets stored in `backend/storage/uploads` (session + generated outputs).
   - Metadata persisted to `backend/storage/library.json`.  

---

## 6. Data requirements

- Asset metadata structure: `{ id, originalName, filename, mimetype, size, kind, createdAt, updatedAt, url }` plus optional `metadata` block (duration, resolution, codec).  
- Library index must remain synchronised with actual files on disk.  
- Asset IDs are UUID v4 strings for uniqueness.  

---

## 7. Constraints

- Dependent on FFmpeg binaries; project cannot operate without them.  
- Server storage space dictates number/size of clips that can be processed.  
- Performance tied to host CPU as FFmpeg operations are CPU-bound.  
- No authentication/authorisation layer implemented; intended for single-tenant/local deployment.  

---

## 8. Future enhancements (out of scope for current release)

- User accounts and persistent projects in a database.  
- Real-time progress streaming (WebSockets) for long FFmpeg tasks.  
- Timeline UI with true multi-clip track editing.  
- Additional effects: transitions, LUTs, subtitles.  
- Cloud storage integration (S3, GCS) and CDN-backed delivery.  

---

## 9. Acceptance criteria snapshot

- Uploading media updates the asset library and unlocks tools.  
- Each transformation endpoint returns a new asset recorded in the library.  
- Undo button reverts to the previously active clip.  
- Export action produces downloadable media in requested format/resolution.  
- API returns proper status codes and meaningful error messages.  

---

## 10. Appendix – Environment configuration

### Backend `.env`
```
PORT=5500
FFMPEG_PATH=/usr/bin/ffmpeg        # optional
FFPROBE_PATH=/usr/bin/ffprobe      # optional
STORAGE_ROOT=./storage
CORS_ORIGIN=http://localhost:3000
MAX_UPLOAD_SIZE_BYTES=1073741824   # 1 GiB default
```

### Frontend `.env`
```
REACT_APP_API_URL=http://127.0.0.1:5500/api/v1
REACT_APP_MEDIA_URL=http://127.0.0.1:5500
```

Keep this SRS updated as the product evolves. Document new features and constraints so onboarding remains frictionless. 
