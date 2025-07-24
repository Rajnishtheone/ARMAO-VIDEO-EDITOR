# VideoDirectX

A modern, professional video editor web app.

## Features
- Import videos (drag-and-drop)
- Timeline editing (trim, split, reorder, multi-clip)
- Effects & filters (modal with pre-defined and custom controls)
- Text/image overlays
- Music/audio replace
- Export in multiple formats/resolutions
- Responsive, clean UI
- Onboarding intro for new users

## Onboarding & First-Time User Experience

- When you first visit VideoDirectX, you'll see a welcome modal introducing the main features and workflow.
- The modal can be dismissed and will not show again unless local storage is cleared.
- This helps new users get started quickly and understand the editing flow.

## How to Use
1. **Import**: Upload your video to start editing.
2. **Tools**: Trim, add effects, overlays, and music.
3. **Export**: Download your final video.

## Onboarding
- First-time users see a welcome modal with feature overview.

## Tech Stack
- React, MUI, Node.js/Express, FFmpeg

## Backend API
- See `/backend/src/routes/filters.js` for all endpoints.

## Development
- Run backend and frontend separately.
- See `/docs/api-specs.md` for API details.

--- 