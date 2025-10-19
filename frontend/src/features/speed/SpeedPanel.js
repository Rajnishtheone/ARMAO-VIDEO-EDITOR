import React, { useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';

const SPEED_PRESETS = [
  { value: 0.5, label: '0.5× Slow' },
  { value: 0.75, label: '0.75× Ease' },
  { value: 1, label: '1× Original' },
  { value: 1.25, label: '1.25× Push' },
  { value: 1.5, label: '1.5× Fast' },
  { value: 2, label: '2× Hyper' },
];

const SpeedPanel = () => {
  const { assets, activeAssetId, lastAssetId } = useEditor();
  const { changeSpeed, undoLast } = useEditorActions();
  const [speed, setSpeed] = useState(1.5);

  const activeAsset = useMemo(
    () => assets.find(asset => asset.id === activeAssetId),
    [assets, activeAssetId],
  );

  if (!activeAsset) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a video asset to adjust its speed.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleSpeedChange = (_, value) => {
    if (value !== null) {
      setSpeed(value);
    }
  };

  const handleApply = () => {
    changeSpeed(activeAsset.id, speed);
  };

  const handleUndo = () => {
    undoLast(activeAssetId);
  };

  return (
    <Card
      sx={{
        background: theme => `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.paper}f3)`,
        border: theme => `1px solid ${theme.palette.primary.main}1f`,
        boxShadow: theme => `0 24px 55px -42px ${theme.palette.primary.main}44`,
      }}
    >
      <CardHeader
        title="Playback Speed"
        subheader="Create dramatic slow motion or accelerate action with a single click."
      />
      <CardContent>
        <Stack spacing={3}>
          <ToggleButtonGroup
            exclusive
            value={speed}
            onChange={handleSpeedChange}
            size="medium"
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            {SPEED_PRESETS.map(option => (
              <ToggleButton key={option.value} value={option.value} sx={{ flexBasis: { xs: '48%', sm: 'auto' } }}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!activeAssetId}
              sx={{
                flexGrow: 1,
                background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Render {speed === 1 ? 'original speed' : `${speed}×`} clip
            </Button>
            <Button variant="text" onClick={handleUndo} disabled={!lastAssetId}>
              Undo last change
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Audio pitch is preserved automatically while FFmpeg adjusts the playback tempo.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SpeedPanel;
