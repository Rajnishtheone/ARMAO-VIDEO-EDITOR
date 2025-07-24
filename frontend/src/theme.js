import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'dark') => createTheme({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          background: {
            default: '#18191a',
            paper: '#232526',
          },
          primary: { main: '#ffd600' },
          secondary: { main: '#00bcd4' },
        }
      : {
          background: {
            default: '#f4f6f8',
            paper: '#fff',
          },
          primary: { main: '#ffd600' },
          secondary: { main: '#00bcd4' },
        }),
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, Arial',
  },
}); 