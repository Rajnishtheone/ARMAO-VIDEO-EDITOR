import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function MergePanel({ timelineClips, exportFormat, setExportFormat, exportResolution, setExportResolution, handleExport, exportStatus, exportURL }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 900, mb: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Merge Videos</Typography>
      {/* Show timeline clips, allow trim/split/rearrange here (UI can be expanded) */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {timelineClips.map((clip, idx) => (
          <Box key={idx} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 1, minWidth: 120, textAlign: 'center', bgcolor: 'grey.100' }}>
            <Typography variant="body2">{clip.name}</Typography>
            {/* Add trim/split/rearrange controls here */}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', mt: 2 }}>
        <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ height: 36, borderRadius: 6, padding: '0 8px' }}>
          <option value="mp4">MP4</option>
          <option value="webm">WebM</option>
          <option value="mov">MOV</option>
        </select>
        <select value={exportResolution} onChange={e => setExportResolution(e.target.value)} style={{ height: 36, borderRadius: 6, padding: '0 8px' }}>
          <option value="original">Original</option>
          <option value="480p">480p</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </select>
        <Button variant="contained" color="primary" onClick={handleExport}>Export & Download</Button>
      </Box>
      {exportStatus && <Typography variant="body2" color={exportStatus.includes('successful') ? 'success.main' : 'info.main'} sx={{ mb: 2 }}>{exportStatus}</Typography>}
      {exportURL && (
        <a href={exportURL} download={`exported-video.${exportFormat}`} style={{ display: 'inline-block', marginTop: 16 }}>
          <Button variant="contained" color="success">Download Video</Button>
        </a>
      )}
    </Box>
  );
} 