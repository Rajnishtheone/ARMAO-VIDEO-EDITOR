import React from 'react';
import { Box, Typography } from '@mui/material';
import { Rnd } from 'react-rnd';

 const positionPresets = {
    "top-left": { x: "10", y: "10" },
    "top-right": { x: "main_w-overlay_w-10", y: "10" },
    "bottom-left": { x: "10", y: "main_h-overlay_h-10" },
    "bottom-right": { x: "main_w-overlay_w-10", y: "main_h-overlay_h-10" },
    "center": { x: "(main_w-overlay_w)/2", y: "(main_h-overlay_h)/2"},
  };



export default function ImagePanel({ videoFile, videoURL, photoFile, setPhotoFile, photoPreviewURL, photoOverlay, setPhotoOverlay, photoApplying, photoStatus, handlePhotoApply }) {
  // Default size and position
  const defaultWidth = 120;
  const defaultHeight = 80;
  const defaultX = 200;
  const defaultY = 100;

  const setPresetPosition = (position) => {
    if (positionPresets[position]) {
      setPhotoOverlay({
        ...photoOverlay,
        x: positionPresets[position].x,
        y: positionPresets[position].y,
      });
    }
  };

  // If no overlay position, center it
  const overlay = photoOverlay || { x: defaultX, y: defaultY, width: defaultWidth, height: defaultHeight, start: 0, end: 10 };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mb: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Add Photo Overlay</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
        <input type="file" accept="image/*" onChange={e => { const file = e.target.files[0]; setPhotoFile(file); }} />
        <Box sx={{ position: 'relative', width: 480, height: 270, border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden', background: '#eee' }}>
          {/* Video preview background (static image or video frame could be used) */}
          {photoPreviewURL && (
            <Rnd
              size={{ width: overlay.width, height: overlay.height }}
              position={{ x: overlay.x, y: overlay.y }}
              bounds="parent"
              onDragStop={(e, d) => setPhotoOverlay({ ...overlay, x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => setPhotoOverlay({ ...overlay, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10), x: position.x, y: position.y })}
              style={{ zIndex: 2 }}
            >
              <img src={photoPreviewURL} alt="overlay" style={{ width: '100%', height: '100%', objectFit: 'contain', border: '2px solid #2196f3', borderRadius: 4, background: '#fff' }} />
            </Rnd>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span>Start (s)</span>
          <input type="number" min={0} value={overlay.start} onChange={e => setPhotoOverlay({ ...overlay, start: Number(e.target.value) })} style={{ width: 60 }} />
          <span>End (s)</span>
          <input type="number" min={overlay.start} value={overlay.end} onChange={e => setPhotoOverlay({ ...overlay, end: Number(e.target.value) })} style={{ width: 60 }} />
          
          <span>Position</span>
          <select value={positionPresets.position} onChange={e => setPresetPosition(e.target.value)}>
          {Object.keys(positionPresets).map(position => ( 
            <option key={position} value={position}>{position.replace('-', ' ')}</option>
          ))}
          </select>

          <span>Opacity</span>
          <input type="number" min={0} max={1} step={0.1} value={photoOverlay.opacity} onChange={e => setPhotoOverlay({ ...overlay, opacity: parseFloat(e.target.value) })} style={{ width: 60 }} />
          
          <button onClick={handlePhotoApply} disabled={!photoFile || photoApplying} style={{ padding: '8px 16px', borderRadius: 6, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Apply</button>
        </Box>
      </Box>
      {photoStatus && <Typography variant="body2" color="info.main">{photoStatus}</Typography>}
    </Box>
  );
} 