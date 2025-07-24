import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

export default function VideoPreview({ videoURL, currentTime, videoRef, isMuted }) {
  const localRef = useRef();

  useEffect(() => {
    if (videoRef) {
      videoRef.current = localRef.current;
    }
  }, [videoRef]);

  useEffect(() => {
    if (localRef.current && typeof currentTime === 'number') {
      localRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (localRef.current) {
      localRef.current.muted = !!isMuted;
    }
  }, [isMuted]);

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {videoURL ? (
        <>
          <video
            ref={localRef}
            src={videoURL}
            controls
            style={{ width: '100%', maxHeight: 480, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          />
          {isMuted && (
            <Box sx={{ position: 'absolute', top: 24, right: 24, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%', p: 1 }}>
              <VolumeOffIcon color="error" sx={{ fontSize: 40 }} />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ width: '100%', height: 320, background: 'rgba(0,0,0,0.08)', borderRadius: 12 }} />
      )}
    </Box>
  );
} 