import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function ResetPassword() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { email });
      
      if (response.status === 200) {
        setSuccess('Un email de réinitialisation a été envoyé à votre adresse email.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setLoading(false);
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
              <Send sx={{ color: '#ffffff', fontSize: 32 }} />
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
              Mot de passe oublié
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666666',
                mb: 2,
                fontSize: '0.95rem'
              }}
            >
              Entrez votre email pour recevoir un lien de réinitialisation
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
              label="Adresse email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              sx={{ mb: 4 }}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Envoyer le lien'}
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
                Vous vous souvenez de votre mot de passe ?
              </Typography>
              <MuiLink
                component={Link}
                to="/login"
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
                Retour à la connexion
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 