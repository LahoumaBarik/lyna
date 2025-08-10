import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ReservationTypeform from './pages/ReservationTypeform';
import Paiement from './pages/Paiement';
import DashboardCoiffeuse from './pages/DashboardCoiffeuse';
import DashboardAdmin from './pages/DashboardAdmin';
import EnhancedDashboardAdmin from './pages/EnhancedDashboardAdmin';
import DashboardClient from './pages/DashboardClient';
import SalonInfo from './pages/SalonInfo';
import Navbar from './components/Navbar';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import AproposPage from './pages/Apropos';
import EquipePage from './pages/Equipe';
import StylistProfilePage from './pages/StylistProfile';
import FAQPage from './pages/FAQ';
import Profile from './pages/Profile';
import Reviews from './pages/Reviews';
import StylistApplication from './pages/StylistApplication';
import StylistApplicationAdmin from './pages/StylistApplicationAdmin';
import './App.css';
import './typeform-theme.css';

// Suppress React Router deprecation warnings
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Protected Route Component
const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Modern Professional Design System
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B7355',      // Sophisticated warm brown
      light: '#B5A593',     // Light warm beige
      dark: '#6B5842',      // Deep warm brown
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#D4AF37',      // Elegant gold
      light: '#E6C866',     // Light gold
      dark: '#B8941F',      // Deep gold
      contrastText: '#2C2C2C'
    },
    tertiary: {
      main: '#F5F1EB',      // Warm cream
      light: '#FDFCFA',     // Off-white
      dark: '#E8E0D6',      // Soft beige
      contrastText: '#2C2C2C'
    },
    background: {
      default: '#FDFCFA',   // Premium off-white
      paper: '#FFFFFF',     // Pure white
      accent: '#F8F6F2'     // Subtle warm background
    },
    text: {
      primary: '#2C2C2C',   // Rich charcoal
      secondary: '#5A5A5A', // Medium gray
      tertiary: '#8A8A8A'   // Light gray
    },
    neutral: {
      50: '#FDFCFA',
      100: '#F8F6F2',
      200: '#F0EDE7',
      300: '#E5E0D8',
      400: '#D1C7B8',
      500: '#B8A593',
      600: '#8B7355',
      700: '#6B5842',
      800: '#4A3E32',
      900: '#2C2C2C'
    },
    success: {
      main: '#10B981',
      light: '#6EE7B7',
      dark: '#047857'
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706'
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#DC2626'
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontWeight: 600,
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontWeight: 600,
      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h4: {
      fontWeight: 600,
      fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)',
      lineHeight: 1.4
    },
    h5: {
      fontWeight: 500,
      fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
      lineHeight: 1.4
    },
    h6: {
      fontWeight: 500,
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.5,
      fontWeight: 500
    },
    subtitle2: {
      fontSize: '1rem',
      lineHeight: 1.4,
      fontWeight: 500
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      fontWeight: 400,
      letterSpacing: '0.03em'
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    }
  },
  spacing: 8,
  shape: {
    borderRadius: 16
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(44, 44, 44, 0.08), 0px 1px 2px rgba(44, 44, 44, 0.12)',
    '0px 1px 5px rgba(44, 44, 44, 0.08), 0px 3px 4px rgba(44, 44, 44, 0.1)',
    '0px 2px 8px rgba(44, 44, 44, 0.08), 0px 6px 10px rgba(44, 44, 44, 0.15)',
    '0px 4px 12px rgba(44, 44, 44, 0.08), 0px 8px 16px rgba(44, 44, 44, 0.15)',
    '0px 6px 16px rgba(44, 44, 44, 0.08), 0px 12px 24px rgba(44, 44, 44, 0.15)',
    '0px 8px 24px rgba(44, 44, 44, 0.08), 0px 16px 32px rgba(44, 44, 44, 0.15)',
    '0px 12px 32px rgba(44, 44, 44, 0.08), 0px 24px 48px rgba(44, 44, 44, 0.15)',
    '0px 16px 40px rgba(44, 44, 44, 0.08), 0px 32px 64px rgba(44, 44, 44, 0.15)',
    '0px 20px 48px rgba(44, 44, 44, 0.08), 0px 40px 80px rgba(44, 44, 44, 0.15)',
    '0px 24px 56px rgba(44, 44, 44, 0.08), 0px 48px 96px rgba(44, 44, 44, 0.15)'
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          fontFeatureSettings: '"kern" 1',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(44, 44, 44, 0.15)',
            transform: 'translateY(-2px)'
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: '0px 2px 8px rgba(44, 44, 44, 0.15)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(44, 44, 44, 0.2)'
          }
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px'
          }
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem'
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.125rem'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 4px 12px rgba(44, 44, 44, 0.08), 0px 8px 16px rgba(44, 44, 44, 0.15)',
          border: '1px solid rgba(139, 115, 85, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 24px rgba(44, 44, 44, 0.12), 0px 16px 32px rgba(44, 44, 44, 0.15)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none'
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(44, 44, 44, 0.08), 0px 1px 2px rgba(44, 44, 44, 0.12)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8B7355',
                borderWidth: '2px'
              }
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8B7355',
                borderWidth: '2px'
              }
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139, 115, 85, 0.1)',
          color: '#2C2C2C',
          boxShadow: '0px 1px 3px rgba(44, 44, 44, 0.08), 0px 1px 2px rgba(44, 44, 44, 0.12)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0px 20px 48px rgba(44, 44, 44, 0.15), 0px 40px 80px rgba(44, 44, 44, 0.1)'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            minHeight: 48,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0'
        }
      }
    }
  }
});

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #8B7355 0%, #B5A593 100%)'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#2C2C2C'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '3px solid rgba(44,44,44,0.3)',
            borderTop: '3px solid #2C2C2C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3>Chargement...</h3>
        </div>
      </div>
    );
  }

  return (
    <Router {...router}>
      <div className="App">
        <Navbar user={user} onLogout={logout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/nouveaux-clients" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
          <Route path="/coiffeuses" element={<ReservationTypeform />} />
          <Route path="/rendez-vous" element={<ReservationTypeform />} />
          <Route path="/reservation" element={<ReservationTypeform />} />
          <Route path="/salon" element={<SalonInfo />} />
          <Route path="/a-propos" element={<AproposPage />} />
          <Route path="/equipe" element={<EquipePage />} />
          <Route path="/equipe/:id" element={<StylistProfilePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute roles={['client', 'stylist', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-coiffeuse" 
            element={
              <ProtectedRoute roles={['stylist']}>
                <DashboardCoiffeuse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardAdmin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/enhanced" 
            element={
              <ProtectedRoute roles={['admin']}>
                <EnhancedDashboardAdmin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-client" 
            element={
              <ProtectedRoute roles={['client']}>
                <DashboardClient />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/paiement" 
            element={
              <ProtectedRoute roles={['client', 'admin', 'stylist']}>
                <Paiement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reviews" 
            element={
              <ProtectedRoute roles={['client', 'stylist', 'admin']}>
                <Reviews />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stylist-application" 
            element={
              <ProtectedRoute roles={['client']}>
                <StylistApplication />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#2C2C2C',
              border: '1px solid #8B7355'
            }
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
