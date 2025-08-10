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
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ArrowForward,
  AutoAwesome,
  Security,
  Speed
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

  const features = [
    {
      icon: <Speed sx={{ fontSize: 24 }} />,
      title: "Connexion Rapide",
      description: "Accès instantané à votre espace personnel"
    },
    {
      icon: <Security sx={{ fontSize: 24 }} />,
      title: "100% Sécurisé",
      description: "Vos données sont protégées et cryptées"
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 24 }} />,
      title: "Expérience Premium",
      description: "Interface moderne et intuitive"
    }
  ];

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
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%238B7355" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
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
            {/* Left Side - Features (Hidden on Mobile) */}
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
                    Bienvenue dans votre espace She
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
                    Accédez à votre compte pour gérer vos rendez-vous, découvrir nos services premium et profiter d'une expérience beauté personnalisée.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {features.map((feature, index) => (
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
                                background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0
                              }}
                            >
                              {feature.icon}
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
                                {feature.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  lineHeight: 1.5
                                }}
                              >
                                {feature.description}
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

            {/* Right Side - Login Form */}
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
                      background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
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
                      <LoginIcon sx={{ color: 'white', fontSize: 40 }} />
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
                      Connexion
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
                        Accédez à votre espace personnel
                      </Typography>
                    )}
                  </Box>

                  <CardContent sx={{ p: 4 }}>
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
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: 'primary.main' }} />
                            </InputAdornment>
                          )
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
                        sx={{ mb: 4 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: 'primary.main' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: 'text.secondary' }}
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
                        disabled={loading}
                        endIcon={!loading && <ArrowForward />}
                        sx={{
                          py: 2,
                          mb: 3,
                          borderRadius: '50px',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                          color: 'white',
                          textTransform: 'none',
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
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                      </Button>

                      <Box textAlign="center" sx={{ mb: 3 }}>
                        <MuiLink
                          component={Link}
                          to="/reset-password"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: 'primary.dark'
                            }
                          }}
                        >
                          Mot de passe oublié ?
                        </MuiLink>
                      </Box>

                      <Divider sx={{ mb: 3, opacity: 0.3 }} />

                      <Box textAlign="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            mb: 2,
                            fontSize: '0.95rem'
                          }}
                        >
                          Pas encore de compte ?
                        </Typography>
                        <Button
                          component={Link}
                          to="/register"
                          variant="outlined"
                          fullWidth
                          sx={{
                            py: 1.5,
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: 500,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            textTransform: 'none',
                            borderWidth: '2px',
                            '&:hover': {
                              borderColor: 'primary.dark',
                              background: 'rgba(139, 115, 85, 0.05)',
                              borderWidth: '2px',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          Créer un compte
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

export default Login; 