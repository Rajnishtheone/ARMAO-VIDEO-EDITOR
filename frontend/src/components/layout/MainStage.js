import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';

import VideoPlayer from '../media/VideoPlayer';
import { TOOL_IDS } from '../../constants/tools';
import ImportPanel from '../../features/import/ImportPanel';
import TrimPanel from '../../features/trim/TrimPanel';
import FilterPanel from '../../features/filters/FilterPanel';
import TextOverlayPanel from '../../features/overlays/TextOverlayPanel';
import ImageOverlayPanel from '../../features/overlays/ImageOverlayPanel';
import AudioPanel from '../../features/audio/AudioPanel';
import SpeedPanel from '../../features/speed/SpeedPanel';
import MergePanel from '../../features/merge/MergePanel';
import ExportPanel from '../../features/export/ExportPanel';
import AssetLibraryPanel from '../../features/library/AssetLibraryPanel';

const PANEL_MAP = {
  [TOOL_IDS.IMPORT]: ImportPanel,
  [TOOL_IDS.TRIM]: TrimPanel,
  [TOOL_IDS.FILTERS]: FilterPanel,
  [TOOL_IDS.TEXT]: TextOverlayPanel,
  [TOOL_IDS.IMAGE]: ImageOverlayPanel,
  [TOOL_IDS.AUDIO]: AudioPanel,
  [TOOL_IDS.SPEED]: SpeedPanel,
  [TOOL_IDS.MERGE]: MergePanel,
  [TOOL_IDS.EXPORT]: ExportPanel,
};

const MainStage = ({ activeTool, hasVideo }) => {
  const PanelComponent = PANEL_MAP[activeTool] || ImportPanel;

  if (!hasVideo) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <ImportPanel />
      </Box>
    );
  }

  return (
    <Stack spacing={3.5} sx={{ flexGrow: 1, maxWidth: 1280, mx: 'auto', width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          },
          gap: 3,
          alignItems: 'flex-start',
        }}
      >
        <VideoPlayer />
        <Fade key={activeTool} in timeout={400}>
          <Box sx={{ width: '100%' }}>
            <PanelComponent />
          </Box>
        </Fade>
      </Box>
      {activeTool !== TOOL_IDS.MERGE ? <AssetLibraryPanel /> : null}
    </Stack>
  );
};

export default MainStage;
