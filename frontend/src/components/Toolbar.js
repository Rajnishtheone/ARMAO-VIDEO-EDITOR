import React, { useState } from 'react';
import { Box, IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import EffectsModal from './EffectsModal';

const tools = [
  { label: 'Trim', icon: <ContentCutIcon />, action: 'trim', disabled: false },
  { label: 'Effects', icon: <AutoAwesomeIcon />, action: 'effects', disabled: false },
  { label: 'Text Overlay', icon: <TextFieldsIcon />, action: 'textOverlay', disabled: false },
  { label: 'Image Overlay', icon: <ImageIcon />, action: 'imageOverlay', disabled: false },
  { label: 'Mute', icon: <VolumeOffIcon />, action: 'mute', disabled: false },
  { label: 'Replace Audio', icon: <AudiotrackIcon />, action: 'replaceAudio', disabled: false },
];

export default function Toolbar({ videoFile, trimRange, effectParams, overlayText, overlayImage, audioFile, onVideoUpdate, onFeedback }) {
  const [loading, setLoading] = useState(null); // 'trim' | 'effects' | null
  const [error, setError] = useState('');
  const [effectsOpen, setEffectsOpen] = useState(false);

  // Backend: Trim
  const handleTrim = async () => {
    if (!videoFile || !trimRange) return;
    setLoading('trim');
    setError('');
    const formData = new FormData();
    formData.append('videos', videoFile);
    formData.append('start_0', trimRange[0]);
    formData.append('end_0', trimRange[1]);
    formData.append('order', JSON.stringify([0]));
    formData.append('exportFormat', 'mp4');
    formData.append('exportResolution', 'original');
    try {
      const res = await fetch('http://localhost:5000/api/merge', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Trim failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      onVideoUpdate(url);
      onFeedback && onFeedback('Trim successful!', 'success');
    } catch (err) {
      setError(err.message || 'Trim failed');
      onFeedback && onFeedback(err.message || 'Trim failed', 'error');
    }
    setLoading(null);
  };

  // Backend: Effects
  const handleEffects = async () => {
    if (!videoFile || !effectParams) return;
    setLoading('effects');
    setError('');
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('filterType', effectParams.filterType);
    formData.append('brightness', effectParams.brightness);
    formData.append('contrast', effectParams.contrast);
    formData.append('saturation', effectParams.saturation);
    try {
      const res = await fetch('http://localhost:5000/api/filter', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Effect failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      onVideoUpdate(url);
      onFeedback && onFeedback('Effect applied!', 'success');
    } catch (err) {
      setError(err.message || 'Effect failed');
      onFeedback && onFeedback(err.message || 'Effect failed', 'error');
    }
    setLoading(null);
  };

  // Backend: Text Overlay
  const handleTextOverlay = async () => {
    if (!videoFile || !overlayText) return;
    setLoading('textOverlay');
    setError('');
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('text', overlayText);
    formData.append('fontSize', 36);
    formData.append('fontColor', '#ffffff');
    try {
      const res = await fetch('http://localhost:5000/api/overlay/text', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Text overlay failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      onVideoUpdate(url);
      onFeedback && onFeedback('Text overlay applied!', 'success');
    } catch (err) {
      setError(err.message || 'Text overlay failed');
      onFeedback && onFeedback(err.message || 'Text overlay failed', 'error');
    }
    setLoading(null);
  };
  // Backend: Image Overlay
  const handleImageOverlay = async () => {
    if (!videoFile || !overlayImage) return;
    setLoading('imageOverlay');
    setError('');
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('image', overlayImage);
    try {
      const res = await fetch('http://localhost:5000/api/overlay/image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Image overlay failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      onVideoUpdate(url);
      onFeedback && onFeedback('Image overlay applied!', 'success');
    } catch (err) {
      setError(err.message || 'Image overlay failed');
      onFeedback && onFeedback(err.message || 'Image overlay failed', 'error');
    }
    setLoading(null);
  };
  // Backend: Mute
  const handleMute = async () => {
    if (!videoFile) return;
    setLoading('mute');
    setError('');
    const formData = new FormData();
    formData.append('video', videoFile);
    try {
      const res = await fetch('http://localhost:5000/api/audio/mute', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Mute failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      onVideoUpdate(url);
      onFeedback && onFeedback('Mute applied!', 'success');
    } catch (err) {
      setError(err.message || 'Mute failed');
      onFeedback && onFeedback(err.message || 'Mute failed', 'error');
    }
    setLoading(null);
  };
  // Backend: Replace Audio
  const handleReplaceAudio = async () => {
    if (!videoFile || !audioFile) return;
    setLoading('replaceAudio');
    setError('');
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('audio', audioFile);
    try {
      const res = await fetch('http://localhost:5000/api/audio/replace', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Replace audio failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      onVideoUpdate(url);
      onFeedback && onFeedback('Audio replaced!', 'success');
    } catch (err) {
      setError(err.message || 'Replace audio failed');
      onFeedback && onFeedback(err.message || 'Replace audio failed', 'error');
    }
    setLoading(null);
  };

  const handleClick = (action) => {
    if (action === 'trim') handleTrim();
    if (action === 'effects') setEffectsOpen(true);
    if (action === 'textOverlay') handleTextOverlay();
    if (action === 'imageOverlay') handleImageOverlay();
    if (action === 'mute') handleMute();
    if (action === 'replaceAudio') handleReplaceAudio();
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, my: 2 }}>
        {tools.map((tool) => (
          <Tooltip title={tool.label} key={tool.label} arrow>
            <span>
              <IconButton color="primary" disabled={tool.disabled || loading} onClick={() => handleClick(tool.action)}>
                {loading === tool.action ? <CircularProgress size={24} /> : tool.icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
      </Box>
      <EffectsModal
        open={effectsOpen}
        onClose={() => setEffectsOpen(false)}
        effectParams={effectParams}
        onApplyEffect={async (params) => {
          setEffectsOpen(false);
          setLoading('effects');
          setError('');
          const formData = new FormData();
          formData.append('video', videoFile);
          formData.append('filterType', params.filterType);
          formData.append('brightness', params.brightness);
          formData.append('contrast', params.contrast);
          formData.append('saturation', params.saturation);
          try {
            const res = await fetch('http://localhost:5000/api/filter', {
              method: 'POST',
              body: formData,
            });
            if (!res.ok) throw new Error('Effect failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            onVideoUpdate(url);
            onFeedback && onFeedback('Effect applied!', 'success');
          } catch (err) {
            setError(err.message || 'Effect failed');
            onFeedback && onFeedback(err.message || 'Effect failed', 'error');
          }
          setLoading(null);
        }}
      />
    </>
  );
} 