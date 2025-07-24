import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';

export default function Sidebar({ selected, onSelect, navItems }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 80,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 80,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ mt: 2 }}>
        <List>
          {navItems.map((item, idx) => (
            <ListItem
              key={item.label}
              selected={selected === idx}
              onClick={() => onSelect && onSelect(idx)}
              sx={{
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
                color: selected === idx ? 'primary.main' : 'text.secondary',
                background: selected === idx ? 'rgba(255,214,0,0.08)' : 'none',
                borderRadius: 2,
                mb: 1,
                cursor: 'pointer',
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: 'inherit', mb: 0.5 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 11,
                  textAlign: 'center',
                  fontWeight: selected === idx ? 700 : 400,
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
} 