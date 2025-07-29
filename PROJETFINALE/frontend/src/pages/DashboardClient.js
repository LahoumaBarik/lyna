import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import {
  Person,
  Add,
  AccessTime,
  ContentCut,
  Phone,
  Email,
  Edit,
  Delete,
  Cancel,
  Close,
  Save,
  Work
} from '@mui/icons-material';
import axios from 'axios';

function DashboardClient() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [modifyingReservation, setModifyingReservation] = useState(null);
  const [modificationForm, setModificationForm] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReservationForReview, setSelectedReservationForReview] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const navigate = useNavigate();

  // Check if user role has changed (e.g., after stylist approval)
  useEffect(() => {
    const checkRoleChange = async () => {
      if (user && user.role === 'client') {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.data && response.data.data.role !== 'client') {
            setSuccess('Your role has been updated! Please refresh the page to access your new dashboard.');
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        } catch (error) {
          console.error('Failed to check role:', error);
        }
      }
    };

    checkRoleChange();
  }, [user]);

  // Fetch reservations on component mount
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get('/reservations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle different response structures
        if (response.data && response.data.success && response.data.data) {
          setReservations(response.data.data);
        } else if (Array.isArray(response.data)) {
          setReservations(response.data);
        } else if (response.data && Array.isArray(response.data.reservations)) {
          setReservations(response.data.reservations);
        } else {
          setReservations([]);
        }
      } catch (e) {
        console.error('Error fetching reservations:', e);
        setError('Erreur lors du chargement des réservations');
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Separate upcoming and past reservations
  const now = new Date();
  const upcomingReservations = reservations.filter(r => 
    new Date(r.date) > now && r.status !== 'annulee'
  );

  // Handle reservation cancellation
  const handleCancel = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`/reservations/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Rendez-vous annulé avec succès !');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh reservations list immediately
      window.location.reload();
    } catch (err) {
      setError('Erreur lors de l\'annulation du rendez-vous');
    }
  };

  // Handle reservation deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Rendez-vous supprimé avec succès !');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh reservations list immediately
      window.location.reload();
    } catch (err) {
      setError('Erreur lors de la suppression du rendez-vous');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmee': return 'success';
      case 'en_attente': return 'warning';
      case 'annulee': return 'error';
      default: return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmee': return 'Confirmé';
      case 'en_attente': return 'En attente';
      case 'annulee': return 'Annulé';
      default: return status;
    }
  };

  // Handle modify reservation
  const handleModifyReservation = (reservation) => {
    setModifyingReservation(reservation);
    setNewDate(new Date(reservation.date).toISOString().split('T')[0]);
    setNewTime(reservation.startTime || reservation.heureDebut || '');
    setModifyDialogOpen(true);
  };

  const handleSaveModification = async () => {
    if (!modifyingReservation) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const updateData = {
        date: newDate,
        startTime: newTime,
        services: modificationForm.services || modifyingReservation.services
      };

      const response = await axios.patch(`/reservations/${modifyingReservation._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setSuccess('Réservation modifiée avec succès !');
        setModifyDialogOpen(false);
        setModifyingReservation(null);
        setModificationForm({});
        setNewDate('');
        setNewTime('');
        
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  // Handle different reservation actions
  const handleLeaveReview = (reservationId) => {
    navigate(`/reviews?reservation=${reservationId}`);
  };

  const handleMarkCompleted = async (reservationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.patch(`/reservations/${reservationId}`, { status: 'completed' }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        setSuccess('Rendez-vous marqué comme terminé !');
        setTimeout(() => setSuccess(''), 3000);
        
        // Refresh reservations list
        window.location.reload();
      }
    } catch (error) {
      setError('Erreur lors du marquage comme terminé');
    }
  };

  // Determine if appointment is in the past
  const isAppointmentPast = (reservationDate) => {
    return new Date(reservationDate) < new Date();
  };

  // Get appropriate actions for reservation
  const getReservationActions = (reservation) => {
    const isPast = isAppointmentPast(reservation.date);
    const status = reservation.status;
    
    if (isPast && status === 'pending') {
      // Past appointment that needs to be marked complete
      return (
        <Tooltip title="Marquer comme terminé et laisser un avis">
          <IconButton
            size="small"
            onClick={() => handleMarkCompleted(reservation._id)}
            sx={{ color: '#4caf50' }}
          >
            <Person fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    } else if (isPast && status === 'completed') {
      // Past completed appointment - can review
      return (
        <Tooltip title="Laisser/modifier un avis">
          <IconButton
            size="small"
            onClick={() => handleLeaveReview(reservation._id)}
            sx={{ color: '#2196f3' }}
          >
            <Person fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    } else if (!isPast && status !== 'cancelled') {
      // Future appointment - can modify or cancel
      return (
        <>
          <Tooltip title="Modifier le rendez-vous">
            <IconButton
              size="small"
              onClick={() => handleModifyReservation(reservation)}
              sx={{ color: '#2196f3' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Annuler le rendez-vous">
            <IconButton
              size="small"
              onClick={() => handleCancel(reservation._id)}
              sx={{ color: '#ff9800' }}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 100%)',
        pt: { xs: 10, sm: 12 },
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Success/Error Alerts */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: '#ffffff',
            textAlign: 'center'
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: '#2c2c2c',
              fontSize: '2rem'
            }}
          >
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2c2c2c',
              mb: 1
            }}
          >
            Bienvenue, {user?.firstName} !
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              fontWeight: 400
            }}
          >
            Tableau de bord Client
          </Typography>
        </Paper>

        {/* Profile Summary Card */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: '#ffffff'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, color: '#D4B996' }} />
              Mon Profil
            </Typography>
            <Tooltip title="Modifier mon profil">
              <IconButton
                onClick={() => navigate('/profile')}
                sx={{
                  bgcolor: '#D4B996',
                  color: 'white',
                  '&:hover': { bgcolor: '#c4a985' }
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, minWidth: '300px' }}>
              <Person sx={{ mr: 1, color: '#666666', fontSize: 18 }} />
              <Typography variant="body1">
                <strong>Nom :</strong> {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, minWidth: '300px' }}>
              <Email sx={{ mr: 1, color: '#666666', fontSize: 18 }} />
              <Typography variant="body1">
                <strong>Email :</strong> {user?.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '300px' }}>
              <Phone sx={{ mr: 1, color: '#666666', fontSize: 18 }} />
              <Typography variant="body1">
                <strong>Téléphone :</strong> {user?.phone || 'Non renseigné'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Become a Hairstylist Section */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #D4B996 0%, #c4a985 100%)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2 }}>
            <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
            Intéressé par une carrière de coiffeur ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 3 }}>
            Rejoignez notre équipe de professionnels et développez votre carrière avec nous
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Work />}
            onClick={() => navigate('/stylist-application')}
            sx={{
              bgcolor: '#2c2c2c',
              color: '#ffffff',
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#1a1a1a'
              }
            }}
          >
            Devenir Coiffeur
          </Button>
        </Paper>

        {/* Quick Actions */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/reservation')}
            sx={{
              bgcolor: '#2c2c2c',
              color: '#ffffff',
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#1a1a1a'
              }
            }}
          >
            Prendre un nouveau rendez-vous
          </Button>
        </Box>

        {/* Reservations Section */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            background: '#ffffff',
            overflow: 'hidden',
            p: 3
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 3 }}>
            Mes rendez-vous à venir
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : upcomingReservations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>
                Aucun rendez-vous à venir
              </Typography>
              <Typography variant="body1" sx={{ color: '#999999' }}>
                Prenez votre prochain rendez-vous dès maintenant !
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {upcomingReservations.map((reservation) => (
                <Card
                  key={reservation._id}
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={getStatusLabel(reservation.status)}
                        color={getStatusColor(reservation.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ color: '#666666' }}>
                        {formatDate(reservation.date)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ mr: 1, color: '#D4B996', fontSize: 18 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {reservation.heureDebut} - {reservation.heureFin}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ContentCut sx={{ mr: 1, color: '#D4B996', fontSize: 18 }} />
                        <Typography variant="body1">
                          {reservation.service?.name || 'Service non défini'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, color: '#D4B996', fontSize: 18 }} />
                        <Typography variant="body1">
                          {reservation.stylist?.firstName} {reservation.stylist?.lastName}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {getReservationActions(reservation)}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#D4B996',
            '&:hover': { bgcolor: '#c4a985' }
          }}
          onClick={() => navigate('/reservation')}
        >
          <Add />
        </Fab>

        {/* Modify Reservation Dialog */}
        <Dialog open={modifyDialogOpen} onClose={() => setModifyDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Modifier la réservation</Typography>
              <IconButton onClick={() => setModifyDialogOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Nouvelle date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="time"
                  label="Nouvelle heure"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModifyDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveModification} variant="contained" startIcon={<Save />}>
              Sauvegarder
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default DashboardClient;