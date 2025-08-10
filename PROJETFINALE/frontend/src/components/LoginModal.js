import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
  Fade,
  Slide,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function LoginModal({ onAuthSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData);
      if (onAuthSuccess) onAuthSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Slide direction="up" in={true} timeout={500}>
      <Paper
        elevation={24}
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          maxWidth: 400,
          width: '100%'
        }}
      >
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5A3C, #B78C68)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 25px rgba(139, 90, 60, 0.3)'
                }}
              >
                <LoginIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: '#1A1A1A',
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                Connexion
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  mt: 1
                }}
              >
                Accédez à votre espace personnel
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Slide direction="down" in={!!error} timeout={300}>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#F44336'
                    }
                  }}
                >
                  {error}
                </Alert>
              </Slide>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Adresse email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
                size="large"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#B78C68',
                      borderWidth: '2px'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8B5A3C',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666',
                    '&.Mui-focused': {
                      color: '#8B5A3C'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#8B5A3C' }} />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                variant="outlined"
                size="large"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#B78C68',
                      borderWidth: '2px'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8B5A3C',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666',
                    '&.Mui-focused': {
                      color: '#8B5A3C'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#8B5A3C' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{ color: '#8B5A3C' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #8B5A3C, #B78C68)',
                  color: 'white',
                  fontWeight: 700,
                  padding: '14px 24px',
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(139, 90, 60, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(139, 90, 60, 0.4)',
                    background: 'linear-gradient(135deg, #B78C68, #8B5A3C)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Se connecter'
                )}
              </Button>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: '#999', px: 2 }}>
                ou
              </Typography>
            </Divider>

            {/* Links */}
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink
                component={Link}
                to="/register"
                sx={{
                  display: 'block',
                  mb: 2,
                  color: '#8B5A3C',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#B78C68',
                    textDecoration: 'underline'
                  }
                }}
              >
                Créer un nouveau compte
              </MuiLink>
              
              <MuiLink
                component={Link}
                to="/reset-password"
                sx={{
                  display: 'block',
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#8B5A3C',
                    textDecoration: 'underline'
                  }
                }}
              >
                Mot de passe oublié ?
              </MuiLink>
            </Box>
          </Box>
        </Fade>
      </Paper>
    </Slide>
  );
}

export default LoginModal; 