import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';

import useEditor from '../../hooks/useEditor';

const HeaderBar = ({ themeMode, onToggleTheme }) => {
  const { refreshAssets } = useEditor();

  const ThemeIcon = themeMode === 'dark' ? WbSunnyRoundedIcon : DarkModeRoundedIcon;

  return (
    <Box
      sx={{
        mb: 4,
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 2, md: 2.5 },
        borderRadius: 2.5,
        backdropFilter: 'blur(24px)',
        border: theme => `1px solid ${theme.palette.primary.main}24`,
        boxShadow: theme => `0 25px 80px -60px ${theme.palette.primary.main}aa`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}14, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: '0 25px 45px rgba(99,102,241,0.45)',
          }}
        >
          <PlayCircleOutlineRoundedIcon sx={{ color: '#fff', fontSize: 30 }} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.02em',
              mb: 0.4,
              background: 'linear-gradient(135deg, #ffffff, rgba(244,244,255,0.65))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ARMAO Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Craft edits, overlays, and exports with a cinematic workflow.
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Tooltip title="Refresh media library">
          <IconButton
            onClick={refreshAssets}
            sx={{
              color: 'primary.contrastText',
              background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: '0 18px 35px -24px rgba(99,102,241,0.75)',
              '&:hover': {
                background: theme => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            <SyncRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle light/dark mode">
          <IconButton onClick={onToggleTheme} sx={{ color: 'text.primary', border: theme => `1px solid ${theme.palette.primary.main}33` }}>
            <ThemeIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default HeaderBar;
