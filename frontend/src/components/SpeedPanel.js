import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

export default function SpeedPanel({
  videoRef,
  isMuted,
  setIsMuted,
  muteApplying,
  muteStatus,
  handleMuteApply,
}) {
  const [speed, setSpeed] = useState(1);

  // Update playback speed in real-time if videoRef is provided
  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, videoRef]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 900,
        mb: 2,
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Speed Control
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <span>Speed</span>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x (Normal)</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>

        {/* Mute toggle */}
        <button
          onClick={() => setIsMuted(m => !m)} // ✅ toggle mute, not speed
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: isMuted ? '#f44336' : '#2196f3',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </Box>

      {muteStatus && (
        <Typography variant="body2" color="info.main">
          {muteStatus}
        </Typography>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Playback speed is {speed}x
      </Typography>
    </Box>
  );
}
