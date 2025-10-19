import { createTheme } from '@mui/material/styles';

const palettes = {
  light: {
    primary: { main: '#facc15', contrastText: '#111827' },
    secondary: { main: '#fde047' },
    background: {
      default: '#f3f4f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
    gradient: {
      hero: 'linear-gradient(135deg, rgba(250,204,21,0.1), rgba(15,23,42,0.08))',
    },
  },
  dark: {
    primary: { main: '#facc15', contrastText: '#14161b' },
    secondary: { main: '#fde047' },
    background: {
      default: '#0f1117',
      paper: '#181b23',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
    gradient: {
      hero: 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(15,17,23,0.05))',
    },
  },
};

export const getTheme = (mode = 'dark') => {
  const palette = palettes[mode] || palettes.dark;

  return createTheme({
    palette: {
      mode,
      ...palette,
      gradient: palette.gradient,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
      h6: {
        fontWeight: 700,
        letterSpacing: '0.04em',
      },
    },
    shadows: Array(25).fill('none'),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: '1.1rem',
            paddingBlock: '0.6rem',
            transition: 'background 160ms ease, transform 160ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          containedPrimary: {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText || '#14161b',
            '&:hover': {
              backgroundColor: palette.secondary.main,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backdropFilter: 'blur(6px)',
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 12,
            padding: '8px 12px',
            fontSize: '0.75rem',
          },
        },
      },
    },
  });
};
