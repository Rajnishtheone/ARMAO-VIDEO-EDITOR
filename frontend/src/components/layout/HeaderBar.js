import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 3,
        bgcolor: theme => theme.palette.background.paper,
        border: theme => `1px solid ${theme.palette.common.black}40`,
        px: { xs: 2, md: 2.5 },
        py: 1.75,
      }}
    >
      <Stack spacing={0.4}>
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.16em' }}>
          ARMAO STUDIO
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Video Workspace
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.2} alignItems="center">
        <Tooltip title="Refresh media library">
          <IconButton
            onClick={refreshAssets}
            sx={{
              bgcolor: theme => `${theme.palette.primary.main}1f`,
              color: 'primary.main',
              '&:hover': {
                bgcolor: theme => `${theme.palette.primary.main}33`,
              },
            }}
          >
            <SyncRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle theme">
          <IconButton
            onClick={onToggleTheme}
            sx={{
              color: 'text.secondary',
              border: theme => `1px solid ${theme.palette.primary.main}33`,
            }}
          >
            <ThemeIcon />
          </IconButton>
        </Tooltip>
        <IconButton sx={{ color: 'text.secondary' }}>
          <SettingsRoundedIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default HeaderBar;
