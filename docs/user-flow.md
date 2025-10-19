# User Flow – Video DirectX

This flow describes the current behaviour of the React client after the October 2025 refactor.

## 1. Session start
1. User lands on the dashboard (dark or light theme depending on toggle).
2. The tools sidebar is visible but everything except **Import** is disabled until a clip is uploaded.
3. The “Asset Library” panel is empty and labelled “Session scoped” to indicate the list resets once a new primary clip is imported.

## 2. Import primary footage
1. The user selects **Import** and uploads a video via file picker.
2. Upload progress is shown through a blocking status overlay (“Uploading video…”).
3. Once complete, the new asset becomes the active clip in the preview player, the session list now contains one item, and all other tools unlock.

## 3. Working with tools
The user moves through tools from the sidebar. Each panel calls into `useEditorActions` and writes the resulting asset back into the session list.

| Tool            | Interaction flow |
| --------------- | ---------------- |
| **Trim**        | Set start/end seconds → “Render trim” → new clipped asset appears, replaces active clip. |
| **Filters**     | Choose effect (brightness/contrast/saturation/greyscale/custom) → Apply → new filtered clip. |
| **Text**        | Type overlay text, tweak colours/font, choose location from dropdown (or custom FFmpeg expressions) → “Render text overlay”. |
| **Image**       | Upload watermark/logo asset, pick preset location and size (small/medium/large/custom px), adjust opacity → “Render image overlay”. |
| **Audio**       | Either mute active clip or replace audio with another uploaded asset. |
| **Speed**       | Pick one of six presets (0.5× … 2×) → render a slow-motion or fast-motion copy. |
| **Merge**       | Select a primary and secondary clip (or upload a second clip directly), preview both players, choose export format, then merge to obtain a stitched clip. |
| **Export**      | Combine optional operations (trim/filter/overlay/audio/format/resolution) and generate the final video ready for download. |

Every action uses the status overlay to indicate background work and on success displays a snackbar (“Filter applied”, “Fast clip ready”, etc.). Undo is available on most panels; it reverts to the previously active asset tracked in context.

## 4. Asset library & active clip
- The asset list below the main stage only shows items created in the current session (import + transformations).
- Clicking a row activates that clip in the player (useful for comparing variants).
- Each entry carries a chip for media kind (VIDEO/AUDIO/IMAGE) and whether it is the current “Active” clip.

## 5. Export and download
1. When satisfied, the user opens the **Export** panel.
2. They choose the operations to run (trim, filter, overlays, mute/replace audio, format/resolution).
3. The backend executes the pipeline and returns a final asset.
4. The frontend can download the file immediately or it can be retrieved later from the asset list.

## 6. End of session
- Importing another primary video resets the context (clears session IDs and undo stack) and the entire workflow starts again.
- Generated files remain on disk (`backend/storage/uploads`) until manually removed; they simply disappear from the UI library when the session resets.

### Additional notes
- All heavy FFmpeg actions run server-side; the UI remains responsive thanks to the status overlay and snackbars.
- Any network/connectivity issue surfaces in-panel (e.g. “Unable to reach the media API…”).
- The theme toggle and library refresh live in the header for quick access.
