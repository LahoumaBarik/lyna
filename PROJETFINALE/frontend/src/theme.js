import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#D4B996', // Beige chaud
      light: '#E8D5C4',
      dark: '#B8A08A',
      contrastText: '#2C2C2C',
    },
    secondary: {
      main: '#F5E6D3', // Beige clair
      light: '#FAF3E8',
      dark: '#E6D4C0',
      contrastText: '#2C2C2C',
    },
    background: {
      default: '#FDFCFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#6B6B6B',
    },
    grey: {
      50: '#FDFCFA',
      100: '#F8F6F2',
      200: '#F0EDE7',
      300: '#E6E0D8',
      400: '#C8C2B8',
      500: '#A8A39A',
      600: '#8A857C',
      700: '#6B6B6B',
      800: '#4A4A4A',
      900: '#2C2C2C',
    },
    // Couleurs accent pour les éléments spéciaux
    accent: {
      warm: '#E6D4C0', // Beige chaud
      cool: '#F0EDE7', // Beige froid
      cream: '#FAF3E8', // Crème
      taupe: '#B8A08A', // Taupe
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#2C2C2C',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#2C2C2C',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2C2C2C',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2C2C2C',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2C2C2C',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2C2C2C',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2C2C2C',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6B6B6B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(44, 44, 44, 0.03)',
    '0px 4px 8px rgba(44, 44, 44, 0.06)',
    '0px 8px 16px rgba(44, 44, 44, 0.08)',
    '0px 16px 32px rgba(44, 44, 44, 0.12)',
    '0px 32px 64px rgba(44, 44, 44, 0.16)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)',
          },
        },
        contained: {
          boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.08)',
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
            color: '#2C2C2C',
            '&:hover': {
              background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: '0px 8px 32px rgba(166, 124, 82, 0.18)',
            },
          },
        },
        outlined: {
          '&.MuiButton-outlinedPrimary': {
            borderColor: '#D4B996',
            color: '#2C2C2C',
            '&:hover': {
              background: 'rgba(212, 185, 150, 0.08)',
              borderColor: '#B8A08A',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: '#FFFFFF',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 24px rgba(44, 44, 44, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D4B996',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#B8A08A',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(212, 185, 150, 0.2)',
          boxShadow: '0px 8px 32px 0 rgba(176, 137, 104, 0.13), 0px 2px 8px rgba(176, 137, 104, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #FDFCFA 0%, #F8F6F2 100%)',
          borderRight: '1px solid rgba(212, 185, 150, 0.3)',
          boxShadow: '4px 0 20px rgba(44, 44, 44, 0.12)',
        },
      },
    },
  },
}); 