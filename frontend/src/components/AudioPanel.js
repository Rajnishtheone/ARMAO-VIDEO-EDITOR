import React, { useState } from 'react';
import { Box, Typography, IconButton, Slider } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AudioPanel({ videoFile, videoURL, songFile, setSongFile, songPreviewURL, songStart, setSongStart, songApplying, songStatus, handleSongApply }) {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const handleDelete = () => {
    setSongFile(null);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mb: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Add Song</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
        <input type="file" accept="audio/*" onChange={e => { const file = e.target.files[0]; setSongFile(file); }} />
        {songPreviewURL && (
          <audio src={songPreviewURL} controls style={{ marginLeft: 8, verticalAlign: 'middle' }} volume={volume} muted={isMuted} />
        )}
        <span>Start at (s)</span>
        <input type="number" min={0} value={songStart} onChange={e => setSongStart(Number(e.target.value))} style={{ width: 60 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeUpIcon color={isMuted ? 'disabled' : 'primary'} />
          <Slider min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(_, v) => setVolume(Number(v))} sx={{ width: 80 }} disabled={isMuted} />
          <IconButton onClick={() => setIsMuted(m => !m)}>{isMuted ? <VolumeOffIcon color="error" /> : <VolumeUpIcon color="primary" />}</IconButton>
        </Box>
        {songFile && (
          <IconButton onClick={handleDelete}><DeleteIcon color="error" /></IconButton>
        )}
        <button onClick={handleSongApply} disabled={!songFile || songApplying} style={{ padding: '8px 16px', borderRadius: 6, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Apply</button>
      </Box>
      {/* Simple timeline visualization */}
      {songFile && (
        <Box sx={{ width: 480, height: 24, bgcolor: '#eee', borderRadius: 2, mt: 2, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: `${songStart / 60 * 100}%`, width: '40%', height: '100%', bgcolor: isMuted ? 'grey.400' : 'primary.main', borderRadius: 2, opacity: 0.7 }} />
        </Box>
      )}
      {songStatus && <Typography variant="body2" color="info.main">{songStatus}</Typography>}
    </Box>
  );
} 