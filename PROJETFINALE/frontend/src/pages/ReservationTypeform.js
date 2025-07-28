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
  LinearProgress
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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    fetch(API_URL + '/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data);
        }
      })
      .catch(err => setError('Erreur lors du chargement des services'));
  }, []);

  // Récupère les coiffeuses
  useEffect(() => {
    fetch(API_URL + '/coiffeuses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCoiffeuses(data.filter(c => c.role === 'stylist'));
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
        axios.get(API_URL + '/disponibilites/coiffeuse/' + pendingReservation.selectedCoiffeuse._id + '?date=' + date)
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
          const res = await fetch(API_URL + '/disponibilites/coiffeuse/' + selectedCoiffeuse._id + '?date=' + date);
          if (!res.ok) throw new Error('Erreur lors de la récupération des disponibilités');
          const disponibilites = await res.json();
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
        const response = await axios.patch(`${API_URL}/reservations/${originalReservation._id}`, {
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
        const response = await axios.post(API_URL + '/reservations', {
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
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <Info sx={{ fontSize: 64, color: '#D4B996', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2 }}>
                Politique du salon
              </Typography>
            </Box>
            
            <Card elevation={1} sx={{ mb: 3, borderLeft: '4px solid #D4B996' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
                  Politique d'annulation de rendez-vous
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                  Nous comprenons que des imprévus peuvent survenir, mais afin de garantir un service de qualité pour tous nos clients, nous vous demandons de bien vouloir respecter la politique d'annulation suivante :
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#D4B996' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Annulation ou modification"
                      secondary="Pour toute annulation ou modification de rendez-vous, nous demandons un préavis minimum de 48 heures."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#D4B996' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Retards"
                      secondary="En cas de retard, nous ferons de notre mieux pour vous recevoir, mais votre rendez-vous pourrait être écourté."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#D4B996' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Respect"
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
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box textAlign="center" sx={{ mb: 3 }}>
              <ContentCut sx={{ fontSize: 64, color: '#D4B996', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                Sélectionnez vos services
              </Typography>
            </Box>

            {categories.map(category => (
              <Accordion key={category} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ backgroundColor: '#f8f4f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                    {category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <RadioGroup value={selectedServices[0]?._id || ''}>
                    {groupedServices[category].map(service => (
                      <Card 
                        key={service._id}
                        elevation={selectedServices.find(s => s._id === service._id) ? 3 : 1}
                        sx={{ 
                          mb: 2, 
                          cursor: 'pointer',
                          border: selectedServices.find(s => s._id === service._id) ? '2px solid #D4B996' : '1px solid #e0e0e0',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                        }}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c' }}>
                                {service.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Chip 
                                  icon={<Schedule />} 
                                  label={service.duration + ' min'} 
                                  size="small" 
                                  sx={{ backgroundColor: '#f0f0f0' }}
                                />
                                <Chip 
                                  icon={<AttachMoney />} 
                                  label={service.price + ' '} 
                                  size="small" 
                                  color="primary"
                                  sx={{ backgroundColor: '#D4B996', color: 'white' }}
                                />
                              </Box>
                            </Box>
                            <FormControlLabel
                              control={
                                <Radio 
                                  checked={!!selectedServices.find(s => s._id === service._id)}
                                  sx={{ '&.Mui-checked': { color: '#D4B996' } }}
                                />
                              }
                              label=""
                            />
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
        background: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 100%)',
        pt: { xs: 10, sm: 12 },
        pb: 4
      }}
    >
      <Container maxWidth="md">
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
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#2c2c2c',
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}
          >
            {isModifying ? 'Modifier ma réservation' : 'Réservation'}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              fontWeight: 400
            }}
          >
            {isModifying 
              ? 'Modifiez la date et l\'heure de votre rendez-vous' 
              : 'Prenez rendez-vous en quelques étapes simples'
            }
          </Typography>
        </Paper>

        {/* Progress */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666666', textAlign: 'center' }}>
              Étape {activeStep + 1} sur {steps.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(activeStep + 1) / steps.length * 100} 
              sx={{ 
                mt: 1,
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#D4B996',
                  borderRadius: 4
                }
              }} 
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', textAlign: 'center' }}>
            {steps[activeStep]}
          </Typography>
        </Paper>

        {/* Success/Error Alerts */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        {renderStepContent(activeStep)}

        {/* Navigation Buttons */}
        {activeStep !== 6 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
              sx={{ 
                color: '#666666',
                '&:disabled': { color: '#cccccc' }
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
                bgcolor: '#2c2c2c',
                color: '#ffffff',
                '&:hover': { bgcolor: '#1a1a1a' },
                '&:disabled': { bgcolor: '#cccccc' }
              }}
            >
              {activeStep === 4 ? 'Procéder au paiement' : 'Suivant'}
            </Button>
          </Box>
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