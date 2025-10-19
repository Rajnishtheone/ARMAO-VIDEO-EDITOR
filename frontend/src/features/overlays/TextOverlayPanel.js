import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';

const DEFAULT_TEXT_OPTIONS = {
  text: 'ARMAO',
  fontColor: '#ffffff',
  fontSize: 42,
  box: true,
  boxColor: '#101927',
};

const DEFAULT_FRAME = {
  position: 'center',
  customX: '',
  customY: '',
};

const POSITION_OPTIONS = [
  { value: 'top-left', label: 'Top left', x: '40', y: '40' },
  { value: 'top-center', label: 'Top centre', x: '(w-text_w)/2', y: '48' },
  { value: 'top-right', label: 'Top right', x: 'w-text_w-40', y: '48' },
  { value: 'center-left', label: 'Middle left', x: '48', y: '(h-text_h)/2' },
  { value: 'center', label: 'Centre', x: '(w-text_w)/2', y: '(h-text_h)/2' },
  { value: 'center-right', label: 'Middle right', x: 'w-text_w-48', y: '(h-text_h)/2' },
  { value: 'bottom-left', label: 'Bottom left', x: '44', y: 'h-text_h-60' },
  { value: 'bottom-center', label: 'Bottom centre', x: '(w-text_w)/2', y: 'h-text_h-60' },
  { value: 'bottom-right', label: 'Bottom right', x: 'w-text_w-44', y: 'h-text_h-60' },
  { value: 'custom', label: 'Custom (enter expressions)', x: '', y: '' },
];

const TextOverlayPanel = () => {
  const { assets, activeAssetId, lastAssetId } = useEditor();
  const { addTextOverlay, undoLast } = useEditorActions();
  const [textOptions, setTextOptions] = useState(DEFAULT_TEXT_OPTIONS);
  const [positionState, setPositionState] = useState(DEFAULT_FRAME);

  useEffect(() => {
    setTextOptions(DEFAULT_TEXT_OPTIONS);
    setPositionState(DEFAULT_FRAME);
  }, [activeAssetId]);

  const activeAsset = useMemo(
    () => assets.find(asset => asset.id === activeAssetId),
    [assets, activeAssetId],
  );

  if (!activeAsset) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a video asset to add a text overlay.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleTextChange = key => event => {
    setTextOptions(prev => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const handleToggle = key => (_, checked) => {
    setTextOptions(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleFontSizeChange = (_, value) => {
    setTextOptions(prev => ({
      ...prev,
      fontSize: Array.isArray(value) ? value[0] : value,
    }));
  };

  const handlePositionChange = event => {
    const value = event.target.value;
    setPositionState(prev => ({
      ...prev,
      position: value,
    }));
  };

  const handleCustomPositionChange = key => event => {
    const { value } = event.target;
    setPositionState(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUndo = () => {
    undoLast(activeAssetId);
  };

  const handleApply = () => {
    const normalizeColor = value => (typeof value === 'string' && value.startsWith('#')
      ? `0x${value.slice(1)}`
      : value);

    const preset = POSITION_OPTIONS.find(option => option.value === positionState.position);
    const xExpr = positionState.position === 'custom'
      ? positionState.customX || '(w-text_w)/2'
      : preset?.x || '(w-text_w)/2';
    const yExpr = positionState.position === 'custom'
      ? positionState.customY || '(h-text_h)/2'
      : preset?.y || '(h-text_h)/2';

    addTextOverlay(activeAsset.id, {
      text: textOptions.text,
      fontColor: normalizeColor(textOptions.fontColor),
      fontSize: Number(textOptions.fontSize) || 36,
      box: textOptions.box,
      boxColor: normalizeColor(textOptions.boxColor),
      x: xExpr,
      y: yExpr,
    });
  };

  return (
    <Card
      sx={{
        background: theme => `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.paper}f0)`,
        border: theme => `1px solid ${theme.palette.primary.main}1f`,
        boxShadow: theme => `0 24px 55px -42px ${theme.palette.primary.main}55`,
      }}
    >
      <CardHeader
        title="Text Overlay"
        subheader="Pick a preset position or enter custom FFmpeg expressions, then render your caption."
      />
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <TextField
              label="Overlay Text"
              value={textOptions.text}
              onChange={handleTextChange('text')}
              multiline
              minRows={2}
            />
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Font Size
              </Typography>
              <Slider
                value={textOptions.fontSize}
                onChange={handleFontSizeChange}
                min={18}
                max={110}
                valueLabelDisplay="auto"
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <TextField
                label="Text Colour"
                type="color"
                value={textOptions.fontColor}
                onChange={handleTextChange('fontColor')}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 140 }}
              />
              <TextField
                label="Background Colour"
                type="color"
                value={textOptions.boxColor}
                onChange={handleTextChange('boxColor')}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 140 }}
                disabled={!textOptions.box}
              />
            </Stack>
            <FormControlLabel
              control={<Switch checked={textOptions.box} onChange={handleToggle('box')} />}
              label="Apply glow background"
            />
          </Stack>

          <Divider textAlign="left">Position</Divider>

          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="text-position-select">Position</InputLabel>
              <Select
                labelId="text-position-select"
                label="Position"
                value={positionState.position}
                onChange={handlePositionChange}
              >
                {POSITION_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {positionState.position === 'custom' ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Custom X expression"
                  value={positionState.customX}
                  onChange={handleCustomPositionChange('customX')}
                  placeholder="e.g. (w-text_w)/2"
                  fullWidth
                />
                <TextField
                  label="Custom Y expression"
                  value={positionState.customY}
                  onChange={handleCustomPositionChange('customY')}
                  placeholder="e.g. (h-text_h)/2"
                  fullWidth
                />
              </Stack>
            ) : null}
          </Stack>

          <Divider textAlign="left">Actions</Divider>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              onClick={handleApply}
              sx={{
                flexGrow: 1,
                background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Render Text Overlay
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

export default TextOverlayPanel;
