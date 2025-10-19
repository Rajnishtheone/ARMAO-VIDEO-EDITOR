import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';

import { TOOLS, TOOL_IDS } from '../../constants/tools';

const Sidebar = ({ activeTool, onSelect, hasVideo }) => (
  <Box
    sx={{
      width: { xs: 'auto', md: 96 },
      flexShrink: 0,
      borderRadius: { xs: 2, md: 4 },
      bgcolor: theme => theme.palette.background.paper,
      border: theme => `1px solid ${alpha(theme.palette.common.black, 0.35)}`,
      py: { xs: 1, md: 3 },
      px: { xs: 1.5, md: 2 },
      display: 'flex',
      flexDirection: { xs: 'row', md: 'column' },
      gap: { xs: 1.5, md: 2.5 },
      alignItems: { xs: 'center', md: 'stretch' },
      justifyContent: { xs: 'center', md: 'flex-start' },
    }}
  >
    <Typography
      variant="caption"
      sx={{
        display: { xs: 'none', md: 'block' },
        textTransform: 'uppercase',
        letterSpacing: '0.24em',
        color: 'text.secondary',
        textAlign: 'center',
      }}
    >
      Tools
    </Typography>
    <Stack
      spacing={1.5}
      sx={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      {TOOLS.map(tool => {
        const Icon = tool.icon;
        const locked = !hasVideo && tool.id !== TOOL_IDS.IMPORT;
        const isActive = tool.id === activeTool;
        return (
          <ButtonBase
            key={tool.id}
            disableRipple
            disabled={locked}
            onClick={() => {
              if (locked) return;
              onSelect(tool.id);
            }}
            sx={{
              width: '100%',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              px: { xs: 1.5, md: 1 },
              py: { xs: 1, md: 1.5 },
              backgroundColor: theme => (isActive
                ? alpha(theme.palette.primary.main, 0.18)
                : 'transparent'),
              border: theme => (isActive
                ? `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`
                : `1px solid ${alpha(theme.palette.common.white, 0.04)}`),
              color: isActive ? 'primary.main' : 'text.secondary',
              transition: 'all 160ms ease',
              opacity: locked ? 0.4 : 1,
              '&:hover': {
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: theme => (isActive
                  ? alpha(theme.palette.primary.main, 0.25)
                  : alpha(theme.palette.common.white, 0.06)),
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: isActive ? 700 : 500, letterSpacing: '0.05em' }}>
              {tool.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Stack>
  </Box>
);

export default Sidebar;
