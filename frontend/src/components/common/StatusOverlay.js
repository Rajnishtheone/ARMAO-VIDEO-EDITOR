import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import useEditor from '../../hooks/useEditor';

const StatusOverlay = () => {
  const { loading, statusMessage } = useEditor();

  return (
    <Backdrop
      open={loading}
      sx={{
        zIndex: theme => theme.zIndex.drawer + 1,
        color: '#fff',
        backdropFilter: 'blur(12px)',
        background: 'rgba(7,8,21,0.58)',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress
          size={64}
          thickness={4}
          sx={{
            color: theme => theme.palette.primary.light,
            filter: 'drop-shadow(0 0 12px rgba(129,140,248,0.45))',
          }}
        />
        {statusMessage ? (
          <Typography variant="body2" sx={{ letterSpacing: '0.04em' }}>
            {statusMessage}
          </Typography>
        ) : null}
      </Stack>
    </Backdrop>
  );
};

export default StatusOverlay;
