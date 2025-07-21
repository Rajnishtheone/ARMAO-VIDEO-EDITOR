# Video-DirectX

A full-stack, browser-based video editor built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- Upload and preview videos
- Trim or cut specific segments
- Merge multiple videos
- Add text or image overlays
- Apply video filters (grayscale, brightness, contrast, etc.)
- Add or remove background music/audio
- Upload external audio files and synchronize with video
- Mute or replace original video audio
- Export the final edited video for download

## Tech Stack
- **Frontend:** React, Material-UI, HTML5 Video API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (optional, for saving user sessions/projects)
- **Video Processing:** ffmpeg.wasm (client-side), ffmpeg (server-side, future)

## Project Structure
```
video-editor/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── utils/
│   │   ├── middleware/
│   │   ├── features/
│   │   │   ├── trim/
│   │   │   ├── effects/
│   │   └── app.js
│   ├── tests/
│   ├── config/
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── features/
│   │   │   ├── trim/
│   │   │   ├── effects/
│   │   ├── App.js
│   │   └── index.js
│   ├── tests/
│   └── package.json
│
├── docs/
│   ├── SRS.md
│   ├── README.md
│   ├── architecture-diagram.png
│   ├── user-flow.md
│   └── api-specs.md
│
└── .gitignore
```

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Documentation
See the `docs/` folder for SRS, API specs, user flows, and architecture diagrams.

---

**Author:** [Rajnishtheone](https://github.com/Rajnishtheone)
