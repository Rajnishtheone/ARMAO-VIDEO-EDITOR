import React, { useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';
import { buildMediaUrl } from '../../services/mediaApi';

const ExportPanel = () => {
  const { assets, activeAssetId } = useEditor();
  const { exportVideo } = useEditorActions();

  const activeAsset = useMemo(
    () => assets.find(asset => asset.id === activeAssetId),
    [assets, activeAssetId],
  );

  const [format, setFormat] = useState('mp4');
  const [resolution, setResolution] = useState('original');
  const [mute, setMute] = useState(false);
  const [result, setResult] = useState(null);

  if (!activeAsset) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a video asset to export.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleExport = () => {
    const operations = {};
    if (mute) operations.mute = true;

    exportVideo({
      assetId: activeAsset.id,
      format,
      resolution,
      operations,
    }).then(asset => {
      setResult(asset);
    });
  };

  return (
    <Card>
      <CardHeader title="Export" subheader="Render the final video for download" />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Format"
              value={format}
              onChange={event => setFormat(event.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="mp4">MP4 (H.264)</MenuItem>
              <MenuItem value="webm">WebM</MenuItem>
              <MenuItem value="mov">MOV (ProRes)</MenuItem>
            </TextField>
            <TextField
              select
              label="Resolution"
              value={resolution}
              onChange={event => setResolution(event.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="original">Original</MenuItem>
              <MenuItem value="480p">480p</MenuItem>
              <MenuItem value="720p">720p</MenuItem>
              <MenuItem value="1080p">1080p</MenuItem>
            </TextField>
          </Stack>
          <FormControlLabel
            control={<Switch checked={mute} onChange={(_, checked) => setMute(checked)} />}
            label="Mute audio in export"
          />
          <Button variant="contained" onClick={handleExport}>
            Build Export
          </Button>
          {result ? (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Export ready: {result.originalName}
              </Typography>
              <Button
                variant="outlined"
                component="a"
                href={buildMediaUrl(result.url)}
                download={result.originalName}
              >
                Download Export
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ExportPanel;
