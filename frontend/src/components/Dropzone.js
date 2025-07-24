import React, { useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export default function Dropzone({ onFiles }) {
  const inputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = e => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(Array.from(e.target.files));
    }
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      sx={{
        width: 420,
        height: 260,
        mx: 'auto',
        my: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed',
        borderColor: dragActive ? 'primary.main' : 'grey.700',
        borderRadius: 3,
        background: dragActive ? 'rgba(255,214,0,0.04)' : 'background.paper',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: dragActive ? 4 : 1,
      }}
    >
      <FolderOpenIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
        Add files
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Or drop files here
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </Box>
  );
} 