import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { EditorProvider } from './context/EditorContext';
import useEditor from './hooks/useEditor';
import { getTheme } from './theme';
import HeaderBar from './components/layout/HeaderBar';
import Sidebar from './components/layout/Sidebar';
import MainStage from './components/layout/MainStage';
import SnackbarHost from './components/common/SnackbarHost';
import StatusOverlay from './components/common/StatusOverlay';
import { TOOL_IDS } from './constants/tools';

const AppShell = () => {
  const { assets } = useEditor();
  const [activeTool, setActiveTool] = useState(TOOL_IDS.IMPORT);
  const hasVideo = assets.some(asset => asset.kind === 'video');

  useEffect(() => {
    if (!hasVideo && activeTool !== TOOL_IDS.IMPORT) {
      setActiveTool(TOOL_IDS.IMPORT);
    }
  }, [hasVideo, activeTool, setActiveTool]);

  const handleSelect = toolId => {
    if (!hasVideo && toolId !== TOOL_IDS.IMPORT) {
      return;
    }
    setActiveTool(toolId);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 2, md: 3 },
        flex: 1,
        px: { xs: 2.5, md: 4 },
        pb: { xs: 3, md: 4 },
        minHeight: 0,
      }}
    >
      <Sidebar activeTool={activeTool} onSelect={handleSelect} hasVideo={hasVideo} />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          pr: { xs: 0, md: 0.5 },
        }}
      >
        <MainStage activeTool={activeTool} hasVideo={hasVideo} />
      </Box>
    </Box>
  );
};

const App = () => {
  const [themeMode, setThemeMode] = useState('dark');
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <EditorProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.primary,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, md: 4 },
              pt: { xs: 3, md: 4 },
            }}
          >
            <HeaderBar themeMode={themeMode} onToggleTheme={toggleTheme} />
          </Box>
          <AppShell />
          <StatusOverlay />
          <SnackbarHost />
        </Box>
      </ThemeProvider>
    </EditorProvider>
  );
};

export default App;
