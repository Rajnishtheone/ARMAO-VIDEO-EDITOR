import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import useEditor from '../../hooks/useEditor';
import useEditorActions from '../../hooks/useEditorActions';

const AudioPanel = () => {
  const { assets, activeAssetId, lastAssetId } = useEditor();
  const { muteAudio, uploadSupportAsset, replaceAudio, undoLast } = useEditorActions();
  const [audioAssetId, setAudioAssetId] = useState(null);

  const activeAsset = useMemo(
    () => assets.find(asset => asset.id === activeAssetId),
    [assets, activeAssetId],
  );

  useEffect(() => {
    setAudioAssetId(null);
  }, [activeAssetId]);

  if (!activeAsset) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a video asset to edit its audio track.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleMute = () => {
    muteAudio(activeAsset.id);
  };

  const handleAudioUpload = event => {
    const { files } = event.target;
    if (files && files[0]) {
      uploadSupportAsset(files[0], 'audio').then(asset => {
        setAudioAssetId(asset.id);
      });
      event.target.value = null;
    }
  };

  const handleReplace = () => {
    if (!audioAssetId) return;
    replaceAudio(activeAsset.id, { audioAssetId });
  };

  const handleUndo = () => {
    undoLast(activeAssetId);
  };

  return (
    <Card>
      <CardHeader title="Audio Tools" subheader="Mute or replace the soundtrack" />
      <CardContent>
        <Stack spacing={2}>
          <Button variant="contained" color="secondary" onClick={handleMute}>
            Mute Audio
          </Button>
          <Button variant="outlined" component="label">
            {audioAssetId ? 'Replace Audio File' : 'Upload New Audio'}
            <input type="file" hidden accept="audio/*" onChange={handleAudioUpload} />
          </Button>
          <Button variant="contained" onClick={handleReplace} disabled={!audioAssetId}>
            Apply Replacement
          </Button>
          {audioAssetId ? (
            <Typography variant="body2" color="text.secondary">
              Audio asset ready for replacement.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Upload an audio track to replace the existing soundtrack.
            </Typography>
          )}
          <Button variant="text" onClick={handleUndo} disabled={!lastAssetId}>
            Undo last change
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AudioPanel;
