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
  Fade,
  Slide,
  Grow,
  Avatar
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
  AccessTime,
  ContentCut
} from '@mui/icons-material';
import WeeklyCalendar from '../components/WeeklyCalendar';
import axios from 'axios';

function DashboardCoiffeuse() {
  const { user } = useAuth();
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

  const initializeProfileForm = () => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        description: user.stylistInfo?.description || '',
        specializations: user.stylistInfo?.specializations || [],
        experience: user.stylistInfo?.experience || { years: '', description: '' }
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/reservations/stylist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/analytics/stylist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data || response.data || {
        totalAppointments: 0,
        completedAppointments: 0,
        upcomingAppointments: 0,
        averageRating: 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put('/users/profile', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
      setSuccess('Profil mis à jour avec succès');
      setProfileDialogOpen(false);
        // Refresh user data if needed
      } else {
        setError(response.data.error || 'Erreur lors de la mise à jour du profil');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (appointmentDate < now) {
      return { status: 'completed', label: 'Terminé', color: '#4caf50' };
    } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: 'upcoming', label: 'Aujourd\'hui', color: '#ff9800' };
    } else {
      return { status: 'scheduled', label: 'Programmé', color: '#2196f3' };
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FDFCFA 0%, #F8F6F2 100%)',
        pt: { xs: 10, sm: 12 },
        pb: 4
      }}
    >
      <Container maxWidth="lg">
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
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 246, 242, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              textAlign: 'center',
              boxShadow: '0px 8px 32px rgba(44, 44, 44, 0.08)'
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                fontSize: '2rem',
                fontWeight: 600,
                boxShadow: '0px 4px 12px rgba(212, 185, 150, 0.3)'
              }}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#2C2C2C',
                mb: 1,
                letterSpacing: '-0.02em'
              }}
            >
              Bienvenue, {user?.firstName} !
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#6B6B6B',
                fontWeight: 400,
                fontSize: '1.1rem'
              }}
            >
              Tableau de bord Coiffeuse
            </Typography>
          </Paper>
        </Slide>

      {/* Stats Cards */}
        <Grow in timeout={1000}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 185, 150, 0.2)',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                        mr: 2
                      }}
                    >
                      <CalendarToday sx={{ color: '#2C2C2C', fontSize: 24 }} />
                    </Box>
                <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
                        {stats.totalAppointments}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                    Total Rendez-vous
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 185, 150, 0.2)',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                        mr: 2
                      }}
                    >
                      <CheckCircle sx={{ color: '#FFFFFF', fontSize: 24 }} />
                    </Box>
                <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
                        {stats.completedAppointments}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                    Terminés
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 185, 150, 0.2)',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        mr: 2
                      }}
                    >
                      <Schedule sx={{ color: '#FFFFFF', fontSize: 24 }} />
                    </Box>
                <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
                        {stats.upcomingAppointments}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                    À venir
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 185, 150, 0.2)',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
                        mr: 2
                      }}
                    >
                      <Star sx={{ color: '#2C2C2C', fontSize: 24 }} />
                    </Box>
                <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
                        {stats.averageRating.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                    Note moyenne
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </Grow>

      <Grid container spacing={3}>
        {/* Weekly Calendar */}
        <Grid item xs={12}>
            <Grow in timeout={1200}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 185, 150, 0.2)',
                  overflow: 'hidden',
                  p: 3,
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
                  <CalendarToday sx={{ mr: 1, color: '#D4B996' }} />
                  Calendrier Hebdomadaire
                </Typography>
          <WeeklyCalendar user={user} />
              </Paper>
            </Grow>
        </Grid>

        {/* Appointments */}
        <Grid item xs={12} md={6}>
            <Grow in timeout={1400}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 185, 150, 0.2)',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
              <CalendarToday sx={{ mr: 1, color: '#D4B996' }} />
              Rendez-vous à venir
            </Typography>

            {appointmentsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress sx={{ color: '#D4B996' }} />
              </Box>
            ) : appointments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#6B6B6B', mb: 1 }}>
                Aucun rendez-vous à venir
              </Typography>
                    <Typography variant="body1" sx={{ color: '#8A857C' }}>
                      Votre planning est libre pour le moment
                    </Typography>
                  </Box>
            ) : (
              <List>
                    {appointments.slice(0, 5).map((appointment, index) => {
                  const status = getAppointmentStatus(appointment);
                  return (
                        <Grow in timeout={800 + index * 200} key={appointment._id}>
                          <ListItem 
                            divider
                            sx={{
                              borderRadius: '12px',
                              mb: 1,
                              background: 'rgba(248, 246, 242, 0.5)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                background: 'rgba(248, 246, 242, 0.8)',
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                      <ListItemIcon>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: '8px',
                                  background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}80 100%)`
                                }}
                              >
                                <CalendarToday sx={{ color: '#FFFFFF', fontSize: 20 }} />
                              </Box>
                      </ListItemIcon>
                      <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                                  {appointment.client?.firstName} {appointment.client?.lastName}
                                </Typography>
                              }
                        secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <ContentCut sx={{ color: '#D4B996', fontSize: 16 }} />
                                  <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
                            {appointment.service?.name} - {formatDate(appointment.date)} à {appointment.startTime || appointment.heure || 'N/A'}
                                  </Typography>
                                </Box>
                        }
                      />
                      <Chip
                        label={status.label}
                              sx={{
                                backgroundColor: status.color,
                                color: '#FFFFFF',
                                fontWeight: 600,
                                borderRadius: '8px'
                              }}
                        size="small"
                      />
                    </ListItem>
                        </Grow>
                  );
                })}
              </List>
            )}
          </Paper>
            </Grow>
        </Grid>

        {/* Profile Section */}
        <Grid item xs={12} md={6}>
            <Grow in timeout={1600}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(212, 185, 150, 0.2)',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
                }}
              >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                <Person sx={{ mr: 1, color: '#D4B996' }} />
                Mon profil
              </Typography>
              <Button
                    variant="contained"
                onClick={() => setProfileDialogOpen(true)}
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
                    <Edit sx={{ mr: 1 }} />
                Modifier
              </Button>
            </Box>

                <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '12px', mb: 2 }}>
                      <Person sx={{ mr: 1, color: '#D4B996' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                          Nom complet
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2C2C2C', fontWeight: 600 }}>
                          {user?.firstName} {user?.lastName}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '12px', mb: 2 }}>
                      <Email sx={{ mr: 1, color: '#D4B996' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2C2C2C', fontWeight: 600 }}>
                          {user?.email}
                        </Typography>
                      </Box>
                    </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '12px', mb: 2 }}>
                      <Phone sx={{ mr: 1, color: '#D4B996' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                          Téléphone
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2C2C2C', fontWeight: 600 }}>
                          {user?.phone || 'Non fourni'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '12px', mb: 2 }}>
                      <Work sx={{ mr: 1, color: '#D4B996' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                          Spécialisations
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2C2C2C', fontWeight: 600 }}>
                          {user?.stylistInfo?.specializations?.join(', ') || 'Aucune'}
                        </Typography>
                      </Box>
                    </Box>
              </Grid>
            </Grid>
          </Paper>
            </Grow>
        </Grid>
      </Grid>

      {/* Profile Dialog */}
        <Dialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 8px 32px rgba(44, 44, 44, 0.15)'
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
              Modifier mon profil
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleProfileSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                    name="firstName"
                  value={profileForm.firstName}
                    onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
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
                  value={profileForm.lastName}
                    onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
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
                        }
                      }
                    }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Téléphone"
                    name="phone"
                  value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
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
                        }
                      }
                    }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                    rows={4}
                  label="Description"
                    name="description"
                  value={profileForm.description}
                    onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
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
                        }
                      }
                    }}
                />
              </Grid>
            </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setProfileDialogOpen(false)}
              sx={{
                color: '#6B6B6B',
                '&:hover': {
                  backgroundColor: 'rgba(212, 185, 150, 0.1)'
                }
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleProfileSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                color: '#2C2C2C',
                fontWeight: 600,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
}

export default DashboardCoiffeuse; 