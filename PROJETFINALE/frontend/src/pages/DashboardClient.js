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
  Grid,
  Fade,
  Slide,
  Grow
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
        const reservationsData = response.data.data || response.data || [];
        setReservations(reservationsData);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Erreur lors du chargement des réservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`/reservations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReservations(prev => prev.filter(r => r._id !== id));
        setSuccess('Réservation annulée avec succès');
      } catch (err) {
        setError('Erreur lors de l\'annulation de la réservation');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`/reservations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReservations(prev => prev.filter(r => r._id !== id));
        setSuccess('Réservation supprimée avec succès');
      } catch (err) {
        setError('Erreur lors de la suppression de la réservation');
      }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196f3';
      default: return '#666666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const handleModifyReservation = (reservation) => {
    setModifyingReservation(reservation);
    setModificationForm({
      date: reservation.date ? reservation.date.split('T')[0] : '',
      time: reservation.time || '',
      service: reservation.service || '',
      stylist: reservation.stylist || ''
    });
    setModifyDialogOpen(true);
  };

  const handleSaveModification = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const updatedReservation = {
        ...modifyingReservation,
        ...modificationForm
      };

      await axios.put(`/reservations/${modifyingReservation._id}`, updatedReservation, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReservations(prev => prev.map(r => 
        r._id === modifyingReservation._id ? { ...r, ...modificationForm } : r
      ));
      
      setModifyDialogOpen(false);
      setModifyingReservation(null);
      setModificationForm({});
      setSuccess('Réservation modifiée avec succès');
    } catch (err) {
      setError('Erreur lors de la modification de la réservation');
    }
  };

  const handleLeaveReview = (reservationId) => {
    setSelectedReservationForReview(reservationId);
    setShowReviewForm(true);
  };

  const handleMarkCompleted = async (reservationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`/reservations/${reservationId}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReservations(prev => prev.map(r => 
        r._id === reservationId ? { ...r, status: 'completed' } : r
      ));
      setSuccess('Réservation marquée comme terminée');
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const isAppointmentPast = (reservationDate) => {
    return new Date(reservationDate) < new Date();
  };

  const getReservationActions = (reservation) => {
    const { status, _id } = reservation;
    const isPast = isAppointmentPast(reservation.date);

    if (status === 'completed' && !reservation.review) {
      // Completed but no review - can leave review
      return (
        <Tooltip title="Laisser un avis">
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
              Tableau de bord Client
            </Typography>
          </Paper>
        </Slide>

        {/* Profile Summary Card */}
        <Grow in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C', display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1, color: '#D4B996' }} />
                Mon Profil
              </Typography>
              <Tooltip title="Modifier mon profil">
                <IconButton
                  onClick={() => navigate('/profile')}
                  sx={{
                    background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                    color: '#2C2C2C',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '12px' }}>
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
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '12px' }}>
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
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '12px' }}>
                  <Phone sx={{ mr: 1, color: '#D4B996' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                      Téléphone
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C2C2C', fontWeight: 600 }}>
                      {user?.phone || 'Non renseigné'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grow>

        {/* Become a Hairstylist Section */}
        <Grow in timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
              textAlign: 'center',
              boxShadow: '0px 8px 32px rgba(212, 185, 150, 0.3)',
              position: 'relative',
              overflow: 'hidden',
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
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                Intéressé par une carrière de coiffeur ?
              </Typography>
              <Typography variant="body1" sx={{ color: '#2C2C2C', mb: 3, fontSize: '1.1rem' }}>
                Rejoignez notre équipe de professionnels et développez votre carrière avec nous
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Work />}
                onClick={() => navigate('/stylist-application')}
                sx={{
                  background: 'rgba(44, 44, 44, 0.9)',
                  color: '#FFFFFF',
                  py: 1.5,
                  px: 4,
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: '#2C2C2C',
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.3)'
                  }
                }}
              >
                Devenir Coiffeur
              </Button>
            </Box>
          </Paper>
        </Grow>

        {/* Quick Actions */}
        <Grow in timeout={1400}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/reservation')}
              sx={{
                background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                color: '#2C2C2C',
                py: 1.5,
                px: 4,
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: 600,
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
              Prendre un nouveau rendez-vous
            </Button>
          </Box>
        </Grow>

        {/* Reservations Section */}
        <Grow in timeout={1600}>
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
              Mes rendez-vous à venir
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#D4B996' }} />
              </Box>
            ) : reservations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: '#6B6B6B', mb: 1 }}>
                  Aucun rendez-vous à venir
                </Typography>
                <Typography variant="body1" sx={{ color: '#8A857C' }}>
                  Prenez votre prochain rendez-vous dès maintenant !
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reservations.map((reservation, index) => (
                  <Grow in timeout={800 + index * 200} key={reservation._id}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: '12px',
                        border: '1px solid rgba(212, 185, 150, 0.2)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0px 8px 16px rgba(44, 44, 44, 0.12)',
                          border: '1px solid rgba(212, 185, 150, 0.4)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Chip
                            label={getStatusLabel(reservation.status)}
                            sx={{
                              backgroundColor: getStatusColor(reservation.status),
                              color: '#FFFFFF',
                              fontWeight: 600,
                              borderRadius: '8px'
                            }}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                            {formatDate(reservation.date)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '8px' }}>
                            <AccessTime sx={{ mr: 1, color: '#D4B996', fontSize: 18 }} />
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
                              {reservation.heureDebut} - {reservation.heureFin}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '8px' }}>
                            <ContentCut sx={{ mr: 1, color: '#D4B996', fontSize: 18 }} />
                            <Typography variant="body1" sx={{ color: '#2C2C2C' }}>
                              {reservation.service?.name || 'Service non défini'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, background: 'rgba(248, 246, 242, 0.5)', borderRadius: '8px' }}>
                            <Person sx={{ mr: 1, color: '#D4B996', fontSize: 18 }} />
                            <Typography variant="body1" sx={{ color: '#2C2C2C' }}>
                              {reservation.stylist?.firstName} {reservation.stylist?.lastName}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {getReservationActions(reservation)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                ))}
              </Box>
            )}
          </Paper>
        </Grow>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
            color: '#2C2C2C',
            boxShadow: '0px 4px 12px rgba(212, 185, 150, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0px 8px 24px rgba(212, 185, 150, 0.4)'
            }
          }}
          onClick={() => navigate('/reservation')}
        >
          <Add />
        </Fab>

        {/* Modify Reservation Dialog */}
        <Dialog 
          open={modifyDialogOpen} 
          onClose={() => setModifyDialogOpen(false)} 
          maxWidth="sm" 
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                Modifier la réservation
              </Typography>
              <IconButton 
                onClick={() => setModifyDialogOpen(false)}
                sx={{
                  color: '#D4B996',
                  '&:hover': {
                    backgroundColor: 'rgba(212, 185, 150, 0.1)'
                  }
                }}
              >
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
                  value={modificationForm.date || ''}
                  onChange={(e) => setModificationForm({...modificationForm, date: e.target.value})}
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
                  type="time"
                  label="Nouvelle heure"
                  value={modificationForm.time || ''}
                  onChange={(e) => setModificationForm({...modificationForm, time: e.target.value})}
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
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setModifyDialogOpen(false)}
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
              onClick={handleSaveModification}
              variant="contained"
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
              Sauvegarder
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default DashboardClient;