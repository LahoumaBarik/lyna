import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Fade
} from '@mui/material';
import {
  ContentCut,
  Person,
  Schedule,
  CalendarMonth,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Close,
  Work,
  AttachMoney,
  Phone,
  LocationOn,
  Visibility,
  AdminPanelSettings,
  Dashboard,
  Verified
} from '@mui/icons-material';
import WeeklyCalendar from '../components/WeeklyCalendar';
import axios from 'axios';

// Valid service categories
const CATEGORIES = [
  { value: 'cut', label: 'Coupe' },
  { value: 'color', label: 'Coloration' },
  { value: 'styling', label: 'Coiffage' },
  { value: 'treatment', label: 'Soin' },
  { value: 'extensions', label: 'Extensions' },
  { value: 'bridal', label: 'Mariée' },
  { value: 'mens', label: 'Homme' },
  { value: 'kids', label: 'Enfant' },
  { value: 'package', label: 'Package' }
];

// Extracted TabPanel to top-level
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );
}

function DashboardAdmin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  
  // Services State
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', duration: '', price: '', category: '' });
  const [editServiceId, setEditServiceId] = useState(null);
  const [serviceError, setServiceError] = useState('');
  const [serviceSuccess, setServiceSuccess] = useState('');
  
  // Coiffeuses State
  const [coiffeuses, setCoiffeuses] = useState([]);
  const [coiffeuseForm, setCoiffeuseForm] = useState({ firstName: '', lastName: '', phone: '', address: '', description: '' });
  const [editCoiffeuseId, setEditCoiffeuseId] = useState(null);
  const [coiffeuseError, setCoiffeuseError] = useState('');
  const [coiffeuseSuccess, setCoiffeuseSuccess] = useState('');
  
  // Disponibilités State
  const [dispos, setDispos] = useState([]);
  const [dispoForm, setDispoForm] = useState({ stylist: '', jour: '', heureDebut: '', heureFin: '' });
  const [editDispoId, setEditDispoId] = useState(null);
  const [dispoError, setDispoError] = useState('');
  const [dispoSuccess, setDispoSuccess] = useState('');
  const [selectedStylistForCalendar, setSelectedStylistForCalendar] = useState('');
  
  // Reservations State
  const [reservations, setReservations] = useState([]);
  const [reservationError, setReservationError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  
  // Stylist Applications State
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionData, setActionData] = useState({
    reviewNotes: '',
    rejectionMessage: '',
    interviewNotes: '',
    location: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Memoized filtered stylists
  const stylistUsers = useMemo(() => {
    return coiffeuses.filter(c => c.role === 'stylist');
  }, [coiffeuses]);

  // Auto-clear messages
  useEffect(() => {
    if (serviceSuccess) {
      const timer = setTimeout(() => setServiceSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [serviceSuccess]);

  useEffect(() => {
    if (coiffeuseSuccess) {
      const timer = setTimeout(() => setCoiffeuseSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [coiffeuseSuccess]);

  useEffect(() => {
    if (dispoSuccess) {
      const timer = setTimeout(() => setDispoSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [dispoSuccess]);

  // Load data based on active tab
  useEffect(() => {
    if (tab === 0) fetchServices();
    else if (tab === 1) fetchCoiffeuses();
    else if (tab === 2) {
      fetchCoiffeuses(); // Need stylists for disponibilités
      fetchDispos();
    }
    else if (tab === 3) fetchReservations();
    else if (tab === 4) fetchApplications();
  }, [tab]);

  // Refetch applications when filter changes
  useEffect(() => {
    if (tab === 4) {
      fetchApplications();
    }
  }, [statusFilter, page]);

  const handleForbidden = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  // Services API Functions
  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status !== 200) {
        setServiceError('Erreur lors du chargement des services');
        return;
      }
      setServices(res.data);
    } catch (err) {
      setServiceError('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  // Coiffeuses API Functions  
  const fetchCoiffeuses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/coiffeuses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status !== 200) {
        setCoiffeuseError('Erreur lors du chargement des coiffeuses');
        return;
      }
      setCoiffeuses(res.data);
    } catch (err) {
      setCoiffeuseError('Erreur lors du chargement des coiffeuses');
    } finally {
      setLoading(false);
    }
  };

  // Disponibilités API Functions
  const fetchDispos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const res = await axios.get('/disponibilites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status !== 200) {
        setDispoError('Erreur lors du chargement des disponibilités');
        return;
      }
      
      setDispos(res.data);
    } catch (err) {
      setDispoError('Erreur lors du chargement des disponibilités');
    } finally {
      setLoading(false);
    }
  };

  // Reservations API Functions
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/reservations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status !== 200) {
        setReservationError('Erreur lors du chargement des réservations');
        return;
      }
      
      setReservations(res.data);
    } catch (err) {
      setReservationError('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  // Stylist Applications API Functions
  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/stylist-applications?status=${statusFilter}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status !== 200) {
        throw new Error('Erreur lors du chargement des candidatures');
      }
      
      setApplications(response.data.applications);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationsError('Erreur lors du chargement des candidatures');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleViewApplication = async (applicationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/stylist-applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status !== 200) {
        throw new Error('Erreur lors du chargement de la candidature');
      }
      
      setSelectedApplication(response.data.application);
      setApplicationDialogOpen(true);
    } catch (error) {
      console.error('Error fetching application:', error);
      setApplicationsError('Erreur lors du chargement de la candidature');
    }
  };

  const handleAction = (type) => {
    setActionType(type);
    setActionData({
      reviewNotes: '',
      rejectionMessage: '',
      interviewNotes: '',
      location: ''
    });
    setActionDialogOpen(true);
  };

  const submitAction = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('accessToken');
      const url = `/stylist-applications/${selectedApplication._id}`;
      
      let endpoint = '';
      let payload = {};
      
      switch (actionType) {
        case 'approve':
          endpoint = '/approve';
          payload = { reviewNotes: actionData.reviewNotes };
          break;
        case 'reject':
          endpoint = '/reject';
          payload = { rejectionMessage: actionData.rejectionMessage };
          break;
        case 'interview':
          endpoint = '/request-interview';
          payload = { 
            interviewNotes: actionData.interviewNotes,
            location: actionData.location
          };
          break;
        default:
          throw new Error('Action type invalide');
      }
      
      const response = await axios.put(`${url}${endpoint}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status !== 200) {
        throw new Error('Erreur lors de l\'action');
      }
      
      setActionDialogOpen(false);
      setActionData({ reviewNotes: '', rejectionMessage: '', interviewNotes: '', location: '' });
      fetchApplications();
    } catch (error) {
      console.error('Error submitting action:', error);
      setApplicationsError('Erreur lors de l\'action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      interview_requested: 'Entretien demandé'
    };
    return labels[status] || status;
  };

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    interview_requested: 'info'
  };

  // Service Handlers
  const handleServiceChange = useCallback((e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServiceError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setServiceError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      const method = editServiceId ? 'PUT' : 'POST';
      const url = editServiceId ? `/services/${editServiceId}` : `/services`;
      
      // Prepare payload with proper types
      const payload = {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim(),
        duration: parseInt(serviceForm.duration, 10),
        price: parseFloat(serviceForm.price),
        category: serviceForm.category
      };

      const res = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 403) {
        setServiceError('Accès refusé : admin uniquement.');
        handleForbidden();
        return;
      }

      if (res.status === 401) {
        setServiceError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      let data;
      try {
        const responseText = res.data;
        
        if (responseText && typeof responseText === 'object') {
          data = responseText;
        } else {
          console.error('Empty response body');
          setServiceError(`Erreur serveur (${res.status}): Réponse vide`);
          return;
        }
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        setServiceError(`Erreur serveur (${res.status}): ${res.statusText}`);
        return;
      }

      if (res.status !== 200) {
        console.error('Server response error:', data);
        
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          setServiceError(data.errors.join(', '));
        } else if (data.missing) {
          const missingFields = Object.keys(data.missing).filter(key => data.missing[key]);
          setServiceError(`Champs manquants: ${missingFields.join(', ')}`);
        } else if (typeof data.message === 'string') {
          setServiceError(data.message);
        } else if (typeof data.error === 'string') {
          setServiceError(data.error);
        } else {
          setServiceError(`Erreur ${res.status}: ${res.statusText || 'Erreur inconnue'}`);
        }
        return;
      }

      setServiceForm({ name: '', description: '', duration: '', price: '', category: '' });
      setEditServiceId(null);
      setServiceSuccess(editServiceId ? 'Service modifié !' : 'Service ajouté !');
      fetchServices();
    } catch (err) {
      console.error('Service submission error:', err);
      console.error('Error type:', typeof err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Handle different types of errors more safely
      let errorMessage = 'Erreur de connexion inconnue';
      
      if (err && typeof err === 'object') {
        if (typeof err.message === 'string' && err.message.trim()) {
          errorMessage = err.message;
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage = 'Erreur de connexion au serveur';
        } else if (err.name === 'SyntaxError') {
          errorMessage = 'Erreur de format de réponse du serveur';
        } else {
          errorMessage = `Erreur: ${err.name || 'Erreur inconnue'}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setServiceError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceEdit = (service) => {
    setServiceForm({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category
    });
    setEditServiceId(service._id);
  };

  const handleServiceDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 403) {
        setServiceError('Accès refusé : admin uniquement.');
        handleForbidden();
        return;
      }

      if (res.status === 401) {
        setServiceError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      setServiceSuccess('Service supprimé !');
      fetchServices();
    } catch (err) {
      setServiceError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Coiffeuse Handlers
  const handleCoiffeuseChange = useCallback((e) => {
    const { name, value } = e.target;
    setCoiffeuseForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCoiffeuseSubmit = async (e) => {
    e.preventDefault();
    setCoiffeuseError('');
    setCoiffeuseSuccess('');
    setLoading(true);

    try {
      // Frontend validation
      const { firstName, lastName, phone, address, description } = coiffeuseForm;
      
      if (!firstName?.trim() || !lastName?.trim()) {
        setCoiffeuseError('Le prénom et le nom de famille sont requis');
        setLoading(false);
        return;
      }

      if (firstName.trim().length < 2 || lastName.trim().length < 2) {
        setCoiffeuseError('Le prénom et le nom doivent contenir au moins 2 caractères');
        setLoading(false);
        return;
      }

      // Validate phone format if provided
      if (phone && !/^\+?[\d\s\-\(\)]{8,}$/.test(phone)) {
        setCoiffeuseError('Format de téléphone invalide');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setCoiffeuseError('Token d\'authentification manquant');
        handleForbidden();
        return;
      }

      const method = editCoiffeuseId ? 'PUT' : 'POST';
      const url = editCoiffeuseId ? `/coiffeuses/${editCoiffeuseId}` : `/coiffeuses`;

      let body = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || '',
        stylistInfo: {
          businessName: coiffeuseForm.businessName || '',
          address: address?.trim() || '',
          description: description?.trim() || ''
        }
      };

      if (!editCoiffeuseId) {
        body.email = `${firstName.toLowerCase().replace(/\s/g, '')}.${lastName.toLowerCase().replace(/\s/g, '')}@she.com`;
        body.password = 'password123';
      }

      const res = await axios({
        method,
        url,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setCoiffeuseError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      const data = res.data;
      if (res.status !== 200) {
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          setCoiffeuseError(data.errors.join(', '));
        } else if (data.missing) {
          const missingFields = Object.keys(data.missing).filter(key => data.missing[key]);
          setCoiffeuseError(`Champs manquants: ${missingFields.join(', ')}`);
        } else {
          setCoiffeuseError(data.message || 'Erreur API');
        }
        return;
      }

      setCoiffeuseForm({ firstName: '', lastName: '', phone: '', address: '', description: '' });
      setEditCoiffeuseId(null);
      setCoiffeuseSuccess(editCoiffeuseId ? 'Coiffeuse modifiée !' : 'Coiffeuse ajoutée !');
      fetchCoiffeuses();
    } catch (err) {
      console.error('Coiffeuse submission error:', err);
      setCoiffeuseError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCoiffeuseEdit = (coiffeuse) => {
    setCoiffeuseForm({
      firstName: coiffeuse.firstName,
      lastName: coiffeuse.lastName,
      phone: coiffeuse.phone || '',
      address: coiffeuse.stylistInfo?.address || '',
      description: coiffeuse.stylistInfo?.description || ''
    });
    setEditCoiffeuseId(coiffeuse._id);
  };

  const handleCoiffeuseDelete = async (id) => {
    if (!window.confirm('Supprimer cette coiffeuse ?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.delete(`/coiffeuses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        setCoiffeuseError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      setCoiffeuseSuccess('Coiffeuse supprimée !');
      fetchCoiffeuses();
    } catch (err) {
      setCoiffeuseError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Disponibilité Handlers
  const handleDispoChange = useCallback((e) => {
    const { name, value } = e.target;
    setDispoForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDispoSubmit = async (e) => {
    e.preventDefault();
    setDispoError('');
    setDispoSuccess('');
    setLoading(true);

    try {
      // Frontend validation
      const { stylist, jour, heureDebut, heureFin } = dispoForm;
      
      if (!stylist || !jour || !heureDebut || !heureFin) {
        setDispoError('Tous les champs sont requis');
        setLoading(false);
        return;
      }

      // Validate stylist ID format
      if (!/^[0-9a-fA-F]{24}$/.test(stylist)) {
        setDispoError('ID de styliste invalide');
        setLoading(false);
        return;
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(jour)) {
        setDispoError('Format de date invalide (YYYY-MM-DD)');
        setLoading(false);
        return;
      }

      // Validate time formats
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(heureDebut)) {
        setDispoError('Format d\'heure de début invalide (HH:mm)');
        setLoading(false);
        return;
      }

      if (!timeRegex.test(heureFin)) {
        setDispoError('Format d\'heure de fin invalide (HH:mm)');
        setLoading(false);
        return;
      }

      // Validate that end time is after start time
      const [startHour, startMin] = heureDebut.split(':').map(Number);
      const [endHour, endMin] = heureFin.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        setDispoError('L\'heure de fin doit être après l\'heure de début');
        setLoading(false);
        return;
      }

      // Validate that the date is not in the past
      const selectedDate = new Date(jour + 'T00:00:00.000Z');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setDispoError('Impossible de créer une disponibilité dans le passé');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setDispoError('Token d\'authentification manquant');
        handleForbidden();
        return;
      }

      const method = editDispoId ? 'PUT' : 'POST';
      const url = editDispoId ? `/disponibilites/${editDispoId}` : `/disponibilites`;

      const payload = {
        stylist,
        jour,
        heureDebut,
        heureFin
      };

      const res = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setDispoError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      let data;
      try {
        const responseText = res.data;
        
        if (responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          console.error('Empty response body for disponibilité');
          setDispoError(`Erreur serveur (${res.status}): Réponse vide`);
          return;
        }
      } catch (parseError) {
        console.error('Failed to parse disponibilité response as JSON:', parseError);
        setDispoError(`Erreur serveur (${res.status}): ${res.statusText}`);
        return;
      }

      if (res.status !== 200) {
        console.error('Disponibilité server response error:', data);
        
        // Handle validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          setDispoError(data.errors.join(', '));
        } else if (data.missing) {
          const missingFields = Object.keys(data.missing).filter(key => data.missing[key]);
          setDispoError(`Champs manquants: ${missingFields.join(', ')}`);
        } else {
          setDispoError(data.message || 'Erreur API');
        }
        return;
      }

      setDispoForm({ stylist: '', jour: '', heureDebut: '', heureFin: '' });
      setEditDispoId(null);
      setDispoSuccess(editDispoId ? 'Disponibilité modifiée !' : 'Disponibilité ajoutée !');
      fetchDispos();
    } catch (err) {
      console.error('Disponibilite submission error:', err);
      setDispoError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDispoEdit = (dispo) => {
    const date = new Date(dispo.jour);
    const formattedDate = date.toISOString().split('T')[0];

    setDispoForm({
      stylist: typeof dispo.stylist === 'object' ? dispo.stylist._id : dispo.stylist,
      jour: formattedDate,
      heureDebut: dispo.heureDebut,
      heureFin: dispo.heureFin
    });
    setEditDispoId(dispo._id);
  };

  const handleDispoDelete = async (id) => {
    if (!window.confirm('Supprimer cette disponibilité ?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.delete(`/disponibilites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        setDispoError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      setDispoSuccess('Disponibilité supprimée !');
      fetchDispos();
    } catch (err) {
      setDispoError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Reservation Handlers
  const handleReservationEdit = (reservation) => {
    // This function is not yet implemented for reservations
    // For now, it will just open the dialog
    setSelectedReservation(reservation);
    setReservationDialogOpen(true);
  };

  const handleReservationDelete = async (id) => {
    if (!window.confirm('Supprimer cette réservation ?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.delete(`/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        setReservationError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      setReservationSuccess('Réservation supprimée !');
      fetchReservations();
    } catch (err) {
      setReservationError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, pt: { xs: 12, sm: 14 }, pb: 6 }}>
        {/* Modern Admin Header */}
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
                  <AdminPanelSettings sx={{ fontSize: 40 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                    Panneau d'Administration
                  </Typography>
                  <Chip
                    icon={<Verified />}
                    label="Accès Administrateur"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: 600,
                      mb: 1
                    }}
                  />
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                    Gérez les services, stylistes, disponibilités et réservations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
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
            Tableau de bord Admin
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              fontWeight: 400
            }}
          >
            Gestion complète de votre salon
          </Typography>
        </Paper>

        {/* Navigation Tabs */}
        <Fade in timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 6, 
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={tab}
              onChange={(e, newValue) => setTab(newValue)}
              centered
              sx={{
                '& .MuiTab-root': {
                  color: '#666666',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  minHeight: 72,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    color: '#8B7355'
                  },
                  '&:hover': {
                    color: '#8B7355',
                    backgroundColor: 'rgba(139, 115, 85, 0.05)'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8B7355',
                  height: 4,
                  borderRadius: '2px'
                }
              }}
            >
              <Tab 
                label="Services" 
                icon={<ContentCut />} 
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
              <Tab 
                label="Coiffeuses" 
                icon={<Person />} 
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
              <Tab 
                label="Disponibilités" 
                icon={<Schedule />} 
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
              <Tab 
                label="Réservations" 
                icon={<CalendarMonth />} 
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
              <Tab 
                label="Candidatures" 
                icon={<Work />} 
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
            </Tabs>
          </Paper>
        </Fade>

        {/* Tab Content */}
        <Fade in timeout={1000}>
          <Box>
            {/* Services Tab */}
            <TabPanel value={tab} index={0}>
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
                    <ContentCut sx={{ color: '#8B7355', fontSize: 32 }} />
                    Gestion des Services
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {/* Service Form */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      mb: 4,
                      borderRadius: '16px',
                      background: 'rgba(139, 115, 85, 0.02)',
                      border: '1px solid rgba(139, 115, 85, 0.1)'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c2c2c' }}>
                      {editServiceId ? 'Modifier le service' : 'Ajouter un nouveau service'}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nom du service"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
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
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Catégorie</InputLabel>
                          <Select
                            value={serviceForm.category}
                            onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                            sx={{
                              borderRadius: '12px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(139, 115, 85, 0.3)'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8B7355'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8B7355'
                              }
                            }}
                          >
                            {CATEGORIES.map((cat) => (
                              <MenuItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Durée (minutes)"
                          type="number"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
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
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Prix (€)"
                          type="number"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
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
                          label="Description"
                          multiline
                          rows={3}
                          value={serviceForm.description}
                          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
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
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          {editServiceId && (
                            <Button
                              onClick={() => {
                                setEditServiceId(null);
                                setServiceForm({ name: '', description: '', duration: '', price: '', category: '' });
                              }}
                              sx={{
                                color: '#666666',
                                borderRadius: '25px',
                                px: 4,
                                py: 1.5,
                                fontWeight: 600
                              }}
                            >
                              Annuler
                            </Button>
                          )}
                          <Button
                            onClick={handleServiceSubmit}
                            variant="contained"
                            startIcon={editServiceId ? <Save /> : <Add />}
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
                            {editServiceId ? 'Modifier' : 'Ajouter'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Services List */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c2c2c' }}>
                      Services existants
                    </Typography>
                    <Grid container spacing={3}>
                      {services.map((service) => (
                        <Grid item xs={12} md={6} lg={4} key={service._id}>
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Chip
                                  label={CATEGORIES.find(c => c.value === service.category)?.label || service.category}
                                  size="small"
                                  sx={{
                                    background: 'rgba(139, 115, 85, 0.1)',
                                    color: '#8B7355',
                                    fontWeight: 600,
                                    borderRadius: '20px'
                                  }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleServiceEdit(service)}
                                    sx={{ color: '#8B7355' }}
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleServiceDelete(service._id)}
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 1 }}>
                                {service.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                                {service.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#8B7355', fontWeight: 600 }}>
                                  {service.duration} min
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#2c2c2c', fontWeight: 700 }}>
                                  {service.price}€
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Coiffeuses Tab */}
            <TabPanel value={tab} index={1}>
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
                    <Person sx={{ color: '#8B7355', fontSize: 32 }} />
                    Gestion des Coiffeuses
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {/* Coiffeuse Form */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      mb: 4,
                      borderRadius: '16px',
                      background: 'rgba(139, 115, 85, 0.02)',
                      border: '1px solid rgba(139, 115, 85, 0.1)'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c2c2c' }}>
                      {editCoiffeuseId ? 'Modifier la coiffeuse' : 'Ajouter une nouvelle coiffeuse'}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          value={coiffeuseForm.firstName}
                          onChange={(e) => setCoiffeuseForm({ ...coiffeuseForm, firstName: e.target.value })}
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
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          value={coiffeuseForm.lastName}
                          onChange={(e) => setCoiffeuseForm({ ...coiffeuseForm, lastName: e.target.value })}
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
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Téléphone"
                          value={coiffeuseForm.phone}
                          onChange={(e) => setCoiffeuseForm({ ...coiffeuseForm, phone: e.target.value })}
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
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Adresse"
                          value={coiffeuseForm.address}
                          onChange={(e) => setCoiffeuseForm({ ...coiffeuseForm, address: e.target.value })}
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
                          label="Description"
                          multiline
                          rows={3}
                          value={coiffeuseForm.description}
                          onChange={(e) => setCoiffeuseForm({ ...coiffeuseForm, description: e.target.value })}
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
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          {editCoiffeuseId && (
                            <Button
                              onClick={() => {
                                setEditCoiffeuseId(null);
                                setCoiffeuseForm({ firstName: '', lastName: '', phone: '', address: '', description: '' });
                              }}
                              sx={{
                                color: '#666666',
                                borderRadius: '25px',
                                px: 4,
                                py: 1.5,
                                fontWeight: 600
                              }}
                            >
                              Annuler
                            </Button>
                          )}
                          <Button
                            onClick={handleCoiffeuseSubmit}
                            variant="contained"
                            startIcon={editCoiffeuseId ? <Save /> : <Add />}
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
                            {editCoiffeuseId ? 'Modifier' : 'Ajouter'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Coiffeuses List */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c2c2c' }}>
                      Coiffeuses existantes
                    </Typography>
                    <Grid container spacing={3}>
                      {coiffeuses.map((coiffeuse) => (
                        <Grid item xs={12} md={6} lg={4} key={coiffeuse._id}>
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
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: '#8B7355',
                                    width: 48,
                                    height: 48,
                                    fontSize: '1.25rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {coiffeuse.firstName?.charAt(0)}{coiffeuse.lastName?.charAt(0)}
                                </Avatar>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCoiffeuseEdit(coiffeuse)}
                                    sx={{ color: '#8B7355' }}
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCoiffeuseDelete(coiffeuse._id)}
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 1 }}>
                                {coiffeuse.firstName} {coiffeuse.lastName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                                {coiffeuse.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Phone sx={{ fontSize: 16, color: '#8B7355' }} />
                                  <Typography variant="body2" sx={{ color: '#666666' }}>
                                    {coiffeuse.phone}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationOn sx={{ fontSize: 16, color: '#8B7355' }} />
                                  <Typography variant="body2" sx={{ color: '#666666' }}>
                                    {coiffeuse.address && typeof coiffeuse.address === 'object' 
                                      ? `${coiffeuse.address.street || ''} ${coiffeuse.address.city || ''} ${coiffeuse.address.state || ''} ${coiffeuse.address.zipCode || ''}`.trim()
                                      : coiffeuse.address || 'Adresse non disponible'
                                    }
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Disponibilités Tab */}
            <TabPanel value={tab} index={2}>
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
                    <Schedule sx={{ color: '#8B7355', fontSize: 32 }} />
                    Gestion des Disponibilités
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {/* Disponibilité Form */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      mb: 4,
                      borderRadius: '16px',
                      background: 'rgba(139, 115, 85, 0.02)',
                      border: '1px solid rgba(139, 115, 85, 0.1)'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c2c2c' }}>
                      {editDispoId ? 'Modifier la disponibilité' : 'Ajouter une nouvelle disponibilité'}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Coiffeuse</InputLabel>
                          <Select
                            name="stylist"
                            value={dispoForm.stylist}
                            onChange={handleDispoChange}
                            label="Coiffeuse"
                            sx={{
                              borderRadius: '12px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(139, 115, 85, 0.3)'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8B7355'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8B7355'
                              }
                            }}
                          >
                            {stylistUsers.map(stylist => (
                              <MenuItem key={stylist._id} value={stylist._id}>
                                {stylist.firstName} {stylist.lastName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="jour"
                          label="Date"
                          type="date"
                          value={dispoForm.jour}
                          onChange={handleDispoChange}
                          InputLabelProps={{ shrink: true }}
                          required
                          size="small"
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
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="heureDebut"
                          label="Heure début"
                          type="time"
                          value={dispoForm.heureDebut}
                          onChange={handleDispoChange}
                          InputLabelProps={{ shrink: true }}
                          required
                          size="small"
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
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="heureFin"
                          label="Heure fin"
                          type="time"
                          value={dispoForm.heureFin}
                          onChange={handleDispoChange}
                          InputLabelProps={{ shrink: true }}
                          required
                          size="small"
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
                      <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={editDispoId ? <Save /> : <Add />}
                            disabled={loading}
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
                              },
                              flex: 1
                            }}
                          >
                            {editDispoId ? 'Modifier' : 'Ajouter'}
                          </Button>
                          {editDispoId && (
                            <IconButton
                              onClick={() => {
                                setEditDispoId(null);
                                setDispoForm({ stylist: '', jour: '', heureDebut: '', heureFin: '' });
                              }}
                              sx={{ color: '#8B7355' }}
                            >
                              <Cancel />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Weekly Calendar View */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2 }}>
                      Vue Calendrier Hebdomadaire
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Sélectionner un styliste</InputLabel>
                      <Select
                        value={selectedStylistForCalendar || ''}
                        onChange={(e) => setSelectedStylistForCalendar(e.target.value)}
                        label="Sélectionner un styliste"
                        sx={{
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(139, 115, 85, 0.3)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8B7355'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8B7355'
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>Tous les stylistes</em>
                        </MenuItem>
                        {stylistUsers.map(stylist => (
                          <MenuItem key={stylist._id} value={stylist._id}>
                            {stylist.firstName} {stylist.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {selectedStylistForCalendar && (
                      <WeeklyCalendar 
                        user={user} 
                        isAdmin={true} 
                        selectedStylist={stylistUsers.find(s => s._id === selectedStylistForCalendar)}
                      />
                    )}
                  </Box>

                  {/* Disponibilités Table */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2 }}>
                      Disponibilités existantes
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Coiffeuse</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Heure début</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Heure fin</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dispos.map(dispo => (
                            <TableRow key={dispo._id} sx={{ '&:hover': { backgroundColor: '#f8f8f8' } }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Person sx={{ mr: 1, color: '#8B7355', fontSize: 18 }} />
                                  {dispo.stylist?.firstName || 'N/A'} {dispo.stylist?.lastName || ''}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {new Date(dispo.jour).toLocaleDateString('fr-FR', { 
                                  weekday: 'long', 
                                  day: 'numeric', 
                                  month: 'long', 
                                  timeZone: 'UTC' 
                                })}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={<Schedule />}
                                  label={dispo.heureDebut}
                                  size="small"
                                  sx={{ backgroundColor: '#e8f5e8' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={<Schedule />}
                                  label={dispo.heureFin}
                                  size="small"
                                  sx={{ backgroundColor: '#ffe8e8' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDispoEdit(dispo)}
                                    sx={{ color: '#8B7355' }}
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDispoDelete(dispo._id)}
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Reservations Tab */}
            <TabPanel value={tab} index={3}>
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
                    <CalendarMonth sx={{ color: '#8B7355', fontSize: 32 }} />
                    Gestion des Réservations
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {/* Reservations Table */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c2c2c' }}>
                      Réservations existantes
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Client</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Service</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Heure</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reservations.map(reservation => (
                            <TableRow key={reservation._id} sx={{ '&:hover': { backgroundColor: '#f8f8f8' } }}>
                              <TableCell>{reservation.client?.firstName} {reservation.client?.lastName}</TableCell>
                              <TableCell>{reservation.service?.name}</TableCell>
                              <TableCell>
                                {new Date(reservation.date).toLocaleDateString('fr-FR', { 
                                  weekday: 'long', 
                                  day: 'numeric', 
                                  month: 'long'
                                })}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={<Schedule />}
                                  label={reservation.startTime || reservation.heure || 'N/A'}
                                  size="small"
                                  sx={{ backgroundColor: '#e8f5e8' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleReservationDelete(reservation._id)}
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Candidatures Tab */}
            <TabPanel value={tab} index={4}>
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
                    <Work sx={{ color: '#8B7355', fontSize: 32 }} />
                    Gestion des Candidatures
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  {/* Candidatures Table */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                      Candidatures ({applications.length})
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Filtrer par statut</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Filtrer par statut"
                        sx={{
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(139, 115, 85, 0.3)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8B7355'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8B7355'
                          }
                        }}
                      >
                        <MenuItem value="all">Toutes les candidatures</MenuItem>
                        <MenuItem value="pending">En attente</MenuItem>
                        <MenuItem value="interview_requested">Entretien demandé</MenuItem>
                        <MenuItem value="approved">Approuvées</MenuItem>
                        <MenuItem value="rejected">Rejetées</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {applicationsLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : applications.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                      <Typography variant="body1" color="text.secondary">
                        Aucune candidature trouvée.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Candidat</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Expérience</TableCell>
                            <TableCell>Spécialisations</TableCell>
                            <TableCell>Soumis le</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {applications.map((application) => (
                            <TableRow key={application._id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="subtitle2">
                                    {application.applicant.firstName} {application.applicant.lastName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {application.applicant.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusLabel(application.status)}
                                  color={statusColors[application.status]}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {application.stylistInfo.experience.years} ans
                              </TableCell>
                              <TableCell>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {application.stylistInfo.specializations.slice(0, 2).map(spec => (
                                    <Chip
                                      key={spec}
                                      label={spec}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                  {application.stylistInfo.specializations.length > 2 && (
                                    <Chip
                                      label={`+${application.stylistInfo.specializations.length - 2}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {formatDate(application.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Voir les détails">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewApplication(application._id)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </Fade>

        {/* Application Detail Dialog */}
        <Dialog
          open={applicationDialogOpen}
          onClose={() => setApplicationDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Détails de la candidature
          </DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Informations du candidat
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Nom complet" 
                          secondary={`${selectedApplication.applicant.firstName} ${selectedApplication.applicant.lastName}`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Email" 
                          secondary={selectedApplication.applicant.email} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Téléphone" 
                          secondary={selectedApplication.applicant.phone || 'Non fourni'} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Informations professionnelles
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Expérience" 
                          secondary={`${selectedApplication.stylistInfo.experience.years} ans`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Spécialisations" 
                          secondary={selectedApplication.stylistInfo.specializations.join(', ')} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Niveau" 
                          secondary={selectedApplication.stylistInfo.level || 'Non spécifié'} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Motivation
                    </Typography>
                    <Typography variant="body2" sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      {selectedApplication.motivation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Disponibilité
                    </Typography>
                    <Typography variant="body2">
                      {selectedApplication.availability.immediate ? 'Disponible immédiatement' : 
                       `Disponible à partir du ${new Date(selectedApplication.availability.startDate).toLocaleDateString('fr-FR')}`}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Horaire préféré: {selectedApplication.availability.preferredSchedule.replace('_', ' ')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplicationDialogOpen(false)}>
              Fermer
            </Button>
            {selectedApplication && selectedApplication.status === 'pending' && (
              <>
                <Button 
                  onClick={() => handleAction('approve')}
                  color="success"
                  variant="contained"
                >
                  Approuver
                </Button>
                <Button 
                  onClick={() => handleAction('reject')}
                  color="error"
                  variant="contained"
                >
                  Rejeter
                </Button>
                <Button 
                  onClick={() => handleAction('interview')}
                  color="info"
                  variant="contained"
                >
                  Demander un entretien
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Action Dialog */}
        <Dialog
          open={actionDialogOpen}
          onClose={() => setActionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {actionType === 'approve' && 'Approuver la candidature'}
            {actionType === 'reject' && 'Rejeter la candidature'}
            {actionType === 'interview' && 'Demander un entretien'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {actionType === 'approve' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes de révision (Optionnel)"
                  value={actionData.reviewNotes}
                  onChange={(e) => setActionData(prev => ({ ...prev, reviewNotes: e.target.value }))}
                  helperText="Ajoutez des notes sur l'approbation"
                />
              )}

              {actionType === 'reject' && (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes de révision (Optionnel)"
                    value={actionData.reviewNotes}
                    onChange={(e) => setActionData(prev => ({ ...prev, reviewNotes: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message de rejet"
                    value={actionData.rejectionMessage}
                    onChange={(e) => setActionData(prev => ({ ...prev, rejectionMessage: e.target.value }))}
                    helperText="Ce message sera envoyé au candidat"
                  />
                </>
              )}

              {actionType === 'interview' && (
                <>
                  <TextField
                    fullWidth
                    label="Lieu de l'entretien"
                    value={actionData.location}
                    onChange={(e) => setActionData(prev => ({ ...prev, location: e.target.value }))}
                    sx={{ mb: 2 }}
                    helperText="Où aura lieu l'entretien"
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes d'entretien (Optionnel)"
                    value={actionData.interviewNotes}
                    onChange={(e) => setActionData(prev => ({ ...prev, interviewNotes: e.target.value }))}
                    helperText="Notes supplémentaires sur la demande d'entretien"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={submitAction}
              disabled={actionLoading}
              variant="contained"
              color={
                actionType === 'approve' ? 'success' :
                actionType === 'reject' ? 'error' : 'info'
              }
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Soumettre'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default DashboardAdmin;