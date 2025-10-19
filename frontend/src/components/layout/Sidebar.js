import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

import { TOOLS, TOOL_IDS } from '../../constants/tools';

const Sidebar = ({ activeTool, onSelect, hasVideo }) => (
  <Box
    sx={{
      width: { xs: '100%', md: 280 },
      flexShrink: 0,
      position: 'relative',
      zIndex: 2,
      borderRadius: 2,
      px: { xs: 2, md: 2.5 },
      py: 3,
      backdropFilter: 'blur(22px)',
      border: theme => `1px solid ${theme.palette.primary.main}24`,
      boxShadow: theme => `0 35px 65px -55px ${theme.palette.primary.main}aa`,
      background: theme => alpha(theme.palette.background.paper, 0.9),
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }} color="text.secondary">
          Workflow tools
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Timeline Actions</Typography>
      </Box>
      <Chip
        label={hasVideo ? 'Ready' : 'Upload first'}
        size="small"
        color={hasVideo ? 'primary' : 'default'}
        variant="outlined"
      />
    </Box>
    <Divider sx={{ mb: 2 }} />
    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {TOOLS.map(tool => {
        const Icon = tool.icon;
        const locked = !hasVideo && tool.id !== TOOL_IDS.IMPORT;
        const isActive = tool.id === activeTool;
        return (
          <ListItemButton
            key={tool.id}
            selected={isActive}
            disabled={locked}
            onClick={() => {
              if (locked) return;
              onSelect(tool.id);
            }}
            sx={{
              borderRadius: 18,
              px: 2,
              py: 1.5,
              transition: 'transform 180ms ease, background 180ms ease, box-shadow 180ms ease',
              background: theme => (isActive
                ? `linear-gradient(135deg, ${theme.palette.primary.main}55, ${theme.palette.secondary.main}33)`
                : 'transparent'),
              boxShadow: isActive ? '0 18px 35px -28px rgba(99,102,241,0.7)' : 'none',
              transform: isActive ? 'translateY(-1px)' : 'none',
              '& .MuiListItemText-primary': {
                fontWeight: isActive ? 700 : 500,
              },
              '&:hover': {
                transform: 'translateY(-1px)',
                background: theme => alpha(theme.palette.primary.main, 0.12),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Icon color={isActive ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary={tool.label}
              secondary={tool.description}
              secondaryTypographyProps={{ sx: { color: 'text.secondary', fontSize: '0.78rem' } }}
            />
          </ListItemButton>
        );
      })}
    </List>
  </Box>
);

export default Sidebar;
