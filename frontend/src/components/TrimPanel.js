import React from 'react';
import { Box, Typography } from '@mui/material';

export default function TrimPanel({ videoFile, videoURL, trimStart, setTrimStart, trimEnd, setTrimEnd, trimApplying, trimPreviewURL, handleTrimPreview, handleTrimApply, trimStatus }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 900, mb: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Trim Video</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
        <span>Start</span>
        <input type="number" min={0} max={trimEnd} value={trimStart} onChange={e => setTrimStart(Number(e.target.value))} style={{ width: 60 }} />
        <span>End</span>
        <input type="number" min={trimStart} value={trimEnd} onChange={e => setTrimEnd(Number(e.target.value))} style={{ width: 60 }} />
        <button onClick={handleTrimPreview} disabled={trimApplying} style={{ padding: '8px 16px', borderRadius: 6, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Preview</button>
        <button onClick={handleTrimApply} disabled={!trimPreviewURL} style={{ padding: '8px 16px', borderRadius: 6, background: '#4caf50', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Apply</button>
      </Box>
      {trimStatus && <Typography variant="body2" color="info.main">{trimStatus}</Typography>}
    </Box>
  );
} 