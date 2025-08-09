import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Slide,
  Grow,
  Fade
} from '@mui/material';
import {
  CheckCircle,
  ContentCut,
  Person,
  CalendarToday,
  AccessTime,
  Payment,
  ExpandMore,
  ArrowBack,
  ArrowForward,
  Schedule,
  AttachMoney,
  Info,
  Close,
  Store,
  CreditCard
} from '@mui/icons-material';
import LoginModal from '../components/LoginModal';
import axios from 'axios';

const steps = [
  'Politique du salon',
  'Choisir les services',
  'Choisir une coiffeuse',
  'Choisir une date',
  'Choisir un créneau',
  'Paiement',
  'Confirmation'
];

function ReservationTypeform() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // États
  const [activeStep, setActiveStep] = useState(0);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [coiffeuses, setCoiffeuses] = useState([]);
  const [selectedCoiffeuse, setSelectedCoiffeuse] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [dayDisponibilites, setDayDisponibilites] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState('');
  const [reservationId, setReservationId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Modification state
  const [isModifying, setIsModifying] = useState(false);
  const [originalReservation, setOriginalReservation] = useState(null);

  // Configuration PayPal
  const paypalOptions = {
    'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AVzf5mJ1Mdzu4wfVyayl7o_dgmAnNMQS13amiHMXBO0gEhaKhdoWME_KDBKc7L2HLL44GMG8mZF7HOYR',
    currency: 'USD',
    intent: 'capture'
  };

  // Récupère les services
  useEffect(() => {
    axios.get('/services')
      .then(res => {
        if (Array.isArray(res.data)) {
          setServices(res.data);
        }
      })
      .catch(err => setError('Erreur lors du chargement des services'));
  }, []);

  // Récupère les coiffeuses
  useEffect(() => {
    axios.get('/coiffeuses')
      .then(res => {
        if (Array.isArray(res.data)) {
          setCoiffeuses(res.data.filter(c => c.role === 'stylist'));
        }
      })
      .catch(err => setError('Erreur lors du chargement des coiffeuses'));
  }, []);

  // Effet pour restaurer une réservation en attente après connexion/inscription
  useEffect(() => {
    const pendingReservationJSON = localStorage.getItem('pendingReservation');
    if (user && pendingReservationJSON) {
      const pendingReservation = JSON.parse(pendingReservationJSON);

      // Restaurer l'état
      setSelectedServices(pendingReservation.selectedServices || []);
      setSelectedCoiffeuse(pendingReservation.selectedCoiffeuse || null);
      setSelectedDate(pendingReservation.selectedDate || '');
      setSelectedSlot(pendingReservation.selectedSlot || null);

      // Re-calculer les créneaux nécessaires pour l'état restauré
      if (pendingReservation.selectedCoiffeuse && pendingReservation.selectedDate) {
        const date = new Date(pendingReservation.selectedDate).toISOString().split('T')[0];
        axios.get('/disponibilites/coiffeuse/' + pendingReservation.selectedCoiffeuse._id + '?date=' + date)
          .then(res => {
            setDayDisponibilites(Array.isArray(res.data) ? res.data : []);
          })
          .catch(err => {
            setError('Erreur lors de la restauration de votre réservation.');
            setDayDisponibilites([]);
          });
      }
      
      setActiveStep(5); // Aller directement à l'étape de paiement
      localStorage.removeItem('pendingReservation');
    }
  }, [user]);

  // 1. Récupère les disponibilités pour le jour sélectionné
  useEffect(() => {
    if (selectedCoiffeuse && selectedDate) {
      const fetchDisponibilites = async () => {
        try {
          const date = new Date(selectedDate).toISOString().split('T')[0];
          const res = await axios.get('/disponibilites/coiffeuse/' + selectedCoiffeuse._id + '?date=' + date);
          if (res.status !== 200) throw new Error('Erreur lors de la récupération des disponibilités');
          const disponibilites = res.data;
          setDayDisponibilites(Array.isArray(disponibilites) ? disponibilites : []);
        } catch (error) {
          setError(error.message);
          setDayDisponibilites([]);
        }
      };
      fetchDisponibilites();
    } else {
      setDayDisponibilites([]);
    }
  }, [selectedCoiffeuse, selectedDate]);

  const calculateAvailableSlots = (disponibilites) => {
    if (selectedServices.length === 0 || !Array.isArray(disponibilites)) {
      setAvailableSlots([]);
      return;
    }

    const totalDuration = selectedServices.reduce((total, s) => total + s.duration, 0);
    const newSlots = [];
    const now = new Date();

    disponibilites.forEach(dispo => {
      const jourDate = new Date(dispo.jour);

      const startHour = parseInt(dispo.heureDebut.split(':')[0], 10);
      const startMinute = parseInt(dispo.heureDebut.split(':')[1], 10);
      let slotTime = new Date(new Date(jourDate).setHours(startHour, startMinute, 0, 0));

      const endHour = parseInt(dispo.heureFin.split(':')[0], 10);
      const endMinute = parseInt(dispo.heureFin.split(':')[1], 10);
      const endTime = new Date(new Date(jourDate).setHours(endHour, endMinute, 0, 0));

      while (slotTime < endTime) {
        const slotEndTime = new Date(slotTime.getTime() + totalDuration * 60000);

        if (slotEndTime <= endTime && slotTime > now) {
          newSlots.push(slotTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        }
        
        slotTime = new Date(slotTime.getTime() + 15 * 60000); 
      }
    });

    setAvailableSlots([...new Set(newSlots)]);
  };

  // 2. Calcule les créneaux quand les disponibilités ou les services changent
  useEffect(() => {
    calculateAvailableSlots(dayDisponibilites);
  }, [dayDisponibilites, selectedServices]);

  // Met à jour le montant quand un service est sélectionné
  useEffect(() => {
    if (selectedServices.length > 0) {
      const totalAmount = selectedServices.reduce((acc, service) => acc + service.price, 0);
      setAmount(totalAmount);
    }
  }, [selectedServices]);

  const handleLoginSuccess = (loggedInUser) => {
    setShowLoginModal(false);
    setActiveStep(5); // Etape de paiement
  };

  const handleProceedToPayment = () => {
    if (!user) {
      // Sauvegarder la réservation en attente
      const pendingReservation = {
        selectedServices,
        selectedCoiffeuse,
        selectedDate,
        selectedSlot
      };
      localStorage.setItem('pendingReservation', JSON.stringify(pendingReservation));
      setShowLoginModal(true);
    } else {
      setActiveStep(5);
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      setLoading(true);
      
      if (isModifying && originalReservation) {
        // Update existing reservation
        const response = await axios.patch(`/reservations/${originalReservation._id}`, {
          date: selectedDate,
          startTime: selectedSlot,
          serviceIds: selectedServices.map(s => s._id),
          stylistId: selectedCoiffeuse._id,
          paymentMethod: details.paymentMethod || 'paypal',
          paypalOrderId: details.paypalOrderId,
          paypalPaymentId: details.paypalPaymentId
        }, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
          }
        });

        if (response.data.reservation) {
          setReservationId(response.data.reservation._id);
          setPaymentSuccess(true);
          setActiveStep(6);
          setSuccess('Réservation modifiée avec succès !');
        } else {
          throw new Error('Erreur lors de la modification de la réservation');
        }
      } else {
        // Create new reservation
        const response = await axios.post('/reservations', {
          serviceIds: selectedServices.map(s => s._id),
          coiffeuseId: selectedCoiffeuse._id,
          date: selectedDate,
          startTime: selectedSlot,
          paymentMethod: details.paymentMethod || 'paypal',
          paypalOrderId: details.paypalOrderId,
          paypalPaymentId: details.paypalPaymentId,
          totalAmount: selectedServices.reduce((total, s) => total + s.price, 0)
        }, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
          }
        });

        if (response.data.reservation) {
          setReservationId(response.data.reservation._id);
          setPaymentSuccess(true);
          setActiveStep(6);
          setSuccess('Réservation confirmée avec succès !');
        } else {
          throw new Error(response.data.message || 'Erreur lors de la création de la réservation');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      setPaymentError('Erreur lors de la finalisation de la réservation');
    } finally {
      setLoading(false);
    }
  };

  // Groupe les services par catégorie
  const groupByCategory = (services) => {
    const grouped = {};
    services.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    return grouped;
  };

  const groupedServices = groupByCategory(services);
  const categories = Object.keys(groupedServices);

  // Fonction pour sélectionner un service
  const handleServiceSelect = (service) => {
    const isSelected = selectedServices.find(s => s._id === service._id);
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s._id !== service._id));
    } else {
      setSelectedServices([service]);
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return true;
      case 1: return selectedServices.length > 0;
      case 2: return selectedCoiffeuse !== null;
      case 3: return selectedDate !== '';
      case 4: return selectedSlot !== null;
      default: return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  mb: 2
                }}
              >
                <Info sx={{ fontSize: 48, color: '#2C2C2C' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                Politique du salon
              </Typography>
            </Box>
            
            <Card
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: '16px',
                background: 'rgba(248, 246, 242, 0.8)',
                border: '1px solid rgba(212, 185, 150, 0.3)',
                boxShadow: '0px 2px 8px rgba(44, 44, 44, 0.04)'
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C2C2C' }}>
                  Politique d'annulation de rendez-vous
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, color: '#6B6B6B' }}>
                  Nous comprenons que des imprévus peuvent survenir, mais afin de garantir un service de qualité pour tous nos clients, nous vous demandons de bien vouloir respecter la politique d'annulation suivante :
                </Typography>
                <List>
                  <ListItem sx={{ borderRadius: '8px', mb: 1, background: 'rgba(255, 255, 255, 0.5)' }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#D4B996' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: 600, color: '#2C2C2C' }}>Annulation ou modification</Typography>}
                      secondary="Pour toute annulation ou modification de rendez-vous, nous demandons un préavis minimum de 48 heures."
                    />
                  </ListItem>
                  <ListItem sx={{ borderRadius: '8px', mb: 1, background: 'rgba(255, 255, 255, 0.5)' }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#D4B996' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: 600, color: '#2C2C2C' }}>Retards</Typography>}
                      secondary="En cas de retard, nous ferons de notre mieux pour vous recevoir, mais votre rendez-vous pourrait être écourté."
                    />
                  </ListItem>
                  <ListItem sx={{ borderRadius: '8px', mb: 1, background: 'rgba(255, 255, 255, 0.5)' }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#D4B996' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: 600, color: '#2C2C2C' }}>Respect</Typography>}
                      secondary="Merci de respecter les horaires et de prévenir en cas d'empêchement."
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Paper>
        );

      case 1:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  mb: 2
                }}
              >
                <ContentCut sx={{ fontSize: 48, color: '#2C2C2C' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                Sélectionnez vos services
              </Typography>
            </Box>

            {categories.map(category => (
              <Accordion
                key={category}
                sx={{
                  mb: 2,
                  borderRadius: '12px',
                  background: 'rgba(248, 246, 242, 0.8)',
                  border: '1px solid rgba(212, 185, 150, 0.3)',
                  '&:before': { display: 'none' },
                  '&:hover': {
                    background: 'rgba(248, 246, 242, 0.9)'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#D4B996' }} />}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '12px'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    {category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <RadioGroup value={selectedServices[0]?._id || ''}>
                    {groupedServices[category].map(service => (
                      <Card 
                        key={service._id}
                        elevation={0}
                        sx={{ 
                          mb: 2, 
                          cursor: 'pointer',
                          borderRadius: '12px',
                          border: selectedServices.find(s => s._id === service._id) ? '2px solid #D4B996' : '1px solid rgba(212, 185, 150, 0.3)',
                          background: selectedServices.find(s => s._id === service._id) ? 'rgba(212, 185, 150, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0px 4px 12px rgba(44, 44, 44, 0.1)',
                            border: '2px solid #D4B996'
                          }
                        }}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                                {service.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Chip 
                                  icon={<Schedule />} 
                                  label={service.duration + ' min'} 
                                  size="small" 
                                  sx={{
                                    backgroundColor: 'rgba(212, 185, 150, 0.2)',
                                    color: '#2C2C2C',
                                    fontWeight: 500
                                  }}
                                />
                                <Chip 
                                  icon={<AttachMoney />} 
                                  label={service.price + ' €'} 
                                  size="small" 
                                  sx={{
                                    backgroundColor: '#D4B996',
                                    color: '#2C2C2C',
                                    fontWeight: 600
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        );

      case 2:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  mb: 2
                }}
              >
                <Person sx={{ fontSize: 48, color: '#2C2C2C' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                Choisissez votre coiffeuse
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {coiffeuses.map((coiffeuse) => (
                <Grid item xs={12} sm={6} md={4} key={coiffeuse._id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: '16px',
                      border: selectedCoiffeuse?._id === coiffeuse._id ? '2px solid #D4B996' : '1px solid rgba(212, 185, 150, 0.3)',
                      background: selectedCoiffeuse?._id === coiffeuse._id ? 'rgba(212, 185, 150, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0px 8px 24px rgba(44, 44, 44, 0.12)',
                        border: '2px solid #D4B996'
                      }
                    }}
                    onClick={() => setSelectedCoiffeuse(coiffeuse)}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
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
                        {coiffeuse.firstName?.charAt(0)}{coiffeuse.lastName?.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                        {coiffeuse.firstName} {coiffeuse.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B6B6B', mt: 1, fontWeight: 500 }}>
                        {coiffeuse.stylistInfo?.level || 'Styliste'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        );

      case 3:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  mb: 2
                }}
              >
                <CalendarToday sx={{ fontSize: 48, color: '#2C2C2C' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                Choisissez une date
              </Typography>
            </Box>

            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <TextField
                type="date"
                fullWidth
                label="Date de rendez-vous"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                InputLabelProps={{ shrink: true }}
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
            </Box>
          </Paper>
        );

      case 4:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  mb: 2
                }}
              >
                <AccessTime sx={{ fontSize: 48, color: '#2C2C2C' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                Choisissez un créneau
              </Typography>
              {selectedDate && (
                <Typography variant="body1" sx={{ color: '#6B6B6B', mt: 1, fontWeight: 500 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </Typography>
              )}
            </Box>

            {availableSlots.length > 0 ? (
              <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                {availableSlots.map((slot, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Button
                      fullWidth
                      variant={selectedSlot === slot ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSlot(slot)}
                      sx={{
                        py: 1.5,
                        borderRadius: '12px',
                        borderColor: '#D4B996',
                        color: selectedSlot === slot ? '#2C2C2C' : '#D4B996',
                        backgroundColor: selectedSlot === slot ? 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)' : 'transparent',
                        background: selectedSlot === slot ? 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)' : 'transparent',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: selectedSlot === slot ? 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)' : 'rgba(212, 185, 150, 0.1)',
                          background: selectedSlot === slot ? 'linear-gradient(135deg, #B8A08A 0%, #A08F7A 100%)' : 'rgba(212, 185, 150, 0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {slot}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" sx={{ py: 4 }}>
                <Typography variant="body1" sx={{ color: '#6B6B6B' }}>
                  {selectedDate ? 'Aucun créneau disponible pour cette date' : 'Veuillez sélectionner une date'}
                </Typography>
              </Box>
            )}
          </Paper>
        );

      case 5:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
                  mb: 2
                }}
              >
                <Payment sx={{ fontSize: 48, color: '#2C2C2C' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                Paiement
              </Typography>
            </Box>

            {selectedServices.length > 0 && selectedCoiffeuse && selectedDate && selectedSlot ? (
              <>
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: '16px',
                    background: 'rgba(248, 246, 242, 0.8)',
                    border: '1px solid rgba(212, 185, 150, 0.3)',
                    boxShadow: '0px 2px 8px rgba(44, 44, 44, 0.04)'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C2C2C' }}>
                      Récapitulatif de votre réservation
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(212, 185, 150, 0.3)' }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Service:</strong> {selectedServices.map(s => s.name).join(', ')}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Coiffeuse:</strong> {selectedCoiffeuse.firstName} {selectedCoiffeuse.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Date:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR')}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Heure:</strong> {selectedSlot}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(212, 185, 150, 0.3)' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                        Total: {selectedServices.reduce((sum, service) => sum + service.price, 0)} €
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {paymentError && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {paymentError}
                  </Alert>
                )}

                {!paymentSuccess ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 2, color: '#6B6B6B' }}>
                      Cliquez sur le bouton ci-dessous pour procéder au paiement
                    </Typography>
                    <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
                      <PayPalButtons
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{
                              amount: {
                                value: selectedServices.reduce((sum, service) => sum + service.price, 0).toString()
                              }
                            }]
                          });
                        }}
                        onApprove={(data, actions) => {
                          return actions.order.capture().then((details) => {
                            handlePaymentSuccess(details);
                          });
                        }}
                        onError={(err) => {
                          setPaymentError('Erreur lors du paiement. Veuillez réessayer.');
                        }}
                        style={{ layout: "vertical" }}
                      />
                    </PayPalScriptProvider>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                      Paiement réussi !
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B6B6B' }}>
                      Votre réservation a été confirmée.
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box textAlign="center" sx={{ py: 4 }}>
                <Typography variant="body1" sx={{ color: '#6B6B6B' }}>
                  Veuillez compléter toutes les étapes précédentes.
                </Typography>
              </Box>
            )}
          </Paper>
        );

      case 6:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  mb: 2
                }}
              >
                <CheckCircle sx={{ fontSize: 48, color: '#ffffff' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                Réservation confirmée !
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
                Votre rendez-vous a été enregistré avec succès.
              </Typography>
            </Box>

            {reservationId && (
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: '16px',
                  background: 'rgba(248, 246, 242, 0.8)',
                  border: '1px solid rgba(212, 185, 150, 0.3)',
                  boxShadow: '0px 2px 8px rgba(44, 44, 44, 0.04)'
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C2C2C' }}>
                    Détails de votre réservation
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: 'rgba(212, 185, 150, 0.3)' }} />
                  <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                    <strong style={{ color: '#2C2C2C' }}>Numéro de réservation:</strong> {reservationId}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                    <strong style={{ color: '#2C2C2C' }}>Service:</strong> {selectedServices.map(s => s.name).join(', ')}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                    <strong style={{ color: '#2C2C2C' }}>Coiffeuse:</strong> {selectedCoiffeuse.firstName} {selectedCoiffeuse.lastName}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                    <strong style={{ color: '#2C2C2C' }}>Date:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR')}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                    <strong style={{ color: '#2C2C2C' }}>Heure:</strong> {selectedSlot}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard-client')}
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
                Voir mes réservations
              </Button>
            </Box>
          </Paper>
        );

      default:
        return null;
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
      <Container maxWidth="md">
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
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#2C2C2C',
                mb: 1,
                letterSpacing: '-0.02em',
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              {isModifying ? 'Modifier ma réservation' : 'Réservation'}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#6B6B6B',
                fontWeight: 400,
                fontSize: '1.1rem'
              }}
            >
              {isModifying 
                ? 'Modifiez la date et l\'heure de votre rendez-vous' 
                : 'Prenez rendez-vous en quelques étapes simples'
              }
            </Typography>
          </Paper>
        </Slide>

        {/* Progress */}
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B6B6B', textAlign: 'center', fontWeight: 500 }}>
                Étape {activeStep + 1} sur {steps.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(activeStep + 1) / steps.length * 100} 
                sx={{ 
                  mt: 1,
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(212, 185, 150, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#D4B996',
                    borderRadius: 4
                  }
                }} 
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', textAlign: 'center' }}>
              {steps[activeStep]}
            </Typography>
          </Paper>
        </Grow>

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

        {/* Step Content */}
        <Grow in timeout={1200}>
          {renderStepContent(activeStep)}
        </Grow>

        {/* Navigation Buttons */}
        {activeStep !== 6 && (
          <Grow in timeout={1400}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
                sx={{ 
                  color: '#6B6B6B',
                  fontWeight: 600,
                  borderRadius: '12px',
                  textTransform: 'none',
                  '&:disabled': { color: '#cccccc' },
                  '&:hover': {
                    backgroundColor: 'rgba(212, 185, 150, 0.1)'
                  }
                }}
              >
                Retour
              </Button>
              
              <Button
                variant="contained"
                onClick={activeStep === 4 ? handleProceedToPayment : handleNext}
                disabled={!canProceed()}
                endIcon={<ArrowForward />}
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
                  },
                  '&:disabled': {
                    background: 'rgba(212, 185, 150, 0.3)',
                    color: 'rgba(44, 44, 44, 0.5)'
                  }
                }}
              >
                {activeStep === 4 ? 'Procéder au paiement' : 'Suivant'}
              </Button>
            </Box>
          </Grow>
        )}

        {/* Login Modal */}
        <Dialog
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                Connexion requise
              </Typography>
              <IconButton
                onClick={() => setShowLoginModal(false)}
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
            <Typography variant="body1" sx={{ mb: 3, color: '#6B6B6B' }}>
              Pour continuer, veuillez vous connecter ou créer un compte.
            </Typography>
            <LoginModal onAuthSuccess={handleLoginSuccess} />
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

export default ReservationTypeform;