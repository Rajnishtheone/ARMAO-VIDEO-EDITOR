# API Specification – Video DirectX

Base URL defaults to `http://localhost:5500/api/v1`. All responses are JSON unless stated otherwise. Errors return:
```json
{
  "error": {
    "message": "Human readable explanation",
    "details": { /* optional */ }
  }
}
```

## 1. Health
| Method | Path            | Description                       |
| ------ | --------------- | --------------------------------- |
| GET    | `/api/health`   | Basic readiness probe (status ok) |

## 2. Asset ingestion
| Method | Path                         | Body                               | Notes |
| ------ | ---------------------------- | ---------------------------------- | ----- |
| POST   | `/media/assets`              | `multipart/form-data` (`file`)     | Upload a single media file (video/audio/image). Returns `{ asset }`. |
| POST   | `/media/assets/batch`        | `multipart/form-data` (`files[]`)  | Upload up to 10 files at once. Returns `{ assets }`. |
| GET    | `/media/assets`              | –                                  | List assets created in current session (with metadata, sorted by `updatedAt`). |
| GET    | `/media/assets/:assetId`     | –                                  | Fetch metadata for an asset. |
| GET    | `/media/assets/:assetId/download` | –                               | Download binary (attachment). |
| GET    | `/media/assets/:assetId/stream`   | –                               | Stream file inline. |

## 3. Transformations (per asset)
All transformation endpoints return `{ asset }` representing the newly generated clip. Each operation registers a new asset ID while preserving the original.

| Method | Path | Payload | Description |
| ------ | ---- | ------- | ----------- |
| POST | `/media/assets/:assetId/trim` | `{ "start": number, "end": number|null }` | Extract segment between `start` and `end` seconds (end optional). |
| POST | `/media/assets/:assetId/filter` | `{ "filterType": string, "brightness"?: number, "contrast"?: number, "saturation"?: number }` | Apply colour filter. `filterType` supports `brightness`, `contrast`, `saturation`, `grayscale`, `custom`. |
| POST | `/media/assets/:assetId/text-overlays` | `{ "text": string, "fontColor"?: string, "fontSize"?: number, "box"?: boolean, "boxColor"?: string, "x"?: string, "y"?: string }` | Render text overlay using FFmpeg `drawtext`. |
| POST | `/media/assets/:assetId/image-overlays` | `{ "imageAssetId": string, "options"?: { "x"?: string, "y"?: string, "width"?: string, "height"?: string, "opacity"?: string } }` | Composite an uploaded image onto the video. |
| POST | `/media/assets/:assetId/audio/mute` | – | Strip audio track. |
| POST | `/media/assets/:assetId/audio/replace` | `{ "audioAssetId": string }` | Replace audio using another uploaded asset. |
| POST | `/media/assets/:assetId/speed` | `{ "speed": number }` | Create fast/slow motion variant. Speed allowed range: 0.5× to 2×. |

## 4. Actions (multi-asset or pipeline)
| Method | Path | Payload | Description |
| ------ | ---- | ------- | ----------- |
| POST | `/media/actions/merge` | `{ "clipIds": [string, ...], "format"?: "mp4"|"webm"|"mov" }` | Concatenate clips (order respected). Requires at least two video IDs. |
| POST | `/media/actions/export` | ```json { "assetId": "string", "format"?: "mp4"|"webm"|"mov", "resolution"?: "original"|"480p"|"720p"|"1080p", "operations"?: { "trim"?: { "start"?: number, "end"?: number }, "filter"?: { ... }, "textOverlays"?: [...], "imageOverlay"?: { "imageAssetId": string, "options"?: { ... } }, "mute"?: boolean, "replaceAudio"?: { "audioAssetId": string } } } ``` | Run a sequential pipeline and output a final clip. Operations are applied in order; omitted blocks are skipped. |

## 5. Response shape
- Upload / transform endpoints return `{ "asset": { ... } }` with fields: `id`, `originalName`, `filename`, `mimetype`, `size`, `kind`, timestamps, and `url` (relative path for streaming/downloading).
- List endpoint returns `{ "assets": [ ... ] }` using the same shape.

## 6. Errors
Common error scenarios:
- `400 Unsupported file type` – upload blocked by Multer filter.
- `400 Asset X is not a video` – transformation attempted on wrong media type.
- `404 Asset X not found` – invalid ID or asset cleared from library.
- `500` – unexpected FFmpeg or filesystem failure (see backend logs).

Refer to `backend/src/middleware/errorHandler.js` for exact JSON format. Update this document whenever new endpoints or payload fields are introduced.
