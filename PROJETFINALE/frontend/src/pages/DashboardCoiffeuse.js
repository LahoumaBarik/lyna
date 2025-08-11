import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  Schedule,
  Person,
  CalendarToday,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  Warning,
  Info,
  Work,
  Star,
  Email,
  Phone,
  LocationOn,
  Dashboard,
  TrendingUp,
  AutoAwesome,
  AccessTime,
  EventNote,
  Verified
} from '@mui/icons-material';
import WeeklyCalendar from '../components/WeeklyCalendar';
import axios from 'axios';

function DashboardCoiffeuse() {
  const { user, socket } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  
  // Profile
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    description: '',
    specializations: [],
    experience: { years: '', description: '' }
  });

  // Stats
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchStats();
      initializeProfileForm();
    }
  }, [user]);

  // Real-time reservations updates for stylist
  useEffect(() => {
    if (!socket) return;
    const onReservationsChanged = () => {
      fetchAppointments();
      fetchStats();
    };
    const onAvailabilityChanged = () => {
      // WeeklyCalendar will refetch on prop/state change via its own hooks
    };
    socket.on('reservations_changed', onReservationsChanged);
    socket.on('availability_changed', onAvailabilityChanged);
    return () => {
      socket.off('reservations_changed', onReservationsChanged);
      socket.off('availability_changed', onAvailabilityChanged);
    };
  }, [socket]);

  const initializeProfileForm = () => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        description: user.stylistInfo?.description || '',
        specializations: user.stylistInfo?.specializations || [],
        experience: {
          years: user.stylistInfo?.experience?.years || '',
          description: user.stylistInfo?.experience?.description || ''
        }
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/reservations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = response.data;
      // Handle both array response (no pagination) and object response (with pagination)
      const reservations = Array.isArray(data) ? data : (data.reservations || []);
      setAppointments(reservations);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/analytics/stylist-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        const data = response.data;
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.put('/users/me', {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        stylistInfo: {
          description: profileForm.description,
          specializations: profileForm.specializations,
          experience: profileForm.experience
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const result = response.data;
      setSuccess('Profil mis à jour avec succès');
      setProfileDialogOpen(false);
      
      // Update the user context with new data
      if (result.user) {
        // You might want to update the auth context here if you have a way to refresh user data
        console.log('Profile updated successfully:', result.user);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (appointmentDate < now) {
      return { status: 'completed', label: 'Terminé', color: 'success' };
    } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: 'upcoming', label: 'Aujourd\'hui', color: 'warning' };
    } else {
      return { status: 'scheduled', label: 'Programmé', color: 'info' };
    }
  };

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
        {/* Modern Header */}
        <Fade in timeout={600}>
          <Card
            sx={{
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
              color: 'white',
              mb: 6,
              overflow: 'hidden',
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
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '2rem',
                        fontWeight: 700
                      }}
                    >
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                        Bonjour, {user?.firstName} !
                      </Typography>
                      <Chip
                        icon={<Verified />}
                        label="Styliste Professionnel"
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          fontWeight: 600,
                          mb: 1
                        }}
                      />
                      <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                        Gérez vos rendez-vous et votre agenda professionnel
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => setProfileDialogOpen(true)}
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
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Alerts */}
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

        {/* Modern Stats Cards */}
        <Slide direction="up" in timeout={800}>
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 115, 85, 0.1)',
                  boxShadow: '0 12px 24px rgba(44, 44, 44, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CalendarToday sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {stats.totalAppointments}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Total Rendez-vous
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 115, 85, 0.1)',
                  boxShadow: '0 12px 24px rgba(44, 44, 44, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CheckCircle sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {stats.completedAppointments}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Terminés
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 115, 85, 0.1)',
                  boxShadow: '0 12px 24px rgba(44, 44, 44, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AccessTime sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {stats.upcomingAppointments}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        À venir
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 115, 85, 0.1)',
                  boxShadow: '0 12px 24px rgba(44, 44, 44, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Star sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        {stats.averageRating.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Note moyenne
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>

      <Grid container spacing={3}>
        {/* Weekly Calendar */}
        <Grid item xs={12}>
          <WeeklyCalendar user={user} />
        </Grid>

        {/* Appointments */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 3 }}>
              <CalendarToday sx={{ mr: 1, color: '#D4B996' }} />
              Rendez-vous à venir
            </Typography>

            {appointmentsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : appointments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                Aucun rendez-vous à venir
              </Typography>
            ) : (
              <List>
                {appointments.slice(0, 5).map((appointment) => {
                  const status = getAppointmentStatus(appointment);
                  return (
                    <ListItem key={appointment._id} divider>
                      <ListItemIcon>
                        <CalendarToday color={status.color} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${appointment.client?.firstName} ${appointment.client?.lastName}`}
                        secondary={
                          <>
                            {appointment.service?.name} - {formatDate(appointment.date)} à {appointment.startTime || appointment.heure || 'N/A'}
                          </>
                        }
                      />
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Profile Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                <Person sx={{ mr: 1, color: '#D4B996' }} />
                Mon profil
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setProfileDialogOpen(true)}
                sx={{ borderColor: '#D4B996', color: '#D4B996' }}
              >
                Modifier
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nom complet"
                      secondary={`${user?.firstName} ${user?.lastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user?.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="Téléphone"
                      secondary={user?.phone || 'Non fourni'}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary="Expérience"
                      secondary={`${user?.stylistInfo?.experience?.years || 0} ans`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Star />
                    </ListItemIcon>
                    <ListItemText
                      primary="Spécialisations"
                      secondary={user?.stylistInfo?.specializations?.join(', ') || 'Aucune'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info />
                    </ListItemIcon>
                    <ListItemText
                      primary="Description"
                      secondary={user?.stylistInfo?.description || 'Aucune description'}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifier mon profil</DialogTitle>
        <form onSubmit={handleProfileSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={profileForm.description}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                  helperText="Décrivez votre style et expertise"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Années d'expérience"
                  value={profileForm.experience.years}
                  onChange={(e) => setProfileForm(prev => ({ 
                    ...prev, 
                    experience: { ...prev.experience, years: e.target.value }
                  }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProfileDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Sauvegarder'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      </Container>
    </Box>
  );
}

export default DashboardCoiffeuse; 