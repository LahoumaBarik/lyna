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
  ListItemIcon
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
  LocationOn
} from '@mui/icons-material';
import WeeklyCalendar from '../components/WeeklyCalendar';

const API_URL = 'http://localhost:5000/api';

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
      const response = await fetch(`${API_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
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
      const response = await fetch(`${API_URL}/analytics/stylist-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          stylistInfo: {
            description: profileForm.description,
            specializations: profileForm.specializations,
            experience: profileForm.experience
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const result = await response.json();
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#2c2c2c', mb: 4 }}>
        Tableau de bord Coiffeuse
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarToday sx={{ color: '#D4B996', mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.totalAppointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rendez-vous
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ color: '#4caf50', mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.completedAppointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Terminés
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ color: '#ff9800', mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.upcomingAppointments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    À venir
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Star sx={{ color: '#ffc107', mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.averageRating.toFixed(1)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Note moyenne
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
  );
}

export default DashboardCoiffeuse; 