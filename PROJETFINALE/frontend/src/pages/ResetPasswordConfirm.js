import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Check
} from '@mui/icons-material';

export default function ResetPasswordConfirm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la réinitialisation.');
      }
      
      setSuccess('Mot de passe réinitialisé ! Vous pouvez vous connecter.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pt: { xs: 10, sm: 12 },
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
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              textAlign: 'center'
            }}
          >
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Lien invalide ou expiré.
            </Alert>
            <Box sx={{ mt: 3 }}>
              <MuiLink
                component={Link}
                to="/reset-password"
                sx={{
                  color: '#2c2c2c',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <ArrowBack sx={{ fontSize: '1rem' }} />
                Demander un nouveau lien
              </MuiLink>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

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
              <Lock sx={{ color: '#ffffff', fontSize: 32 }} />
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
              Nouveau mot de passe
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666666',
                mb: 2,
                fontSize: '0.95rem'
              }}
            >
              Choisissez un nouveau mot de passe sécurisé
            </Typography>
          </Box>

          {/* Success Alert */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  color: '#2e7d32',
                  fontWeight: 500
                }
              }}
            >
              {success}
            </Alert>
          )}

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
          <Box component="form" onSubmit={handleSubmit} autoComplete="off">
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              autoFocus
              sx={{ mb: 4 }}
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
              sx={{
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
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={<Check />}
              sx={{
                py: 1.5,
                mb: 4,
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
              {loading ? 'Validation en cours...' : 'Valider le nouveau mot de passe'}
            </Button>

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
                  mb: 2
                }}
              >
                Mot de passe oublié à nouveau ?
              </Typography>
              <MuiLink
                component={Link}
                to="/reset-password"
                sx={{
                  color: '#2c2c2c',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <ArrowBack sx={{ fontSize: '1rem' }} />
                Demander un nouveau lien
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 