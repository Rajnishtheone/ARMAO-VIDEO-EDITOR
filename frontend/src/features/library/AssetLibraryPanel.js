import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import useEditor from '../../hooks/useEditor';
import { formatDuration } from '../../utils/format';

const AssetLibraryPanel = ({ items, selectedIds = [], onSelectionChange }) => {
  const { assets, activeAssetId, setActiveAssetId } = useEditor();
  const list = items || assets;

  const handleSelect = assetId => () => {
    setActiveAssetId(assetId);
    if (onSelectionChange) {
      const alreadySelected = selectedIds.includes(assetId);
      const next = alreadySelected
        ? selectedIds.filter(id => id !== assetId)
        : [...selectedIds, assetId];
      onSelectionChange(next);
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 2.5,
        border: theme => `1px solid ${theme.palette.primary.main}24`,
        background: theme => `linear-gradient(140deg, ${theme.palette.background.paper}, ${theme.palette.background.paper}cc)`,
        boxShadow: theme => `0 28px 55px -50px ${theme.palette.primary.main}aa`,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Asset Library
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {list.length} {list.length === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
        <Chip label="Session scoped" size="small" variant="outlined" />
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {list.map(asset => {
          const isActive = asset.id === activeAssetId;
          const isSelected = selectedIds.includes(asset.id);
          return (
            <ListItemButton
              key={asset.id}
              onClick={handleSelect(asset.id)}
              sx={{
                borderRadius: 3,
                px: 2,
                py: 1.5,
                background: theme => {
                  if (isActive) {
                    return `linear-gradient(135deg, ${theme.palette.primary.main}44, transparent)`;
                  }
                  if (isSelected) {
                    return theme.palette.mode === 'dark'
                      ? 'rgba(129,140,248,0.18)'
                      : 'rgba(99,102,241,0.12)';
                  }
                  return 'transparent';
                },
                border: isActive
                  ? '1px solid rgba(129,140,248,0.35)'
                  : '1px solid transparent',
                '&:hover': {
                  background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}26, transparent)`,
                },
              }}
            >
              <ListItemText
                primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }}
                primary={asset.originalName}
                secondary={asset.metadata?.duration
                  ? `Duration ${formatDuration(asset.metadata.duration)}`
                  : asset.kind.toUpperCase()}
              />
              <Stack direction="row" spacing={1}>
                <Chip
                  label={asset.kind.toUpperCase()}
                  size="small"
                  variant={asset.kind === 'video' ? 'filled' : 'outlined'}
                  color={asset.kind === 'video' ? 'primary' : 'default'}
                />
                {isActive ? <Chip size="small" label="Active" color="secondary" variant="outlined" /> : null}
              </Stack>
            </ListItemButton>
          );
        })}
        {!list.length ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Your library is empty. Upload media to get started.
          </Typography>
        ) : null}
      </List>
    </Box>
  );
};

export default AssetLibraryPanel;
