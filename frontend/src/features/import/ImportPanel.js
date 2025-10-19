import React from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';

import useEditorActions from '../../hooks/useEditorActions';

const ImportPanel = () => {
  const { uploadAsset } = useEditorActions();

  const handleVideoUpload = async event => {
    const { files } = event.target;
    const file = files && files[0];
    if (!file) {
      return;
    }
    try {
      await uploadAsset(file);
    } catch (error) {
      console.error('Video upload failed', error);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        minHeight: { xs: 320, md: 360 },
        bgcolor: theme => `${theme.palette.background.paper}f2`,
        border: theme => `1px solid ${theme.palette.common.black}26`,
        px: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={1.8} alignItems="center" sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Start here
        </Typography>
        <ButtonBase
          component="label"
          sx={{
            width: '100%',
            borderRadius: 5,
            border: theme => `2px dashed ${theme.palette.primary.main}`,
            backgroundColor: theme => `${theme.palette.primary.main}14`,
            padding: { xs: 5, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.3,
            color: 'primary.main',
          }}
        >
          <FolderRoundedIcon sx={{ fontSize: 38 }} />
          <Stack spacing={0.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
              Add files
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Or drop files here
            </Typography>
          </Stack>
          <input type="file" hidden accept="video/*" onChange={handleVideoUpload} />
        </ButtonBase>
        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}>
          Uploading a new video resets the current session so you can craft edits with a clean slate.
        </Typography>
      </Stack>
    </Card>
  );
};

export default ImportPanel;
