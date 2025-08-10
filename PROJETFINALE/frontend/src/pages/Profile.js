import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Divider,
  IconButton,
  Card,
  CardContent,
  Fade,
  Slide,
  Chip
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  AccountCircle,
  ArrowBack,
  Phone,
  LocationOn,
  Description,
  Verified,
  AutoAwesome
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address?.street || user.address || '',
        description: user.stylistInfo?.description || user.clientInfo?.notes || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address?.street || user.address || '',
        description: user.stylistInfo?.description || user.clientInfo?.notes || ''
      });
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'client': return 'Client';
      case 'stylist': return 'Styliste';
      case 'admin': return 'Administrateur';
      default: return 'Utilisateur';
    }
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'client': return '/dashboard-client';
      case 'stylist': return '/dashboard-coiffeuse';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 100%)'
      }}>
        <Typography variant="h6">Chargement...</Typography>
      </Box>
    );
  }

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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: 12, sm: 14 }, pb: 6 }}>
        {/* Header with Back Button */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate(getDashboardRoute())}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 115, 85, 0.1)',
                color: 'primary.main',
                '&:hover': {
                  background: 'rgba(139, 115, 85, 0.1)',
                  transform: 'translateX(-2px)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Mon Profil
            </Typography>
          </Box>
        </Fade>

        {/* Alerts */}
        {success && (
          <Fade in>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 4, 
                borderRadius: '12px',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                '& .MuiAlert-message': {
                  color: '#2E7D32',
                  fontWeight: 500
                }
              }} 
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          </Fade>
        )}
        {error && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                '& .MuiAlert-message': {
                  color: '#DC2626',
                  fontWeight: 500
                }
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Profile Card */}
        <Slide direction="up" in timeout={800}>
          <Card
            sx={{
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
              boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)',
              overflow: 'hidden'
            }}
          >
            {/* Profile Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                color: 'white',
                p: { xs: 4, md: 6 },
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
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '2.5rem',
                        fontWeight: 700
                      }}
                    >
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Chip
                        icon={<Verified />}
                        label={getRoleName(user.role)}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          fontWeight: 600,
                          mb: 1
                        }}
                      />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  {!isEditing && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.3)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Modifier le profil
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>

            {/* Profile Content */}
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  {/* Personal Information Section */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        p: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.1) 0%, rgba(212, 175, 151, 0.1) 100%)',
                        border: '1px solid rgba(139, 115, 85, 0.1)'
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <AccountCircle sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Informations personnelles
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="firstName"
                      label="Prénom"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      required
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: 'primary.main', mr: 1 }} />
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="lastName"
                      label="Nom de famille"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      required
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: 'primary.main', mr: 1 }} />
                        )
                      }}
                    />
                  </Grid>

                  {/* Contact Information Section */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        mt: 4,
                        p: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.1) 0%, rgba(212, 175, 151, 0.1) 100%)',
                        border: '1px solid rgba(139, 115, 85, 0.1)'
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Email sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Informations de contact
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      required
                      InputProps={{
                        startAdornment: (
                          <Email sx={{ color: 'primary.main', mr: 1 }} />
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Téléphone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: 'primary.main', mr: 1 }} />
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="address"
                      label="Adresse"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <LocationOn sx={{ color: 'primary.main', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                        )
                      }}
                    />
                  </Grid>

                  {/* Additional Information Section */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        mt: 4,
                        p: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.1) 0%, rgba(212, 175, 151, 0.1) 100%)',
                        border: '1px solid rgba(139, 115, 85, 0.1)'
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Description sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {user.role === 'stylist' ? 'Description professionnelle' : 'Notes personnelles'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="description"
                      label={user.role === 'stylist' ? 'Description de vos services' : 'Notes personnelles'}
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      multiline
                      rows={4}
                      placeholder={user.role === 'stylist' ? 
                        'Décrivez votre expérience, vos spécialités...' : 
                        'Allergies, préférences, notes importantes...'
                      }
                      InputProps={{
                        startAdornment: (
                          <Description sx={{ color: 'primary.main', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                        )
                      }}
                    />
                  </Grid>

                  {/* Action Buttons */}
                  {isEditing && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                          disabled={loading}
                          sx={{
                            borderColor: 'grey.300',
                            color: 'text.secondary',
                            '&:hover': {
                              borderColor: 'grey.400',
                              backgroundColor: 'grey.50'
                            }
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={loading}
                          sx={{
                            background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                            color: 'white',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)'
                            },
                            '&:disabled': {
                              background: 'grey.300',
                              color: 'grey.500',
                              transform: 'none',
                              boxShadow: 'none'
                            }
                          }}
                        >
                          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Container>
    </Box>
  );
}

export default Profile; 