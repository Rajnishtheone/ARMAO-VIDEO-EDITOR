import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function TopBar() {
  return (
    <AppBar position="static" color="default" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid #222' }}>
      <Toolbar sx={{ minHeight: 64, px: 3 }}>
        <Typography variant="h6" sx={{ flexGrow: 0, fontWeight: 700, color: 'primary.main', mr: 3 }}>
          <span style={{ color: '#ffd600', fontWeight: 900 }}>●</span> VIDEODIRECT-X
        </Typography>
        <Button color="inherit" sx={{ textTransform: 'none', fontWeight: 500, mr: 2 }}>My projects</Button>
        <Button color="inherit" sx={{ textTransform: 'none', fontWeight: 500, mr: 2 }}>New video</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} sx={{ mr: 2, fontWeight: 700 }}>
          Export
        </Button>
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
} 