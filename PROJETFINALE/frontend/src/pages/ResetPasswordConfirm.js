import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Check
} from '@mui/icons-material';
import {
  useMediaQuery,
  useTheme
} from '@mui/material';

function ResetPasswordConfirm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password/confirm`, {
        token,
        password
      });
      
      if (response.status === 200) {
        setSuccess('Mot de passe réinitialisé avec succès ! Redirection...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
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
              {/* MuiLink component was removed, so this part is removed */}
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
                mb: 4,
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
              {/* MuiLink component was removed, so this part is removed */}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPasswordConfirm; 