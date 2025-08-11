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
  Grow,
  Divider
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
  Work,
  CalendarToday,
  Dashboard,
  Star,
  TrendingUp,
  AutoAwesome,
  Verified,
  Schedule,
  ArrowForward
} from '@mui/icons-material';
import axios from 'axios';

function DashboardClient() {
  const { user, socket } = useAuth();
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

  // Real-time reservations updates
  useEffect(() => {
    if (!socket) return;
    const onReservationsChanged = () => {
      // Refetch without reload
      (async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('accessToken');
          const response = await axios.get('/reservations', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (Array.isArray(response.data)) setReservations(response.data);
          else if (response.data?.reservations) setReservations(response.data.reservations);
        } catch (e) {
          // ignore
        } finally {
          setLoading(false);
        }
      })();
    };
    socket.on('reservations_changed', onReservationsChanged);
    return () => socket.off('reservations_changed', onReservationsChanged);
  }, [socket]);

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
      
      // Update list without reload
      setReservations(prev => prev.filter(r => r._id !== id));
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
      
      // Update list without reload
      setReservations(prev => prev.filter(r => r._id !== id));
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
        
        // Update locally without reload
        setReservations(prev => prev.map(r => r._id === modifyingReservation._id ? { ...r, date: newDate, startTime: newTime } : r));
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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, pt: { xs: 12, sm: 14 }, pb: 6 }}>
        {/* Success/Error Alerts */}
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

        {/* Modern Header */}
        <Fade in timeout={800}>
          <Card
            sx={{
              mb: 6,
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
              boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)'
            }}
          >
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
                        width: 80,
                        height: 80,
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '2rem',
                        fontWeight: 700
                      }}
                    >
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        Bonjour, {user?.firstName} !
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          opacity: 0.95,
                          fontSize: { xs: '1rem', md: '1.25rem' },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Dashboard sx={{ fontSize: 20 }} />
                        Tableau de bord Client
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      onClick={() => navigate('/reservation')}
                      sx={{
                        borderRadius: '50px',
                        px: 4,
                        py: 2,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                          border: '2px solid rgba(255, 255, 255, 0.5)'
                        }
                      }}
                    >
                      Nouveau Rendez-vous
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Fade>

        {/* Profile Summary Card */}
        <Fade in timeout={800}>
          <Card
            sx={{
              mb: 4,
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
              boxShadow: '0 16px 32px rgba(44, 44, 44, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)'
              }
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #F8F6F2 0%, #F0EDE7 100%)',
                p: 3,
                borderBottom: '1px solid rgba(139, 115, 85, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#2c2c2c', 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '1.25rem'
                  }}
                >
                  <Person sx={{ mr: 2, color: '#8B7355', fontSize: 28 }} />
                  Mon Profil
                </Typography>
                <Tooltip title="Modifier mon profil">
                  <IconButton
                    onClick={() => navigate('/profile')}
                    sx={{
                      bgcolor: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                      color: 'white',
                      width: 48,
                      height: 48,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        transform: 'scale(1.1)',
                        boxShadow: '0 8px 24px rgba(139, 115, 85, 0.3)'
                      }
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    borderRadius: '12px',
                    background: 'rgba(139, 115, 85, 0.05)',
                    border: '1px solid rgba(139, 115, 85, 0.1)'
                  }}>
                    <Person sx={{ mr: 2, color: '#8B7355', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                        Nom complet
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                        {user?.firstName} {user?.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    borderRadius: '12px',
                    background: 'rgba(139, 115, 85, 0.05)',
                    border: '1px solid rgba(139, 115, 85, 0.1)'
                  }}>
                    <Email sx={{ mr: 2, color: '#8B7355', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    borderRadius: '12px',
                    background: 'rgba(139, 115, 85, 0.05)',
                    border: '1px solid rgba(139, 115, 85, 0.1)'
                  }}>
                    <Phone sx={{ mr: 2, color: '#8B7355', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                        Téléphone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                        {user?.phone || 'Non renseigné'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Become a Hairstylist Section */}
        <Fade in timeout={1000}>
          <Card
            sx={{
              mb: 4,
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FFFFFF" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3
              }
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Work sx={{ 
                fontSize: 64, 
                color: 'rgba(255, 255, 255, 0.9)', 
                mb: 3,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white', 
                  mb: 3,
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.5rem', md: '2rem' }
                }}
              >
                Intéressé par une carrière de coiffeur ?
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  mb: 4,
                  fontSize: '1.125rem',
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Rejoignez notre équipe de professionnels et développez votre carrière avec nous
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Work />}
                onClick={() => navigate('/stylist-application')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  py: 2,
                  px: 6,
                  borderRadius: '50px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                Devenir Coiffeur
              </Button>
            </CardContent>
          </Card>
        </Fade>

        {/* Quick Actions */}
        <Fade in timeout={1200}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/reservation')}
              sx={{
                background: 'linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%)',
                color: 'white',
                py: 2.5,
                px: 6,
                borderRadius: '50px',
                fontSize: '1.25rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 12px 32px rgba(44, 44, 44, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 40px rgba(44, 44, 44, 0.4)'
                }
              }}
            >
              Prendre un nouveau rendez-vous
            </Button>
          </Box>
        </Fade>

        {/* Reservations Section */}
        <Fade in timeout={1400}>
          <Card
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
              boxShadow: '0 16px 32px rgba(44, 44, 44, 0.08)'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #F8F6F2 0%, #F0EDE7 100%)',
                p: 4,
                borderBottom: '1px solid rgba(139, 115, 85, 0.1)'
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#2c2c2c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <CalendarToday sx={{ color: '#8B7355', fontSize: 32 }} />
                Mes rendez-vous à venir
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress 
                    size={60}
                    sx={{ 
                      color: '#8B7355',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round'
                      }
                    }}
                  />
                </Box>
              ) : upcomingReservations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CalendarToday sx={{ fontSize: 64, color: '#D4AF37', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ color: '#666666', mb: 2, fontWeight: 600 }}>
                    Aucun rendez-vous à venir
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#999999', mb: 3 }}>
                    Prenez votre prochain rendez-vous dès maintenant !
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/reservation')}
                    sx={{
                      borderColor: '#8B7355',
                      color: '#8B7355',
                      borderRadius: '25px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#D4AF37',
                        backgroundColor: 'rgba(139, 115, 85, 0.05)'
                      }
                    }}
                  >
                    Prendre un rendez-vous
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {upcomingReservations.map((reservation, index) => (
                    <Grow in timeout={200 * (index + 1)} key={reservation._id}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: '16px',
                          border: '1px solid rgba(139, 115, 85, 0.1)',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 16px 32px rgba(44, 44, 44, 0.12)',
                            border: '1px solid rgba(139, 115, 85, 0.2)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Chip
                              label={getStatusLabel(reservation.status)}
                              color={getStatusColor(reservation.status)}
                              size="medium"
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: '20px',
                                px: 2,
                                py: 1
                              }}
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#666666',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                              }}
                            >
                              {formatDate(reservation.date)}
                            </Typography>
                          </Box>
                          
                          <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(139, 115, 85, 0.05)'
                              }}>
                                <AccessTime sx={{ mr: 2, color: '#8B7355', fontSize: 20 }} />
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                                    Heure
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                                    {reservation.heureDebut} - {reservation.heureFin}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(139, 115, 85, 0.05)'
                              }}>
                                <ContentCut sx={{ mr: 2, color: '#8B7355', fontSize: 20 }} />
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                                    Service
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                                    {reservation.service?.name || 'Service non défini'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(139, 115, 85, 0.05)'
                              }}>
                                <Person sx={{ mr: 2, color: '#8B7355', fontSize: 20 }} />
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                                    Styliste
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                                    {reservation.stylist?.firstName} {reservation.stylist?.lastName}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>

                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            {getReservationActions(reservation)}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
            color: 'white',
            width: 64,
            height: 64,
            boxShadow: '0 8px 24px rgba(139, 115, 85, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 12px 32px rgba(139, 115, 85, 0.4)'
            }
          }}
          onClick={() => navigate('/reservation')}
        >
          <Add sx={{ fontSize: 28 }} />
        </Fab>

        {/* Modify Reservation Dialog */}
        <Dialog 
          open={modifyDialogOpen} 
          onClose={() => setModifyDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                Modifier la réservation
              </Typography>
              <IconButton 
                onClick={() => setModifyDialogOpen(false)}
                sx={{ color: '#666666' }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Nouvelle date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8B7355'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8B7355'
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
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8B7355'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8B7355'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setModifyDialogOpen(false)}
              sx={{
                color: '#666666',
                borderRadius: '25px',
                px: 3,
                py: 1.5,
                fontWeight: 600
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveModification} 
              variant="contained" 
              startIcon={<Save />}
              sx={{
                background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                color: 'white',
                borderRadius: '25px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(139, 115, 85, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(139, 115, 85, 0.4)'
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