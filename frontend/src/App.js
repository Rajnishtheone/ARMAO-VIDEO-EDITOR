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
    <Box sx={{ display: 'flex', gap: 3, px: { xs: 2, lg: 4 }, pb: 8, position: 'relative', zIndex: 1 }}>
      <Sidebar activeTool={activeTool} onSelect={handleSelect} hasVideo={hasVideo} />
      <MainStage activeTool={activeTool} hasVideo={hasVideo} />
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
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '-45% -25% auto -25%',
              height: '120%',
              background: theme.palette.gradient.hero,
              filter: 'blur(140px)',
              opacity: 0.85,
              animation: 'float 18s ease-in-out infinite alternate',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 420,
              height: 420,
              right: '-6%',
              top: '12%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(244,114,182,0.45), transparent 60%)',
              filter: 'blur(65px)',
              animation: 'pulse 22s ease-in-out infinite',
            },
            '@keyframes float': {
              from: { transform: 'translate3d(0, -4%, 0) scale(1)' },
              to: { transform: 'translate3d(0, 6%, 0) scale(1.05)' },
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.92) translateY(-12px)', opacity: 0.55 },
              '50%': { transform: 'scale(1.06) translateY(8px)', opacity: 0.85 },
              '100%': { transform: 'scale(0.95) translateY(-8px)', opacity: 0.55 },
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, pt: 4 }}>
            <HeaderBar themeMode={themeMode} onToggleTheme={toggleTheme} />
            <AppShell />
          </Box>
          <StatusOverlay />
          <SnackbarHost />
        </Box>
      </ThemeProvider>
    </EditorProvider>
  );
};

export default App;
