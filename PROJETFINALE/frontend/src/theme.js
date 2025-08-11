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
    '0px 48px 96px rgba(44, 44, 44, 0.20)',
    '0px 64px 128px rgba(44, 44, 44, 0.24)',
    '0px 80px 160px rgba(44, 44, 44, 0.28)',
    '0px 96px 192px rgba(44, 44, 44, 0.32)',
    '0px 112px 224px rgba(44, 44, 44, 0.36)',
    '0px 128px 256px rgba(44, 44, 44, 0.40)',
    '0px 144px 288px rgba(44, 44, 44, 0.44)',
    '0px 160px 320px rgba(44, 44, 44, 0.48)',
    '0px 176px 352px rgba(44, 44, 44, 0.52)',
    '0px 192px 384px rgba(44, 44, 44, 0.56)',
    '0px 208px 416px rgba(44, 44, 44, 0.60)',
    '0px 224px 448px rgba(44, 44, 44, 0.64)',
    '0px 240px 480px rgba(44, 44, 44, 0.68)',
    '0px 256px 512px rgba(44, 44, 44, 0.72)',
    '0px 272px 544px rgba(44, 44, 44, 0.76)',
    '0px 288px 576px rgba(44, 44, 44, 0.80)',
    '0px 304px 608px rgba(44, 44, 44, 0.84)',
    '0px 320px 640px rgba(44, 44, 44, 0.88)',
    '0px 336px 672px rgba(44, 44, 44, 0.92)',
    '0px 352px 704px rgba(44, 44, 44, 0.96)',
    '0px 368px 736px rgba(44, 44, 44, 1.00)',
    '0px 384px 768px rgba(44, 44, 44, 1.00)',
    '0px 400px 800px rgba(44, 44, 44, 1.00)',
    '0px 416px 832px rgba(44, 44, 44, 1.00)',
    '0px 432px 864px rgba(44, 44, 44, 1.00)',
    '0px 448px 896px rgba(44, 44, 44, 1.00)',
    '0px 464px 928px rgba(44, 44, 44, 1.00)',
    '0px 480px 960px rgba(44, 44, 44, 1.00)',
    '0px 496px 992px rgba(44, 44, 44, 1.00)',
    '0px 512px 1024px rgba(44, 44, 44, 1.00)',
    '0px 528px 1056px rgba(44, 44, 44, 1.00)',
    '0px 544px 1088px rgba(44, 44, 44, 1.00)',
    '0px 560px 1120px rgba(44, 44, 44, 1.00)',
    '0px 576px 1152px rgba(44, 44, 44, 1.00)',
    '0px 592px 1184px rgba(44, 44, 44, 1.00)',
    '0px 608px 1216px rgba(44, 44, 44, 1.00)',
    '0px 624px 1248px rgba(44, 44, 44, 1.00)',
    '0px 640px 1280px rgba(44, 44, 44, 1.00)',
    '0px 656px 1312px rgba(44, 44, 44, 1.00)',
    '0px 672px 1344px rgba(44, 44, 44, 1.00)',
    '0px 688px 1376px rgba(44, 44, 44, 1.00)',
    '0px 704px 1408px rgba(44, 44, 44, 1.00)',
    '0px 720px 1440px rgba(44, 44, 44, 1.00)',
    '0px 736px 1472px rgba(44, 44, 44, 1.00)',
    '0px 752px 1504px rgba(44, 44, 44, 1.00)',
    '0px 768px 1536px rgba(44, 44, 44, 1.00)',
    '0px 784px 1568px rgba(44, 44, 44, 1.00)',
    '0px 800px 1600px rgba(44, 44, 44, 1.00)',
    '0px 816px 1632px rgba(44, 44, 44, 1.00)',
    '0px 832px 1664px rgba(44, 44, 44, 1.00)',
    '0px 848px 1696px rgba(44, 44, 44, 1.00)',
    '0px 864px 1728px rgba(44, 44, 44, 1.00)',
    '0px 880px 1760px rgba(44, 44, 44, 1.00)',
    '0px 896px 1792px rgba(44, 44, 44, 1.00)',
    '0px 912px 1824px rgba(44, 44, 44, 1.00)',
    '0px 928px 1856px rgba(44, 44, 44, 1.00)',
    '0px 944px 1888px rgba(44, 44, 44, 1.00)',
    '0px 960px 1920px rgba(44, 44, 44, 1.00)',
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
        },
      },
    },
  },
}); 