import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

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
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 2,
        p: 3,
        border: theme => `1px solid ${theme.palette.primary.main}24`,
        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}1f, transparent 70%)`,
        boxShadow: theme => `0 32px 65px -55px ${theme.palette.primary.main}cc`,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label="Step 1"
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 999 }}
            />
            <Typography variant="caption" color="text.secondary">
              Import your base footage to unlock every tool.
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Bring your hero clip onboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uploading a new video resets the live session, giving you a clean slate for edits, overlays, and exports.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
            sx={{
              alignSelf: 'flex-start',
              background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: '0 20px 40px -30px rgba(99,102,241,0.8)',
            }}
          >
            Upload video
            <input type="file" hidden accept="video/*" onChange={handleVideoUpload} />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ImportPanel;
