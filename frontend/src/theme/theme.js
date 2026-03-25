// frontend/src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A4F6E',       // Deep ocean blue
      light: '#1A7A9E',
      dark: '#062F42',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00C8A0',       // Aqua teal
      light: '#33D4B3',
      dark: '#009475',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E84040',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#10B981',
    },
    background: {
      default: '#F0F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0D2D3F',
      secondary: '#4A6E7E',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Nunito", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(10,79,110,0.25)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0A4F6E 0%, #1A7A9E 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #00C8A0 0%, #009475 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(10,79,110,0.08)',
          border: '1px solid rgba(10,79,110,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 20px rgba(10,79,110,0.12)',
        },
      },
    },
  },
});

export default theme;
