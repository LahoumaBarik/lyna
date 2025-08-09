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
  Fade,
  Slide,
  Grow
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
  Description
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
        background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 100%)'
      }}>
        <Typography variant="h6">Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 100%)',
        pt: { xs: 10, sm: 12 },
        pb: 4
      }}
    >
      <Container maxWidth="md">
        {/* Success/Error Alerts */}
        {success && (
          <Fade in timeout={300}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: '12px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                color: '#2e7d32',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          </Fade>
        )}
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
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Header */}
        <Slide direction="down" in timeout={800}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate(getDashboardRoute())}
              sx={{
                color: '#D4B996',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212, 185, 150, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(212, 185, 150, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2C2C2C',
                letterSpacing: '-0.02em'
              }}
            >
              Mon Profil
            </Typography>
          </Box>
        </Slide>

        <Grow in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 8px 32px rgba(44, 44, 44, 0.08)'
            }}
          >
            {/* Profile Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  fontSize: '2rem',
                  fontWeight: 600,
                  mr: 3,
                  boxShadow: '0px 4px 12px rgba(212, 185, 150, 0.3)'
                }}
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 1 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B6B6B', mb: 1, fontWeight: 500 }}>
                  {getRoleName(user.role)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8A857C' }}>
                  Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </Typography>
              </Box>
              {!isEditing && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                    color: '#2C2C2C',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0px 8px 32px rgba(166, 124, 82, 0.18)',
                    }
                  }}
                >
                  Modifier
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'rgba(212, 185, 150, 0.3)' }} />

            {/* Profile Form */}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': {
                          borderColor: 'rgba(212, 185, 150, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#D4B996',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#B8A08A',
                          borderWidth: '2px'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(248, 246, 242, 0.5)',
                          '& fieldset': {
                            borderColor: 'rgba(212, 185, 150, 0.2)',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': {
                          borderColor: 'rgba(212, 185, 150, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#D4B996',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#B8A08A',
                          borderWidth: '2px'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(248, 246, 242, 0.5)',
                          '& fieldset': {
                            borderColor: 'rgba(212, 185, 150, 0.2)',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': {
                          borderColor: 'rgba(212, 185, 150, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#D4B996',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#B8A08A',
                          borderWidth: '2px'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(248, 246, 242, 0.5)',
                          '& fieldset': {
                            borderColor: 'rgba(212, 185, 150, 0.2)',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': {
                          borderColor: 'rgba(212, 185, 150, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#D4B996',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#B8A08A',
                          borderWidth: '2px'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(248, 246, 242, 0.5)',
                          '& fieldset': {
                            borderColor: 'rgba(212, 185, 150, 0.2)',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': {
                          borderColor: 'rgba(212, 185, 150, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#D4B996',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#B8A08A',
                          borderWidth: '2px'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(248, 246, 242, 0.5)',
                          '& fieldset': {
                            borderColor: 'rgba(212, 185, 150, 0.2)',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': {
                          borderColor: 'rgba(212, 185, 150, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#D4B996',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#B8A08A',
                          borderWidth: '2px'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(248, 246, 242, 0.5)',
                          '& fieldset': {
                            borderColor: 'rgba(212, 185, 150, 0.2)',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Action Buttons */}
              {isEditing && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      borderColor: '#D4B996',
                      color: '#2C2C2C',
                      fontWeight: 600,
                      borderRadius: '12px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#B8A08A',
                        backgroundColor: 'rgba(212, 185, 150, 0.08)',
                      }
                    }}
                  >
                    <Cancel sx={{ mr: 1 }} />
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                      color: '#2C2C2C',
                      fontWeight: 600,
                      borderRadius: '12px',
                      textTransform: 'none',
                      boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0px 8px 32px rgba(166, 124, 82, 0.18)',
                      }
                    }}
                  >
                    <Save sx={{ mr: 1 }} />
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </Box>
              )}
            </form>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
}

export default Profile; 