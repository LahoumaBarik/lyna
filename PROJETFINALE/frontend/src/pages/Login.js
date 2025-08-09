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
  useTheme,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ArrowBack
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #D4B996 0%, #F5E6D3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Slide direction="up" in timeout={800}>
          <Paper
            elevation={24}
            className="fade-in"
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0px 20px 40px rgba(44, 44, 44, 0.15)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #D4B996 0%, #B8A08A 100%)',
              }
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#2C2C2C',
                  marginBottom: 1,
                  letterSpacing: '-0.02em'
                }}
              >
                Connexion
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6B6B6B',
                  fontSize: '1.1rem'
                }}
              >
                Connectez-vous à votre compte She
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in timeout={300}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    color: '#d32f2f',
                    border: '1px solid rgba(244, 67, 54, 0.2)'
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#D4B996' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& fieldset': {
                      borderColor: 'rgba(212, 185, 150, 0.3)',
                      borderWidth: '1.5px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#D4B996',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#B8A08A',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6B6B6B',
                    '&.Mui-focused': {
                      color: '#B8A08A'
                    }
                  }
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
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#D4B996' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#D4B996' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& fieldset': {
                      borderColor: 'rgba(212, 185, 150, 0.3)',
                      borderWidth: '1.5px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#D4B996',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#B8A08A',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6B6B6B',
                    '&.Mui-focused': {
                      color: '#B8A08A'
                    }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  color: '#2C2C2C',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0px 8px 32px rgba(166, 124, 82, 0.18)',
                  },
                  '&:disabled': {
                    background: 'rgba(212, 185, 150, 0.3)',
                    color: 'rgba(44, 44, 44, 0.5)'
                  }
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>

              {/* Links */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <MuiLink
                  component={Link}
                  to="/reset-password"
                  sx={{
                    color: '#D4B996',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#B8A08A',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Mot de passe oublié ?
                </MuiLink>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
                  Pas encore de compte ?{' '}
                  <MuiLink
                    component={Link}
                    to="/register"
                    sx={{
                      color: '#D4B996',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#B8A08A',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    S'inscrire
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Login; 