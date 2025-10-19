import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';
import { formatDuration } from '../../utils/format';

const TrimPanel = () => {
  const { assets, activeAssetId, lastAssetId } = useEditor();
  const { trimAsset, undoLast } = useEditorActions();
  const activeAsset = useMemo(
    () => assets.find(asset => asset.id === activeAssetId),
    [assets, activeAssetId],
  );

  const duration = activeAsset?.metadata?.duration || 60;
  const [range, setRange] = useState([0, Math.min(10, duration)]);

  useEffect(() => {
    if (duration) {
      setRange([0, Math.min(duration, Math.max(duration * 0.25, 10))]);
    }
  }, [duration, activeAssetId]);

  if (!activeAsset) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a video asset to enable trimming.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleApply = () => {
    trimAsset(activeAsset.id, { start: range[0], end: range[1] });
  };

  const handleUndo = () => {
    undoLast(activeAssetId);
  };

  return (
    <Card>
      <CardHeader title="Trim Clip" subheader="Define the start and end points for a new clip" />
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Clip duration: {formatDuration(duration)}
          </Typography>
          <Slider
            value={range}
            onChange={(_, value) => setRange(value)}
            min={0}
            max={Math.max(duration, range[1])}
            step={0.1}
            valueLabelDisplay="auto"
            valueLabelFormat={formatDuration}
          />
          <Typography variant="body2">
            Start: {formatDuration(range[0])} — End: {formatDuration(range[1])}
          </Typography>
          <Button variant="contained" onClick={handleApply}>
            Create Trimmed Clip
          </Button>
          <Button variant="text" onClick={handleUndo} disabled={!lastAssetId}>
            Undo last change
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TrimPanel;
