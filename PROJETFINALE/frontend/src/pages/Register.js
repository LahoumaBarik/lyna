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
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepIcon
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
  ArrowBack,
  CheckCircle,
  AutoAwesome,
  Security,
  Speed
} from '@mui/icons-material';

const steps = [
  { name: 'firstName', label: 'Prénom', type: 'text', icon: Person, description: 'Votre prénom' },
  { name: 'lastName', label: 'Nom de famille', type: 'text', icon: Person, description: 'Votre nom de famille' },
  { name: 'email', label: 'Adresse email', type: 'email', icon: Email, description: 'Votre email de connexion' },
  { name: 'password', label: 'Mot de passe', type: 'password', icon: Lock, description: 'Minimum 6 caractères' }
];

const benefits = [
  {
    icon: <Speed sx={{ fontSize: 24 }} />,
    title: "Réservation Express",
    description: "Réservez en quelques clics, 24h/24"
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 24 }} />,
    title: "Expérience Personnalisée",
    description: "Services adaptés à vos préférences"
  },
  {
    icon: <Security sx={{ fontSize: 24 }} />,
    title: "Données Sécurisées",
    description: "Vos informations sont protégées"
  }
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 50%, #F0EDE7 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 12, md: 8 },
            px: { xs: 2, md: 4 }
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: { xs: 4, lg: 8 },
              alignItems: 'center',
              maxWidth: '1200px',
              width: '100%'
            }}
          >
            {/* Left Side - Benefits (Hidden on Mobile) */}
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Fade in timeout={800}>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', lg: '3.5rem' },
                      mb: 3,
                      background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.2
                    }}
                  >
                    Rejoignez She Salon
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      mb: 6,
                      fontSize: '1.25rem',
                      lineHeight: 1.6,
                      maxWidth: '500px'
                    }}
                  >
                    Créez votre compte en quelques étapes et découvrez une expérience beauté exceptionnelle avec nos services premium.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {benefits.map((benefit, index) => (
                      <Slide direction="right" in timeout={1000 + index * 200} key={index}>
                        <Card
                          sx={{
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(139, 115, 85, 0.1)',
                            borderRadius: '16px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              boxShadow: '0 8px 24px rgba(139, 115, 85, 0.15)',
                              background: 'rgba(255, 255, 255, 0.9)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0
                              }}
                            >
                              {benefit.icon}
                            </Box>
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: 'text.primary',
                                  mb: 0.5,
                                  fontSize: '1.125rem'
                                }}
                              >
                                {benefit.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  lineHeight: 1.5
                                }}
                              >
                                {benefit.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Slide>
                    ))}
                  </Box>
                </Box>
              </Fade>
            </Box>

            {/* Right Side - Registration Form */}
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', lg: 'flex-end' } }}>
              <Slide direction="left" in timeout={600}>
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: '480px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 115, 85, 0.1)',
                    borderRadius: '24px',
                    boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
                      p: 4,
                      textAlign: 'center',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                      }
                    }}
                  >
            <Box
              sx={{
                        width: 80,
                        height: 80,
                borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
                      <PersonAdd sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                        color: 'white',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}
            >
                      Inscription
            </Typography>
                    {fromReservation ? (
                      <Chip
                        label="Réservation en cours"
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 500,
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      />
                    ) : (
              <Typography 
                variant="body1" 
                sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '1rem'
                }}
              >
                        Créez votre compte She
              </Typography>
            )}
          </Box>

                  <CardContent sx={{ p: 4 }}>
                    {/* Modern Progress Stepper */}
          <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          Étape {currentStep + 1} sur {steps.length}
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                              height: 8, 
                              borderRadius: '4px',
                              backgroundColor: 'rgba(139, 115, 85, 0.1)',
                '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                                borderRadius: '4px'
                }
              }} 
            />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {Math.round(progress)}%
                        </Typography>
                      </Box>
                      
                      {/* Step Info */}
                      <Card sx={{ 
                        p: 2, 
                        background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
                        border: '1px solid rgba(139, 115, 85, 0.1)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
              sx={{ 
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <IconComponent sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              {currentStepConfig.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                              {currentStepConfig.description}
            </Typography>
                          </Box>
                        </Box>
                      </Card>
          </Box>

          {/* Error Alert */}
          {error && (
                      <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                '& .MuiAlert-message': {
                              color: '#DC2626',
                  fontWeight: 500
                }
              }}
            >
              {error}
            </Alert>
                      </Fade>
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
                        sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                              <IconComponent sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment: currentStepConfig.type === 'password' ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                                sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ) : null
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
                              borderRadius: '50px',
                    px: 3,
                    py: 1.5,
                              borderColor: 'primary.main',
                              color: 'primary.main',
                    textTransform: 'none',
                    fontWeight: 500,
                              borderWidth: '2px',
                    '&:hover': {
                                borderColor: 'primary.dark',
                                background: 'rgba(139, 115, 85, 0.05)',
                                borderWidth: '2px'
                    }
                  }}
                >
                  Retour
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                            variant="text"
                  sx={{ 
                              borderRadius: '50px',
                    px: 3,
                    py: 1.5,
                              color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                                background: 'rgba(139, 115, 85, 0.05)'
                    }
                  }}
                >
                            Déjà inscrit ?
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                          endIcon={!loading && (isLastStep ? <CheckCircle /> : <ArrowForward />)}
                sx={{ 
                            borderRadius: '50px',
                  px: 4,
                            py: 2,
                            minWidth: 160,
                            background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                            color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                            fontSize: '1rem',
                            boxShadow: '0 8px 24px rgba(139, 115, 85, 0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                              transition: 'left 0.5s ease'
                            },
                  '&:hover': {
                              background: 'linear-gradient(135deg, #6B5842 0%, #B8941F 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 32px rgba(139, 115, 85, 0.4)',
                              '&::before': {
                                left: '100%'
                              }
                  },
                  '&:disabled': {
                              background: '#E5E0D8',
                              color: '#8A8A8A',
                              transform: 'none',
                              boxShadow: 'none'
                            }
                          }}
                        >
                          {loading ? 'Inscription...' : (isLastStep ? "Créer le compte" : 'Suivant')}
              </Button>
            </Box>

                      {/* Login Link */}
                      <Box textAlign="center" sx={{ pt: 2, borderTop: '1px solid rgba(139, 115, 85, 0.1)' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                            color: 'text.secondary',
                            mb: 2,
                            fontSize: '0.95rem'
                }}
              >
                Vous avez déjà un compte ?
              </Typography>
                        <Button
                component={Link} 
                to="/login" 
                          variant="text"
                sx={{ 
                            color: 'primary.main',
                            fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                            textTransform: 'none',
                  '&:hover': {
                              background: 'rgba(139, 115, 85, 0.05)'
                            }
                          }}
                        >
                          Se connecter
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register; 