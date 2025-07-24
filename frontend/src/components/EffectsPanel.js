import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EffectsPanel({ videoFile, videoURL, effectParams, setEffectParams, filterPreviewParams, setFilterPreviewParams, filterApplying, filterPreviewURL, handleFilterPreview }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 900, mb: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Filters & Effects</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
        <select value={effectParams.filterType} onChange={e => { const params = { ...effectParams, filterType: e.target.value }; setEffectParams(params); handleFilterPreview(params); }} style={{ height: 36, borderRadius: 6, padding: '0 8px' }}>
          <option value="">Effect</option>
          <option value="grayscale">Grayscale</option>
          <option value="brightness">Brightness</option>
          <option value="contrast">Contrast</option>
          <option value="saturation">Saturation</option>
          <option value="custom">Custom (B+C+S)</option>
        </select>
        {(effectParams.filterType === 'brightness' || effectParams.filterType === 'custom') && (
          <>
            <span>Brightness</span>
            <input type="range" min={-1} max={1} step={0.01} value={effectParams.brightness} onChange={e => { const params = { ...effectParams, brightness: Number(e.target.value) }; setEffectParams(params); handleFilterPreview(params); }} style={{ width: 100 }} />
          </>
        )}
        {(effectParams.filterType === 'contrast' || effectParams.filterType === 'custom') && (
          <>
            <span>Contrast</span>
            <input type="range" min={0} max={2} step={0.01} value={effectParams.contrast} onChange={e => { const params = { ...effectParams, contrast: Number(e.target.value) }; setEffectParams(params); handleFilterPreview(params); }} style={{ width: 100 }} />
          </>
        )}
        {(effectParams.filterType === 'saturation' || effectParams.filterType === 'custom') && (
          <>
            <span>Saturation</span>
            <input type="range" min={0} max={3} step={0.01} value={effectParams.saturation} onChange={e => { const params = { ...effectParams, saturation: Number(e.target.value) }; setEffectParams(params); handleFilterPreview(params); }} style={{ width: 100 }} />
          </>
        )}
      </Box>
      {filterApplying && <Typography variant="body2" color="info.main">Previewing...</Typography>}
    </Box>
  );
} 