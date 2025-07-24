import React, { useState } from 'react';
import { Modal, Box, Typography, Button, Grid, Card, CardActionArea, CardContent, Slider } from '@mui/material';

const filters = [
  { name: 'Grayscale', filterType: 'grayscale', params: { brightness: 0, contrast: 1, saturation: 1 } },
  { name: 'Bright+', filterType: 'brightness', params: { brightness: 0.3, contrast: 1, saturation: 1 } },
  { name: 'Contrast+', filterType: 'contrast', params: { brightness: 0, contrast: 1.5, saturation: 1 } },
  { name: 'Saturation+', filterType: 'saturation', params: { brightness: 0, contrast: 1, saturation: 2 } },
  { name: 'Sepia', filterType: 'custom', params: { brightness: 0.1, contrast: 1.1, saturation: 0.5 } },
];

export default function EffectsModal({ open, onClose, effectParams, onApplyEffect }) {
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState(effectParams || { filterType: '', brightness: 0, contrast: 1, saturation: 1 });

  const handleSelect = (filter) => {
    setSelected(filter);
    setCustom({ ...filter.params, filterType: filter.filterType });
  };

  const handleCustomChange = (field, value) => {
    setSelected(null);
    setCustom((prev) => ({ ...prev, [field]: value, filterType: 'custom' }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, minWidth: 400, boxShadow: 24 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Choose a Filter or Adjust Manually</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {filters.map((filter, idx) => (
            <Grid item xs={6} key={filter.name}>
              <Card variant={selected && selected.name === filter.name ? 'outlined' : 'elevation'} sx={{ borderColor: selected && selected.name === filter.name ? 'primary.main' : undefined }}>
                <CardActionArea onClick={() => handleSelect(filter)}>
                  <CardContent>
                    <Typography variant="subtitle1">{filter.name}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Custom Adjustments</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <span>Brightness</span>
            <Slider min={-1} max={1} step={0.01} value={custom.brightness} onChange={(_, v) => handleCustomChange('brightness', v)} sx={{ width: 100 }} />
            <span>Contrast</span>
            <Slider min={0} max={2} step={0.01} value={custom.contrast} onChange={(_, v) => handleCustomChange('contrast', v)} sx={{ width: 100 }} />
            <span>Saturation</span>
            <Slider min={0} max={3} step={0.01} value={custom.saturation} onChange={(_, v) => handleCustomChange('saturation', v)} sx={{ width: 100 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={() => onApplyEffect(selected ? { ...selected.params, filterType: selected.filterType } : custom)}>Apply</Button>
        </Box>
      </Box>
    </Modal>
  );
} 