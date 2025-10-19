import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';

const POSITION_OPTIONS = [
  { value: 'top-left', label: 'Top left', x: '40', y: '40' },
  { value: 'top-center', label: 'Top centre', x: '(main_w-overlay_w)/2', y: '48' },
  { value: 'top-right', label: 'Top right', x: 'main_w-overlay_w-40', y: '48' },
  { value: 'middle-left', label: 'Middle left', x: '40', y: '(main_h-overlay_h)/2' },
  { value: 'center', label: 'Centre', x: '(main_w-overlay_w)/2', y: '(main_h-overlay_h)/2' },
  { value: 'middle-right', label: 'Middle right', x: 'main_w-overlay_w-40', y: '(main_h-overlay_h)/2' },
  { value: 'bottom-left', label: 'Bottom left', x: '40', y: 'main_h-overlay_h-60' },
  { value: 'bottom-center', label: 'Bottom centre', x: '(main_w-overlay_w)/2', y: 'main_h-overlay_h-60' },
  { value: 'bottom-right', label: 'Bottom right', x: 'main_w-overlay_w-40', y: 'main_h-overlay_h-60' },
  { value: 'custom', label: 'Custom (enter expressions)', x: '', y: '' },
];

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small', ratio: 0.18 },
  { value: 'medium', label: 'Medium', ratio: 0.3 },
  { value: 'large', label: 'Large', ratio: 0.42 },
  { value: 'custom', label: 'Custom (pixel values)' },
];

const DEFAULT_STATE = {
  position: 'bottom-right',
  customX: '',
  customY: '',
  size: 'medium',
  customWidth: '',
  customHeight: '',
  opacity: 85,
};

const ImageOverlayPanel = () => {
  const { assets, activeAssetId, lastAssetId } = useEditor();
  const { uploadSupportAsset, addImageOverlay, undoLast } = useEditorActions();
  const activeAsset = assets.find(asset => asset.id === activeAssetId);

  const [imageAsset, setImageAsset] = useState(null);
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    setImageAsset(null);
    setState(DEFAULT_STATE);
  }, [activeAssetId]);

  if (!activeAsset) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a video asset to add an image overlay.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleUpload = async event => {
    const { files } = event.target;
    const file = files && files[0];
    if (!file) return;
    const asset = await uploadSupportAsset(file, 'image');
    if (asset) {
      setImageAsset(asset);
    }
    event.target.value = null;
  };

  const handleStateChange = (key, formatter = value => value) => event => {
    const value = formatter(event.target.value);
    setState(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOpacityChange = (_, value) => {
    setState(prev => ({
      ...prev,
      opacity: Array.isArray(value) ? value[0] : value,
    }));
  };

  const handleUndo = () => {
    undoLast(activeAssetId);
  };

  const handleApply = () => {
    if (!imageAsset) return;

    const videoWidth = activeAsset.metadata?.width || 1920;
    const videoHeight = activeAsset.metadata?.height || 1080;

    const sizePreset = SIZE_OPTIONS.find(option => option.value === state.size);
    let width = state.customWidth;
    let height = state.customHeight;

    if (state.size !== 'custom' && sizePreset?.ratio) {
      const ratio = sizePreset.ratio;
      width = Math.round(videoWidth * ratio);
      height = Math.round(videoHeight * ratio * 0.6);
    }

    const parsedWidth = Number(width);
    const parsedHeight = Number(height);

    const overlayWidth = Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : '';
    const overlayHeight = Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : '';

    const positionPreset = POSITION_OPTIONS.find(option => option.value === state.position);
    const xExpr = state.position === 'custom'
      ? state.customX || '(main_w-overlay_w)/2'
      : positionPreset?.x || '(main_w-overlay_w)/2';
    const yExpr = state.position === 'custom'
      ? state.customY || '(main_h-overlay_h)/2'
      : positionPreset?.y || '(main_h-overlay_h)/2';

    addImageOverlay(activeAsset.id, {
      imageAssetId: imageAsset.id,
      options: {
        x: xExpr,
        y: yExpr,
        width: overlayWidth ? String(overlayWidth) : '',
        height: overlayHeight ? String(overlayHeight) : '',
        opacity: (state.opacity / 100).toFixed(2),
      },
    });
  };

  return (
    <Card
      sx={{
        background: theme => `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.paper}f0)`,
        border: theme => `1px solid ${theme.palette.primary.main}1f`,
        boxShadow: theme => `0 24px 55px -42px ${theme.palette.secondary.main}55`,
      }}
    >
      <CardHeader
        title="Image Overlay"
        subheader="Upload a logo or watermark, choose a position, and render it onto the clip."
      />
      <CardContent>
        <Stack spacing={3}>
          <Button
            variant="outlined"
            component="label"
            sx={{ alignSelf: 'flex-start' }}
          >
            {imageAsset ? 'Replace overlay image' : 'Upload overlay image'}
            <input type="file" hidden accept="image/*" onChange={handleUpload} />
          </Button>

          {!imageAsset ? (
            <Typography variant="body2" color="text.secondary">
              Upload a PNG, JPEG, or WebP file to continue. Transparent PNGs work best for watermarks.
            </Typography>
          ) : null}

          <Divider textAlign="left">Placement</Divider>

          <FormControl fullWidth>
            <InputLabel id="image-position-select">Position</InputLabel>
            <Select
              labelId="image-position-select"
              label="Position"
              value={state.position}
              onChange={handleStateChange('position')}
            >
              {POSITION_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {state.position === 'custom' ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Custom X expression"
                value={state.customX}
                onChange={handleStateChange('customX')}
                placeholder="e.g. (main_w-overlay_w)/2"
                fullWidth
              />
              <TextField
                label="Custom Y expression"
                value={state.customY}
                onChange={handleStateChange('customY')}
                placeholder="e.g. (main_h-overlay_h)/2"
                fullWidth
              />
            </Stack>
          ) : null}

          <Divider textAlign="left">Size</Divider>

          <FormControl fullWidth>
            <InputLabel id="image-size-select">Size</InputLabel>
            <Select
              labelId="image-size-select"
              label="Size"
              value={state.size}
              onChange={handleStateChange('size')}
            >
              {SIZE_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {state.size === 'custom' ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Width (pixels)"
                value={state.customWidth}
                onChange={handleStateChange('customWidth')}
                placeholder="e.g. 320"
                fullWidth
              />
              <TextField
                label="Height (pixels)"
                value={state.customHeight}
                onChange={handleStateChange('customHeight')}
                placeholder="e.g. 180"
                fullWidth
              />
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Chosen size scales relative to the video resolution ({activeAsset.metadata?.width || 1920}px).
            </Typography>
          )}

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Overlay opacity
            </Typography>
            <Slider
              value={state.opacity}
              onChange={handleOpacityChange}
              min={10}
              max={100}
              valueLabelDisplay="auto"
            />
          </Stack>

          <Divider textAlign="left">Actions</Divider>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              disabled={!imageAsset}
              onClick={handleApply}
              sx={{
                flexGrow: 1,
                background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Render image overlay
            </Button>
            <Button variant="text" onClick={handleUndo} disabled={!lastAssetId}>
              Undo last change
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ImageOverlayPanel;
