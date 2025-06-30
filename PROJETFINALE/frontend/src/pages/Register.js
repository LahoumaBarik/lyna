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
  LinearProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  PersonAdd,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';

const steps = [
  { name: 'firstName', label: 'Prénom', type: 'text', icon: Person },
  { name: 'lastName', label: 'Nom de famille', type: 'text', icon: Person },
  { name: 'email', label: 'Adresse email', type: 'email', icon: Email },
  { name: 'password', label: 'Mot de passe', type: 'password', icon: Lock }
];

const Register = ({ setUser, fromReservation }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register: authRegister } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'client'
  });
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateCurrentStep = () => {
    const field = currentStepConfig.name;
    const value = formData[field];
    
    if (!value || value.trim() === '') {
      setError(`Le champ ${currentStepConfig.label} est requis.`);
      return false;
    }
    
    if (field === 'password' && value.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return false;
    }
    
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Veuillez entrer une adresse email valide.');
      return false;
    }
    
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateCurrentStep()) return;
    
    if (isLastStep) {
      handleSubmit(e);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authRegister({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        role: 'client'
      });
      
      // Check if registration was successful
      if (result.success) {
        if (result.autoLogin && result.user) {
          // User was automatically logged in, navigate to appropriate dashboard
          const userRole = result.user.role;
          
          // Check for pending reservation first
          const pendingReservation = localStorage.getItem('pendingReservation');
          if (pendingReservation) {
            navigate('/reservation');
          } else {
            // Navigate based on user role
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
          // Auto-login failed, redirect to login page
          navigate('/login');
        }
      } else {
        // Registration failed, show error
        setError(result.error || 'Une erreur est survenue lors de l\'inscription.');
      }

    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = currentStepConfig.icon;

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
              <PersonAdd sx={{ color: '#ffffff', fontSize: 32 }} />
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
              Créer un compte
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
                Créez votre compte pour finaliser votre réservation
              </Typography>
            )}
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 4 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#D4B996',
                  borderRadius: 3
                }
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                color: '#666666',
                fontWeight: 500
              }}
            >
              Étape {currentStep + 1} sur {steps.length}: {currentStepConfig.label}
            </Typography>
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
          <Box component="form" onSubmit={handleNext}>
            <TextField
              fullWidth
              label={currentStepConfig.label}
              name={currentStepConfig.name}
              type={currentStepConfig.type === 'password' && showPassword ? 'text' : currentStepConfig.type}
              value={formData[currentStepConfig.name]}
              onChange={handleChange}
              required
              autoFocus
              sx={{ ...inputSx, mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconComponent sx={{ color: '#666666' }} />
                  </InputAdornment>
                ),
                endAdornment: currentStepConfig.type === 'password' ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#666666' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              InputLabelProps={{
                sx: { color: '#666666', fontWeight: 500 }
              }}
            />

            {/* Navigation Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: 2,
              mb: 3
            }}>
              {currentStep > 0 ? (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    borderColor: '#e0e0e0',
                    color: '#666666',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#D4B996',
                      backgroundColor: 'rgba(212, 185, 150, 0.04)'
                    }
                  }}
                >
                  Retour
                </Button>
              ) : (
                <Button
                  variant="text"
                  component={Link}
                  to="/login"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    color: '#666666',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  Connexion
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={isLastStep ? <PersonAdd /> : <ArrowForward />}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  minWidth: 140,
                  backgroundColor: '#2c2c2c',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 600,
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
                {loading ? 'Inscription...' : (isLastStep ? "S'inscrire" : 'Suivant')}
              </Button>
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
                Vous avez déjà un compte ?
              </Typography>
              <MuiLink 
                component={Link} 
                to="/login" 
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
                Connectez-vous
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 