import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';
import { buildMediaUrl } from '../../services/mediaApi';

const emptyVideoState = {
  primaryId: '',
  secondaryId: '',
};

const MergePanel = () => {
  const { assets } = useEditor();
  const { mergeAssets, uploadAdditionalVideo } = useEditorActions();

  const videoAssets = useMemo(
    () => assets.filter(asset => asset.kind === 'video'),
    [assets],
  );

  const [selection, setSelection] = useState(emptyVideoState);
  const [format, setFormat] = useState('mp4');

  useEffect(() => {
    if (!videoAssets.length) {
      setSelection(emptyVideoState);
      return;
    }
    setSelection(prev => ({
      primaryId: prev.primaryId && videoAssets.some(asset => asset.id === prev.primaryId)
        ? prev.primaryId
        : videoAssets[0]?.id || '',
      secondaryId: prev.secondaryId && videoAssets.some(asset => asset.id === prev.secondaryId)
        ? prev.secondaryId
        : videoAssets[1]?.id || '',
    }));
  }, [videoAssets]);

  const handleUpload = async event => {
    const { files } = event.target;
    const file = files && files[0];
    if (!file) return;
    const asset = await uploadAdditionalVideo(file);
    if (asset?.id) {
      setSelection(prev => {
        if (!prev.primaryId) {
          return { ...prev, primaryId: asset.id };
        }
        if (!prev.secondaryId) {
          return { ...prev, secondaryId: asset.id };
        }
        return { ...prev, secondaryId: asset.id };
      });
    }
    event.target.value = null;
  };

  const handlePrimarySelect = event => {
    const value = event.target.value;
    setSelection(prev => ({
      ...prev,
      primaryId: value,
      secondaryId: value === prev.secondaryId ? '' : prev.secondaryId,
    }));
  };

  const handleSecondarySelect = event => {
    const value = event.target.value;
    setSelection(prev => ({
      ...prev,
      secondaryId: value,
      primaryId: value === prev.primaryId ? '' : prev.primaryId,
    }));
  };

  const handleMerge = () => {
    if (!selection.primaryId || !selection.secondaryId) {
      return;
    }
    mergeAssets([selection.primaryId, selection.secondaryId], format);
  };

  const primaryAsset = videoAssets.find(asset => asset.id === selection.primaryId);
  const secondaryAsset = videoAssets.find(asset => asset.id === selection.secondaryId);
  const canMerge = Boolean(selection.primaryId && selection.secondaryId);

  return (
    <Card
      sx={{
        background: theme => `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.paper}f4)`,
        border: theme => `1px solid ${theme.palette.primary.main}1f`,
        boxShadow: theme => `0 24px 55px -42px ${theme.palette.primary.main}55`,
      }}
    >
      <CardHeader
        title="Merge Clips"
        subheader="Choose a base clip, add a second clip, preview them, and render the combined timeline."
      />
      <CardContent>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Primary clip"
              value={selection.primaryId}
              onChange={handlePrimarySelect}
              fullWidth
              helperText="First clip in the merged output"
            >
              <MenuItem value="">
                None
              </MenuItem>
              {videoAssets.map(asset => (
                <MenuItem key={asset.id} value={asset.id}>
                  {asset.originalName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Second clip"
              value={selection.secondaryId}
              onChange={handleSecondarySelect}
              fullWidth
              helperText="Will play immediately after the primary clip"
            >
              <MenuItem value="">
                None
              </MenuItem>
              {videoAssets.map(asset => (
                <MenuItem key={asset.id} value={asset.id}>
                  {asset.originalName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Export format"
              value={format}
              onChange={event => setFormat(event.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="mp4">MP4 (H.264)</MenuItem>
              <MenuItem value="webm">WebM</MenuItem>
              <MenuItem value="mov">MOV (ProRes)</MenuItem>
            </TextField>
            <Button variant="outlined" component="label">
              Upload another clip
              <input type="file" hidden accept="video/*" onChange={handleUpload} />
            </Button>
          </Stack>

          <Divider textAlign="left">Preview</Divider>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <PreviewCard title="Primary clip" asset={primaryAsset} />
            </Grid>
            <Grid item xs={12} md={6}>
              <PreviewCard title="Second clip" asset={secondaryAsset} />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            disabled={!canMerge}
            onClick={handleMerge}
            sx={{
              alignSelf: 'flex-start',
              background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Merge clips
          </Button>
          {!videoAssets.length ? (
            <Typography variant="body2" color="text.secondary">
              Upload at least two video clips to enable merging.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

const PreviewCard = ({ title, asset }) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderRadius: 2,
      borderColor: theme => theme.palette.primary.main + '22',
    }}
  >
    <CardContent>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {asset ? (
          <>
            <Typography variant="body2" fontWeight={600}>{asset.originalName}</Typography>
            <video
              key={asset.id}
              src={buildMediaUrl(asset.url)}
              controls
              preload="metadata"
              style={{ width: '100%', borderRadius: 8 }}
            >
              <track kind="captions" />
            </video>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No clip selected.
          </Typography>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export default MergePanel;
