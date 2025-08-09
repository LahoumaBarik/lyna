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
  useTheme,
  Fade,
  Slide,
  Grow
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
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authRegister(formData);
      
      if (result.success) {
        // Check for pending reservation
        const pendingReservation = localStorage.getItem('pendingReservation');
        if (pendingReservation) {
          navigate('/reservation');
        } else {
          navigate('/dashboard-client');
        }
      } else {
        setError(result.error || 'Échec de l\'inscription');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
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
                Créer un compte
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6B6B6B',
                  fontSize: '1.1rem'
                }}
              >
                Rejoignez la communauté She
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(212, 185, 150, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #D4B996 0%, #B8A08A 100%)',
                  }
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: 1,
                  color: '#6B6B6B',
                  fontWeight: 500
                }}
              >
                Étape {currentStep + 1} sur {steps.length}
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

            {/* Registration Form */}
            <Box component="form" onSubmit={handleNext} sx={{ mt: 2 }}>
              <Grow in timeout={500}>
                <TextField
                  fullWidth
                  label={currentStepConfig.label}
                  name={currentStepConfig.name}
                  type={currentStepConfig.name === 'password' ? (showPassword ? 'text' : 'password') : currentStepConfig.type}
                  value={formData[currentStepConfig.name]}
                  onChange={handleChange}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {React.createElement(currentStepConfig.icon, { sx: { color: '#D4B996' } })}
                      </InputAdornment>
                    ),
                    endAdornment: currentStepConfig.name === 'password' ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#D4B996' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ) : null,
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
              </Grow>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                {currentStep > 0 && (
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: '16px',
                      borderColor: '#D4B996',
                      color: '#2C2C2C',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#B8A08A',
                        backgroundColor: 'rgba(212, 185, 150, 0.08)',
                      }
                    }}
                  >
                    <ArrowBack sx={{ mr: 1 }} />
                    Précédent
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    flex: 1,
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
                  {loading ? 'Inscription...' : (isLastStep ? 'S\'inscrire' : 'Suivant')}
                  {!isLastStep && <ArrowForward sx={{ ml: 1 }} />}
                </Button>
              </Box>
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(212, 185, 150, 0.2)' }}>
              <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
                Déjà un compte ?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
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
                  Se connecter
                </MuiLink>
              </Typography>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Register; 