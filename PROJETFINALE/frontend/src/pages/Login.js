import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';

const Login = ({ fromReservation, onAuthSuccess }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        // Check for pending reservation
        const pendingReservation = localStorage.getItem('pendingReservation');
        if (pendingReservation) {
          navigate('/reservation');
        } else {
          // Navigate based on user role
          const userRole = result.user.role;
          switch (userRole) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'stylist':
              navigate('/dashboard-coiffeuse');
              break;
            case 'client':
            default:
              navigate('/dashboard-client');
              break;
          }
        }
      } else {
        setError(result.error || 'Échec de la connexion');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  // Common input styling to avoid the double box effect
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: 'transparent !important',
      '& fieldset': {
        borderColor: '#e0e0e0',
        borderWidth: 1.5
      },
      '&:hover': {
        backgroundColor: 'transparent !important',
        '& fieldset': {
          borderColor: '#D4B996'
        }
      },
      '&.Mui-focused': {
        backgroundColor: 'transparent !important',
        '& fieldset': {
          borderColor: '#D4B996',
          borderWidth: 2
        }
      },
      '& input': {
        color: '#2c2c2c',
        fontWeight: 500,
        backgroundColor: 'transparent !important'
      },
      '& input:focus': {
        backgroundColor: 'transparent !important'
      },
      '& input:hover': {
        backgroundColor: 'transparent !important'
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: { xs: 10, sm: 12 }, // Account for navbar height
        pb: 4,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 3,
            background: '#ffffff',
            maxWidth: 450,
            mx: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}
        >
          {/* Header */}
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#2c2c2c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <LoginIcon sx={{ color: '#ffffff', fontSize: 32 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: '#2c2c2c',
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}
            >
              Connexion
            </Typography>
            {fromReservation && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666666',
                  mb: 2,
                  fontSize: '0.95rem'
                }}
              >
                Merci de vous connecter pour poursuivre votre réservation
              </Typography>
            )}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  color: '#d32f2f',
                  fontWeight: 500
                }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Adresse email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              autoFocus
              sx={{ ...inputSx, mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#666666' }} />
                  </InputAdornment>
                )
              }}
              InputLabelProps={{
                sx: { color: '#666666', fontWeight: 500 }
              }}
            />

            <TextField
              fullWidth
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              sx={{ ...inputSx, mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#666666' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#666666' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={{
                sx: { color: '#666666', fontWeight: 500 }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 3,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: '#2c2c2c',
                color: '#ffffff',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#1a1a1a',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(44,44,44,0.25)'
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                  color: '#999999'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>

            <Box textAlign="center" sx={{ mb: 3 }}>
              <MuiLink
                component={Link}
                to="/reset-password"
                sx={{
                  color: '#D4B996',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#B8A08A'
                  }
                }}
              >
                Mot de passe oublié ?
              </MuiLink>
            </Box>

            <Box 
              textAlign="center" 
              sx={{ 
                pt: 2, 
                borderTop: '1px solid #f0f0f0'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666666',
                  mb: 1
                }}
              >
                Pas encore de compte ?
              </Typography>
              <MuiLink
                component={Link}
                to="/register"
                sx={{
                  color: '#2c2c2c',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Créer un compte
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 