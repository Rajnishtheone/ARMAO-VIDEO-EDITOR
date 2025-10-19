import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';

const DEFAULT_STATE = {
  filterType: 'brightness',
  brightness: 0,
  contrast: 1,
  saturation: 1,
};

const FilterPanel = () => {
  const { assets, activeAssetId, lastAssetId } = useEditor();
  const { applyFilter, undoLast } = useEditorActions();
  const activeAsset = useMemo(
    () => assets.find(asset => asset.id === activeAssetId),
    [assets, activeAssetId],
  );

  const [filters, setFilters] = useState(DEFAULT_STATE);

  useEffect(() => {
    setFilters(DEFAULT_STATE);
  }, [activeAssetId]);

  if (!activeAsset) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a video asset to apply filters.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleApply = () => {
    applyFilter(activeAsset.id, filters);
  };

  const handleUndo = () => {
    undoLast(activeAssetId);
  };

  return (
    <Card>
      <CardHeader title="Filters" subheader="Enhance the look of your clip" />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            select
            label="Filter"
            value={filters.filterType}
            onChange={event => setFilters(prev => ({ ...prev, filterType: event.target.value }))}
          >
            <MenuItem value="brightness">Brightness</MenuItem>
            <MenuItem value="contrast">Contrast</MenuItem>
            <MenuItem value="saturation">Saturation</MenuItem>
            <MenuItem value="grayscale">Grayscale</MenuItem>
            <MenuItem value="custom">Custom Mix</MenuItem>
          </TextField>
          {filters.filterType !== 'grayscale' ? (
            <>
              <Typography variant="caption">Brightness</Typography>
              <Slider
                value={filters.brightness}
                onChange={(_, value) => setFilters(prev => ({ ...prev, brightness: value }))}
                min={-1}
                max={1}
                step={0.1}
              />
              <Typography variant="caption">Contrast</Typography>
              <Slider
                value={filters.contrast}
                onChange={(_, value) => setFilters(prev => ({ ...prev, contrast: value }))}
                min={0.5}
                max={3}
                step={0.1}
              />
              <Typography variant="caption">Saturation</Typography>
              <Slider
                value={filters.saturation}
                onChange={(_, value) => setFilters(prev => ({ ...prev, saturation: value }))}
                min={0}
                max={3}
                step={0.1}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Grayscale removes colour information from the clip.
            </Typography>
          )}
          <Button variant="contained" onClick={handleApply}>
            Apply Filter
          </Button>
          <Button variant="text" onClick={handleUndo} disabled={!lastAssetId}>
            Undo last change
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
