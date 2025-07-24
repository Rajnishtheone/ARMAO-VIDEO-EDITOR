import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, Slider } from '@mui/material';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

// Extract frames from video for thumbnails
const extractThumbnails = async (videoURL, count = 6) => {
  if (!videoURL) return [];
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoURL;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.currentTime = 0;
    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const thumbnails = [];
      let captures = 0;
      const captureFrame = (time) => {
        video.currentTime = time;
      };
      video.addEventListener('seeked', function handler() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnails.push(canvas.toDataURL('image/jpeg'));
        captures++;
        if (captures < count) {
          captureFrame((captures / count) * duration);
        } else {
          video.removeEventListener('seeked', handler);
          resolve(thumbnails);
        }
      });
      captureFrame(0);
    });
  });
};

export default function TimelineBar({ clips = [], onAction, onSeek, videoURL, onTrimRangeChange }) {
  const [playhead, setPlayhead] = useState(0); // seconds
  const [thumbnails, setThumbnails] = useState([]);
  const [trimRange, setTrimRange] = useState([0, 10]); // [start, end]
  const timelineRef = useRef();
  const totalDuration = clips.reduce((sum, c) => sum + ((c.end || 10) - (c.start || 0)), 0) || 60;

  // Extract thumbnails when videoURL changes
  useEffect(() => {
    if (videoURL) {
      extractThumbnails(videoURL, 6).then(setThumbnails);
    } else {
      setThumbnails([]);
    }
  }, [videoURL]);

  // Snap playhead to nearest second for now
  const handlePlayheadChange = (e, value) => {
    setPlayhead(Math.round(value));
    if (onSeek) onSeek(Math.round(value));
  };

  // Frame-accurate trimming
  const handleTrimChange = (e, newValue) => {
    setTrimRange(newValue);
    if (onTrimRangeChange) onTrimRangeChange(newValue);
  };

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 900,
      mx: 'auto',
      mt: 2,
      mb: 2,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 2,
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      minHeight: 90,
    }}>
      {/* Time markers */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>Timeline</Typography>
        {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => (
          <Typography key={i} variant="caption" color="grey.500" sx={{ mx: 1 }}>{(i * 5).toString().padStart(2, '0')}:00</Typography>
        ))}
      </Box>
      {/* Timeline with thumbnails and clips */}
      <Box ref={timelineRef} sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', height: 56, position: 'relative', gap: 1 }}>
        {/* Playhead (scrubber) */}
        <Box sx={{ position: 'absolute', left: `${(playhead / totalDuration) * 100}%`, top: 0, bottom: 0, width: 2, bgcolor: 'primary.main', zIndex: 2, transition: 'left 0.1s' }} />
        {clips.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.5, ml: 2 }}>
            No clips in timeline
          </Typography>
        )}
        {clips.map((clip, idx) => (
          <Box key={idx} sx={{
            minWidth: 120,
            height: 48,
            bgcolor: 'grey.900',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
            mx: 1,
            display: 'flex',
            alignItems: 'center',
            px: 1,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Thumbnails */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
              {thumbnails.length > 0
                ? thumbnails.map((thumb, tIdx) => (
                    <img key={tIdx} src={thumb} alt="frame" style={{ width: 24, height: 32, borderRadius: 2, objectFit: 'cover', opacity: 0.85 }} />
                  ))
                : Array(6).fill('').map((_, tIdx) => (
                    <Box key={tIdx} sx={{ width: 24, height: 32, borderRadius: 2, bgcolor: 'grey.800', opacity: 0.3, mr: 0.5 }} />
                  ))}
            </Box>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, mr: 1 }}>{clip.name}</Typography>
            <Tooltip title="Cut">
              <IconButton size="small" onClick={() => onAction && onAction('cut', idx)}><ContentCutIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onAction && onAction('delete', idx)}><DeleteIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Mute">
              <IconButton size="small" onClick={() => onAction && onAction('mute', idx)}><VolumeOffIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>
      {/* Playhead slider for seeking and snap-to-time */}
      <Box sx={{ mt: 1, px: 2 }}>
        <Slider
          value={playhead}
          min={0}
          max={totalDuration}
          step={1}
          onChange={handlePlayheadChange}
          marks
          valueLabelDisplay="auto"
          sx={{ color: 'primary.main' }}
        />
      </Box>
      {/* Frame-accurate trimming slider */}
      <Box sx={{ mt: 1, px: 2 }}>
        <Typography variant="caption" color="text.secondary">Trim Range</Typography>
        <Slider
          value={trimRange}
          min={0}
          max={totalDuration}
          step={1}
          onChange={handleTrimChange}
          valueLabelDisplay="auto"
          sx={{ color: 'secondary.main' }}
        />
      </Box>
    </Box>
  );
} 