import React, { useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';

import useEditor from '../../hooks/useEditor';
import { buildMediaUrl } from '../../services/mediaApi';
import { formatDuration } from '../../utils/format';

const VideoPlayer = () => {
  const { assets, activeAssetId } = useEditor();
  const videoRef = useRef(null);

  const activeAsset = useMemo(
    () => assets.find(asset => asset.id === activeAssetId),
    [assets, activeAssetId],
  );

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.pause();
    videoRef.current.load();
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  }, [activeAsset?.id]);

  if (!activeAsset) {
    return (
      <Box
        sx={{
          borderRadius: 4,
          p: 4,
          border: theme => `1px dashed ${theme.palette.primary.main}55`,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: { xs: 280, md: 360 },
          background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}11, transparent)`,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Upload a video to start crafting your timeline.
        </Typography>
      </Box>
    );
  }

  const videoSource = buildMediaUrl(activeAsset.url);
  const duration = activeAsset.metadata?.duration
    ? formatDuration(activeAsset.metadata.duration)
    : null;
  const resolution = activeAsset.metadata?.width && activeAsset.metadata?.height
    ? `${activeAsset.metadata.width}×${activeAsset.metadata.height}`
    : null;

  return (
    <Box
      sx={{
        borderRadius: 3,
        p: { xs: 1.5, md: 2 },
        background: theme => `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.paper}f2)`,
        border: theme => `1px solid ${theme.palette.primary.main}1a`,
        boxShadow: '0 28px 60px -48px rgba(15,23,42,0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 18px 35px rgba(99,102,241,0.35)',
            }}
          >
            <MovieFilterRoundedIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Active Clip
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {activeAsset.originalName}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          {duration ? <Chip size="small" label={duration} variant="outlined" /> : null}
          {resolution ? <Chip size="small" label={resolution} variant="outlined" /> : null}
        </Stack>
      </Stack>

      <Box
        sx={{
          position: 'relative',
          borderRadius: 1,
          backgroundColor: '#020617',
          border: theme => `1px solid ${theme.palette.divider}`,
          aspectRatio: activeAsset.metadata?.width && activeAsset.metadata?.height
            ? activeAsset.metadata.width / activeAsset.metadata.height
            : 16 / 9,
        }}
      >
        <video
          key={activeAsset.id}
          controls
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          ref={videoRef}
          src={videoSource}
        >
          <track kind="captions" />
        </video>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
