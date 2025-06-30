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
import './App.css';
import './typeform-theme.css';

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

// Simple light theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D4B996',
      light: '#E8D5C4',
      dark: '#B8A08A',
      contrastText: '#2C2C2C'
    },
    secondary: {
      main: '#8D6E63',
      light: '#A1887F',
      dark: '#5D4037',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FDFCFA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#6B6B6B'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem'
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem'
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem'
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem'
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
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
        background: 'linear-gradient(135deg, #D4B996 0%, #F5E6D3 100%)'
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
    <Router>
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
              border: '1px solid #D4B996'
            }
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
