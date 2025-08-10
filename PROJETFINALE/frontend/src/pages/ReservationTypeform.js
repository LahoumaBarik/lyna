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
  Fade,
  Slide,
  Grow
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
  CreditCard,
  AutoAwesome,
  Verified,
  LocalOffer
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
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
                p: { xs: 4, md: 6 },
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  color: 'white'
                }}
              >
                <Verified sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Politique du salon
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                Prenez connaissance de nos conditions pour une expérience optimale
              </Typography>
            </Box>
            
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Card 
                sx={{ 
                  mb: 4, 
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
                  border: '1px solid rgba(139, 115, 85, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                    color: 'white',
                    p: 3
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Politique d'annulation de rendez-vous
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                    Nous comprenons que des imprévus peuvent survenir, mais afin de garantir un service de qualité 
                    pour tous nos clients, nous vous demandons de bien vouloir respecter la politique d'annulation suivante :
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      {
                        title: "Annulation ou modification",
                        description: "Pour toute annulation ou modification de rendez-vous, nous demandons un préavis minimum de 48 heures.",
                        icon: <CheckCircle />
                      },
                      {
                        title: "Retards",
                        description: "En cas de retard, nous ferons de notre mieux pour vous recevoir, mais votre rendez-vous pourrait être écourté.",
                        icon: <AccessTime />
                      },
                      {
                        title: "Respect",
                        description: "Merci de respecter les horaires et de prévenir en cas d'empêchement.",
                        icon: <AutoAwesome />
                      }
                    ].map((item, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <Card
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(139, 115, 85, 0.1)',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(139, 115, 85, 0.15)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                              color: 'white'
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                            {item.description}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
              
              <Box
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#2E7D32' }}>
                  ✨ En continuant, vous acceptez nos conditions et vous engagez à respecter notre politique de salon.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
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
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
                p: { xs: 4, md: 6 },
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  color: 'white'
                }}
              >
                <ContentCut sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Sélectionnez vos services
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                Choisissez le service qui correspond à vos besoins
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              {categories.map((category, categoryIndex) => (
                <Fade in timeout={800 + categoryIndex * 200} key={category}>
                  <Card 
                    sx={{ 
                      mb: 3, 
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(139, 115, 85, 0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <Accordion 
                      expanded={openCategory === category}
                      onChange={() => setOpenCategory(openCategory === category ? '' : category)}
                      sx={{ 
                        background: 'transparent',
                        boxShadow: 'none',
                        '&:before': { display: 'none' }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}
                        sx={{ 
                          background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <LocalOffer sx={{ fontSize: 20 }} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {category}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          {groupedServices[category].map((service, serviceIndex) => (
                            <Grid item xs={12} key={service._id}>
                              <Slide direction="up" in timeout={1000 + serviceIndex * 100}>
                                <Card 
                                  elevation={selectedServices.find(s => s._id === service._id) ? 8 : 2}
                                  sx={{ 
                                    cursor: 'pointer',
                                    border: selectedServices.find(s => s._id === service._id) 
                                      ? '2px solid #D4AF37' 
                                      : '1px solid rgba(139, 115, 85, 0.1)',
                                    borderRadius: '12px',
                                    background: selectedServices.find(s => s._id === service._id)
                                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 115, 85, 0.1) 100%)'
                                      : 'rgba(255, 255, 255, 0.9)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': { 
                                      transform: 'translateY(-4px)', 
                                      boxShadow: '0 12px 32px rgba(139, 115, 85, 0.2)'
                                    }
                                  }}
                                  onClick={() => handleServiceSelect(service)}
                                >
                                  <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                                          {service.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                          <Chip 
                                            icon={<Schedule />} 
                                            label={`${service.duration} min`} 
                                            size="small" 
                                            sx={{ 
                                              background: 'rgba(139, 115, 85, 0.1)',
                                              color: 'text.secondary',
                                              fontWeight: 500
                                            }}
                                          />
                                          <Chip 
                                            icon={<AttachMoney />} 
                                            label={`${service.price}€`} 
                                            size="small" 
                                            sx={{ 
                                              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                                              color: 'white',
                                              fontWeight: 600
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                      <Box
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          borderRadius: '50%',
                                          border: '2px solid',
                                          borderColor: selectedServices.find(s => s._id === service._id) 
                                            ? 'primary.main' 
                                            : 'rgba(139, 115, 85, 0.3)',
                                          background: selectedServices.find(s => s._id === service._id) 
                                            ? 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)' 
                                            : 'transparent',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          ml: 2,
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        {selectedServices.find(s => s._id === service._id) && (
                                          <CheckCircle sx={{ color: 'white', fontSize: 16 }} />
                                        )}
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Slide>
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                </Fade>
              ))}
              
              {selectedServices.length > 0 && (
                <Grow in timeout={600}>
                  <Card
                    sx={{
                      mt: 3,
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2E7D32', mb: 1 }}>
                      Service sélectionné
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2E7D32' }}>
                      {selectedServices.map(s => s.name).join(', ')} - {selectedServices.reduce((total, s) => total + s.price, 0)}€
                    </Typography>
                  </Card>
                </Grow>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Person sx={{ fontSize: 64, color: '#D4B996', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                Choisissez votre coiffeuse
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {coiffeuses.map((coiffeuse) => (
                <Grid item xs={12} sm={6} md={4} key={coiffeuse._id}>
                  <Card 
                    elevation={selectedCoiffeuse?._id === coiffeuse._id ? 3 : 1}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedCoiffeuse?._id === coiffeuse._id ? '2px solid #D4B996' : '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
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
                          bgcolor: '#D4B996',
                          fontSize: '2rem'
                        }}
                      >
                        {coiffeuse.firstName?.charAt(0)}{coiffeuse.lastName?.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                        {coiffeuse.firstName} {coiffeuse.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', mt: 1 }}>
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
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <CalendarToday sx={{ fontSize: 64, color: '#D4B996', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
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
                    '&.Mui-focused fieldset': {
                      borderColor: '#D4B996'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        );

      case 4:
        return (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <AccessTime sx={{ fontSize: 64, color: '#D4B996', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                Choisissez un créneau
              </Typography>
              {selectedDate && (
                <Typography variant="body1" sx={{ color: '#666666', mt: 1 }}>
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
                        borderColor: '#D4B996',
                        color: selectedSlot === slot ? 'white' : '#D4B996',
                        backgroundColor: selectedSlot === slot ? '#D4B996' : 'transparent',
                        '&:hover': {
                          backgroundColor: selectedSlot === slot ? '#c4a985' : 'rgba(212, 185, 150, 0.1)'
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
                <Typography variant="body1" sx={{ color: '#666666' }}>
                  Aucun créneau disponible pour cette date.
                </Typography>
                <Typography variant="body2" sx={{ color: '#999999', mt: 1 }}>
                  Veuillez choisir une autre date.
                </Typography>
              </Box>
            )}
          </Paper>
        );

      case 5:
        return (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Payment sx={{ fontSize: 64, color: '#D4B996', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                Paiement
              </Typography>
            </Box>

            {selectedServices.length > 0 && selectedCoiffeuse && selectedDate && selectedSlot ? (
              <>
                <Card elevation={1} sx={{ mb: 3, backgroundColor: '#f8f4f0' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
                      Récapitulatif de votre réservation
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Service:</strong> {selectedServices.map(s => s.name).join(', ')}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Coiffeuse:</strong> {selectedCoiffeuse.firstName} {selectedCoiffeuse.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('fr-FR')}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Heure:</strong> {selectedSlot}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', textAlign: 'center' }}>
                      Total: {selectedServices.reduce((total, s) => total + s.price, 0)} €
                    </Typography>
                  </CardContent>
                </Card>

                {paymentError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {paymentError}
                  </Alert>
                )}

                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
                  Choisissez votre mode de paiement
                </Typography>

                <Grid container spacing={3}>
                  {/* Pay at Salon Option */}
                  <Grid item xs={12} md={6}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                        border: '2px solid #D4B996'
                      }}
                      onClick={() => handlePaymentSuccess({ paymentMethod: 'cash' })}
                    >
                      <Box sx={{ mb: 2 }}>
                        <Store sx={{ fontSize: 48, color: '#D4B996' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Payer au salon
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        Réglez votre service directement au salon en espèces ou par carte
                      </Typography>
                      <Button
                        variant="contained"
                        disabled={loading}
                        sx={{
                          backgroundColor: '#D4B996',
                          color: 'white',
                          '&:hover': { backgroundColor: '#c4a986' },
                          width: '100%'
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Réserver - Payer au salon'}
                      </Button>
                    </Card>
                  </Grid>

                  {/* PayPal Option - Re-enabled */}
                  <Grid item xs={12} md={6}>
                    <Card 
                      elevation={1} 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        border: '2px solid #0070ba',
                        '&:hover': {
                          borderColor: '#005ea6',
                          boxShadow: 2
                        }
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <CreditCard sx={{ fontSize: 48, color: '#0070ba' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2c2c2c' }}>
                        Paiement en ligne
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                        PayPal / Carte bancaire
                      </Typography>
                      
                      <PayPalScriptProvider options={paypalOptions}>
                        <PayPalButtons
                          style={{ layout: "vertical" }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              purchase_units: [
                                {
                                  amount: {
                                    value: selectedServices.reduce((total, s) => total + s.price, 0).toFixed(2),
                                    currency_code: "USD"
                                  },
                                  description: `Réservation salon - ${selectedServices.map(s => s.name).join(', ')}`
                                }
                              ]
                            });
                          }}
                          onApprove={async (data, actions) => {
                            const order = await actions.order.capture();
                            await handlePaymentSuccess({
                              paypalOrderId: order.id,
                              paypalPaymentId: order.purchase_units[0].payments.captures[0].id,
                              paymentMethod: 'paypal'
                            });
                          }}
                          onError={(err) => {
                            console.error('PayPal Error:', err);
                            setPaymentError('Erreur lors du paiement PayPal');
                          }}
                        />
                      </PayPalScriptProvider>
                      
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666666' }}>
                        Paiement sécurisé par PayPal
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }}>
                  💡 En choisissant "Payer au salon", votre réservation sera confirmée et vous pourrez régler sur place.
                </Alert>
              </>
            ) : (
              <Alert severity="error">
                Impossible de charger le récapitulatif. Veuillez réessayer.
              </Alert>
            )}
          </Paper>
        );

      case 6:
        return (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2 }}>
              Réservation confirmée !
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666', mb: 1 }}>
              Votre paiement a été effectué avec succès.
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666', mb: 4 }}>
              Un email de confirmation vous sera envoyé prochainement.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard-client')}
              sx={{
                bgcolor: '#2c2c2c',
                color: '#ffffff',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                '&:hover': { bgcolor: '#1a1a1a' }
              }}
            >
              Aller à mon tableau de bord
            </Button>
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
                textAlign: 'center',
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
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <CalendarToday sx={{ color: 'white', fontSize: 40 }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                {isModifying ? 'Modifier ma réservation' : 'Réservation Express'}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.95,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                {isModifying 
                  ? 'Modifiez la date et l\'heure de votre rendez-vous en toute simplicité' 
                  : 'Réservez votre service de beauté en quelques étapes simples et rapides'
                }
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {/* Modern Progress */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Étape {activeStep + 1} sur {steps.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {Math.round(((activeStep + 1) / steps.length) * 100)}% complété
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(activeStep + 1) / steps.length * 100} 
                  sx={{ 
                    height: 8, 
                    borderRadius: '4px',
                    backgroundColor: 'rgba(139, 115, 85, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                      borderRadius: '4px'
                    }
                  }} 
                />
              </Box>
              
              {/* Current Step Info */}
              <Card sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
                border: '1px solid rgba(139, 115, 85, 0.1)',
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  {steps[activeStep]}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {activeStep === 0 && "Prenez connaissance de nos conditions"}
                  {activeStep === 1 && "Sélectionnez le service qui vous convient"}
                  {activeStep === 2 && "Choisissez votre styliste préféré"}
                  {activeStep === 3 && "Sélectionnez votre date de rendez-vous"}
                  {activeStep === 4 && "Choisissez l'heure qui vous convient"}
                  {activeStep === 5 && "Finalisez votre réservation"}
                  {activeStep === 6 && "Votre réservation est confirmée"}
                </Typography>
              </Card>
            </CardContent>
          </Card>
        </Fade>

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
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Step Content */}
        <Slide direction="left" in timeout={600}>
          <Box>
            {renderStepContent(activeStep)}
          </Box>
        </Slide>

        {/* Modern Navigation Buttons */}
        {activeStep !== 6 && (
          <Fade in timeout={800}>
            <Card
              sx={{
                mt: 4,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 115, 85, 0.1)',
                boxShadow: '0 8px 24px rgba(44, 44, 44, 0.08)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    startIcon={<ArrowBack />}
                    sx={{ 
                      borderRadius: '50px',
                      px: 3,
                      py: 1.5,
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        background: 'rgba(139, 115, 85, 0.05)'
                      },
                      '&:disabled': { 
                        color: '#cccccc',
                        cursor: 'not-allowed'
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
                      borderRadius: '50px',
                      px: 4,
                      py: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #8B7355 0%, #D4AF37 100%)',
                      color: 'white',
                      boxShadow: '0 8px 24px rgba(139, 115, 85, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s ease'
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6B5842 0%, #B8941F 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(139, 115, 85, 0.4)',
                        '&::before': {
                          left: '100%'
                        }
                      },
                      '&:disabled': { 
                        background: '#E5E0D8',
                        color: '#8A8A8A',
                        transform: 'none',
                        boxShadow: 'none',
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    {activeStep === 4 ? 'Procéder au paiement' : 'Suivant'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Login Modal */}
        <Dialog
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Connexion requise</Typography>
              <IconButton onClick={() => setShowLoginModal(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
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