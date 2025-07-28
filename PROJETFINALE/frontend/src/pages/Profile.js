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
  IconButton
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  AccountCircle,
  ArrowBack
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
        background: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 100%)',
        pt: { xs: 10, sm: 12 },
        pb: 4
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate(getDashboardRoute())}
            sx={{ color: '#2c2c2c' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2c2c2c'
            }}
          >
            Mon Profil
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            background: '#ffffff'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#D4B996',
                fontSize: '2rem',
                fontWeight: 600,
                mr: 3
              }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 1 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666666', mb: 1 }}>
                {getRoleName(user.role)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888888' }}>
                Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                sx={{
                  borderColor: '#D4B996',
                  color: '#D4B996',
                  '&:hover': {
                    borderColor: '#c4a985',
                    backgroundColor: 'rgba(212, 185, 150, 0.1)'
                  }
                }}
              >
                Modifier
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AccountCircle sx={{ mr: 1, color: '#D4B996' }} />
                  Informations personnelles
                </Typography>
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
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1, color: '#D4B996' }} />
                  Informations de contact
                </Typography>
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
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: '#D4B996' }} />
                  {user.role === 'stylist' ? 'Description professionnelle' : 'Notes personnelles'}
                </Typography>
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
                />
              </Grid>

              {isEditing && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{
                        borderColor: '#cccccc',
                        color: '#666666',
                        '&:hover': {
                          borderColor: '#999999',
                          backgroundColor: 'rgba(0,0,0,0.04)'
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
                        bgcolor: '#D4B996',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#c4a985' },
                        '&:disabled': { bgcolor: '#cccccc', color: '#888888' }
                      }}
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Profile; 