import { createTheme } from '@mui/material/styles';

const palettes = {
  light: {
    primary: { main: '#6366f1' },
    secondary: { main: '#f472b6' },
    background: {
      default: '#f5f7ff',
      paper: '#ffffffd9',
    },
    text: {
      primary: '#151a2d',
      secondary: '#4c5975',
    },
    gradient: {
      hero: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(244,114,182,0.2))',
    },
  },
  dark: {
    primary: { main: '#8b5cf6' },
    secondary: { main: '#f472b6' },
    background: {
      default: '#070815',
      paper: '#0b1120f2',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    gradient: {
      hero: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.15))',
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
        letterSpacing: '0.02em',
      },
      h6: {
        fontWeight: 700,
        letterSpacing: '0.04em',
      },
    },
    shadows: [
      'none',
      '0 10px 25px -20px rgba(15,23,42,0.35)',
      '0 30px 60px -40px rgba(99,102,241,0.45)',
      ...Array(22).fill('0 35px 70px -50px rgba(15,23,42,0.45)'),
    ],
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
            transition: 'transform 160ms ease, box-shadow 160ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 18px 35px -22px rgba(99,102,241,0.55)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backdropFilter: 'blur(12px)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
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
