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
  Divider
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
  Visibility
} from '@mui/icons-material';
import WeeklyCalendar from '../components/WeeklyCalendar';

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

const API_URL = 'http://localhost:5000/api';

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
      const res = await fetch(`${API_URL}/services`, {
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
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setServiceError('Erreur lors du chargement des services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Coiffeuses API Functions  
  const fetchCoiffeuses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/coiffeuses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setCoiffeuseError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }
      const data = await res.json();
      setCoiffeuses(Array.isArray(data) ? data : []);
    } catch (err) {
      setCoiffeuseError('Erreur lors du chargement des coiffeuses');
      setCoiffeuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Disponibilités API Functions
  const fetchDispos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${API_URL}/disponibilites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        setDispoError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }
      
      const data = await res.json();
      setDispos(Array.isArray(data) ? data : []);
    } catch (err) {
      setDispoError('Erreur lors du chargement des disponibilités');
      setDispos([]);
    } finally {
      setLoading(false);
    }
  };

  // Reservations API Functions
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        setReservationError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }
      
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setReservationError('Erreur lors du chargement des réservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Stylist Applications API Functions
  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/stylist-applications?status=${statusFilter}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 403) {
        setApplicationsError('Accès refusé : admin uniquement.');
        handleForbidden();
        return;
      }
      if (response.status === 401) {
        setApplicationsError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des candidatures');
      }
      
      const data = await response.json();
      setApplications(data.applications);
      setTotalPages(data.pagination.total);
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
      const response = await fetch(`${API_URL}/stylist-applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la candidature');
      }
      
      const data = await response.json();
      setSelectedApplication(data.application);
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
      const url = `${API_URL}/stylist-applications/${selectedApplication._id}`;
      
      let endpoint = '';
      let payload = {};
      
      switch (actionType) {
        case 'approve':
          endpoint = '/approve';
          payload = { reviewNotes: actionData.reviewNotes };
          break;
        case 'reject':
          endpoint = '/reject';
          payload = { 
            reviewNotes: actionData.reviewNotes,
            rejectionMessage: actionData.rejectionMessage 
          };
          break;
        case 'interview':
          endpoint = '/interview';
          payload = { 
            location: actionData.location,
            notes: actionData.interviewNotes 
          };
          break;
        default:
          throw new Error('Action type not supported');
      }
      
      const response = await fetch(`${url}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'action');
      }
      
      // Refresh applications list
      await fetchApplications();
      setActionDialogOpen(false);
      setApplicationDialogOpen(false);
      setSelectedApplication(null);
      
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
    setServiceError('');
    setServiceSuccess('');
    setLoading(true);

    try {
      // Frontend validation
      const { name, description, duration, price, category } = serviceForm;
      
      if (!name?.trim() || !description?.trim() || !duration || !price || !category) {
        setServiceError('Tous les champs sont requis');
        setLoading(false);
        return;
      }

      // Cast and validate duration
      const durationNumber = Number(duration);
      if (isNaN(durationNumber) || durationNumber < 15) {
        setServiceError('La durée doit être un nombre supérieur ou égal à 15 minutes');
        setLoading(false);
        return;
      }

      // Cast and validate price
      const priceNumber = Number(price);
      if (isNaN(priceNumber) || priceNumber < 0) {
        setServiceError('Le prix doit être un nombre positif');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setServiceError('Token d\'authentification manquant');
        handleForbidden();
        return;
      }

      const method = editServiceId ? 'PUT' : 'POST';
      const url = editServiceId ? `${API_URL}/services/${editServiceId}` : `${API_URL}/services`;
      
      // Prepare payload with proper types
      const payload = {
        name: name.trim(),
        description: description.trim(),
        duration: durationNumber,
        price: priceNumber,
        category: category.trim()
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
        const responseText = await res.text();
        
        if (responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          console.error('Empty response body');
          setServiceError(`Erreur serveur (${res.status}): Réponse vide`);
          return;
        }
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response text was:', parseError.responseText);
        setServiceError(`Erreur serveur (${res.status}): ${res.statusText}`);
        return;
      }

      if (!res.ok) {
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
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
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
      const url = editCoiffeuseId ? `${API_URL}/coiffeuses/${editCoiffeuseId}` : `${API_URL}/coiffeuses`;

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

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.status === 401) {
        setCoiffeuseError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
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
      const res = await fetch(`${API_URL}/coiffeuses/${id}`, {
        method: 'DELETE',
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
      const url = editDispoId ? `${API_URL}/disponibilites/${editDispoId}` : `${API_URL}/disponibilites`;

      const payload = {
        stylist,
        jour,
        heureDebut,
        heureFin
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setDispoError('Session expirée. Veuillez vous reconnecter.');
        handleForbidden();
        return;
      }

      let data;
      try {
        const responseText = await res.text();
        
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

      if (!res.ok) {
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
      const res = await fetch(`${API_URL}/disponibilites/${id}`, {
        method: 'DELETE',
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
      const res = await fetch(`${API_URL}/reservations/${id}`, {
        method: 'DELETE',
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
        background: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd4 100%)',
        pt: { xs: 10, sm: 12 },
        pb: 4
      }}
    >
      <Container maxWidth="xl">
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
        <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
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
                '&.Mui-selected': {
                  color: '#2c2c2c'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#D4B996',
                height: 3
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

        {/* Services Tab */}
        <TabPanel value={tab} index={0}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: '#ffffff' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 3, display: 'flex', alignItems: 'center' }}>
              <ContentCut sx={{ mr: 1, color: '#D4B996' }} />
              Gestion des services
            </Typography>

            {serviceSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setServiceSuccess('')}>
                {serviceSuccess}
              </Alert>
            )}
            {serviceError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setServiceError('')}>
                {serviceError}
              </Alert>
            )}

            {/* Service Form */}
            <Card elevation={1} sx={{ mb: 4, backgroundColor: '#f8f4f0' }}>
              <CardContent>
                <form onSubmit={handleServiceSubmit}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Nom du service"
                        value={serviceForm.name}
                        onChange={handleServiceChange}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        value={serviceForm.description}
                        onChange={handleServiceChange}
                        required
                        size="small"
                        multiline
                        rows={2}
                        helperText="Min. 10 caractères"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        name="duration"
                        label="Durée (min)"
                        type="number"
                        value={serviceForm.duration}
                        onChange={handleServiceChange}
                        required
                        size="small"
                        helperText="Min. 15 minutes"
                        inputProps={{ min: 15, max: 480 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        name="price"
                        label="Prix (€)"
                        type="number"
                        value={serviceForm.price}
                        onChange={handleServiceChange}
                        required
                        size="small"
                        helperText="Prix en euros"
                        inputProps={{ min: 0, max: 1000, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>Catégorie</InputLabel>
                        <Select
                          name="category"
                          value={serviceForm.category}
                          onChange={handleServiceChange}
                          label="Catégorie"
                        >
                          {CATEGORIES.map(cat => (
                            <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={editServiceId ? <Save /> : <Add />}
                      disabled={loading}
                      sx={{
                        bgcolor: '#D4B996',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#c4a985' },
                        '&:disabled': { bgcolor: '#cccccc', color: '#888888' }
                      }}
                    >
                      {editServiceId ? 'Modifier' : 'Ajouter'}
                    </Button>
                    {editServiceId && (
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setEditServiceId(null);
                          setServiceForm({ name: '', description: '', duration: '', price: '', category: '' });
                        }}
                        sx={{
                          borderColor: '#D4B996',
                          color: '#D4B996',
                          fontWeight: 600,
                          '&:hover': { borderColor: '#c4a985', backgroundColor: 'rgba(212, 185, 150, 0.1)' }
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </Box>
                </form>
              </CardContent>
            </Card>

            {/* Services Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Durée</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Prix</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Catégorie</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map(service => (
                      <TableRow key={service._id} sx={{ '&:hover': { backgroundColor: '#f8f8f8' } }}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<Schedule />}
                            label={`${service.duration} min`}
                            size="small"
                            sx={{ backgroundColor: '#f0f0f0' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<AttachMoney />}
                            label={`${service.price} €`}
                            size="small"
                            color="primary"
                            sx={{ backgroundColor: '#D4B996', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={service.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                onClick={() => handleServiceEdit(service)}
                                sx={{ color: '#D4B996' }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={() => handleServiceDelete(service._id)}
                                sx={{ color: '#f44336' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>

        {/* Coiffeuses Tab */}
        <TabPanel value={tab} index={1}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: '#ffffff' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 3, display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, color: '#D4B996' }} />
              Gestion des coiffeuses
            </Typography>

            {coiffeuseSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCoiffeuseSuccess('')}>
                {coiffeuseSuccess}
              </Alert>
            )}
            {coiffeuseError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCoiffeuseError('')}>
                {coiffeuseError}
              </Alert>
            )}

            {/* Coiffeuse Form */}
            <Card elevation={1} sx={{ mb: 4, backgroundColor: '#f8f4f0' }}>
              <CardContent>
                <form onSubmit={handleCoiffeuseSubmit}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        name="firstName"
                        label="Prénom"
                        value={coiffeuseForm.firstName}
                        onChange={handleCoiffeuseChange}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        name="lastName"
                        label="Nom"
                        value={coiffeuseForm.lastName}
                        onChange={handleCoiffeuseChange}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Téléphone"
                        value={coiffeuseForm.phone}
                        onChange={handleCoiffeuseChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        name="address"
                        label="Adresse"
                        value={coiffeuseForm.address}
                        onChange={handleCoiffeuseChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        value={coiffeuseForm.description}
                        onChange={handleCoiffeuseChange}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={editCoiffeuseId ? <Save /> : <Add />}
                      disabled={loading}
                      sx={{
                        bgcolor: '#D4B996',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#c4a985' },
                        '&:disabled': { bgcolor: '#cccccc', color: '#888888' }
                      }}
                    >
                      {editCoiffeuseId ? 'Modifier' : 'Ajouter'}
                    </Button>
                    {editCoiffeuseId && (
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setEditCoiffeuseId(null);
                          setCoiffeuseForm({ firstName: '', lastName: '', phone: '', address: '', description: '' });
                        }}
                        sx={{
                          borderColor: '#D4B996',
                          color: '#D4B996',
                          fontWeight: 600,
                          '&:hover': { borderColor: '#c4a985', backgroundColor: 'rgba(212, 185, 150, 0.1)' }
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </Box>
                </form>
              </CardContent>
            </Card>

            {/* Coiffeuses Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Prénom</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Téléphone</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Adresse</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c2c2c' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stylistUsers.map(coiffeuse => (
                      <TableRow key={coiffeuse._id} sx={{ '&:hover': { backgroundColor: '#f8f8f8' } }}>
                        <TableCell>{coiffeuse.firstName}</TableCell>
                        <TableCell>{coiffeuse.lastName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone sx={{ mr: 1, color: '#666666', fontSize: 16 }} />
                            {coiffeuse.phone || '-'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, color: '#666666', fontSize: 16 }} />
                            {coiffeuse.stylistInfo?.address || '-'}
                          </Box>
                        </TableCell>
                        <TableCell>{coiffeuse.stylistInfo?.description || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                onClick={() => handleCoiffeuseEdit(coiffeuse)}
                                sx={{ color: '#D4B996' }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={() => handleCoiffeuseDelete(coiffeuse._id)}
                                sx={{ color: '#f44336' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>

        {/* Disponibilités Tab */}
        <TabPanel value={tab} index={2}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: '#ffffff' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 3, display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1, color: '#D4B996' }} />
              Gestion des disponibilités
            </Typography>

            {dispoSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setDispoSuccess('')}>
                {dispoSuccess}
              </Alert>
            )}
            {dispoError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setDispoError('')}>
                {dispoError}
              </Alert>
            )}

            {/* Disponibilité Form */}
            <Card elevation={1} sx={{ mb: 4, backgroundColor: '#f8f4f0' }}>
              <CardContent>
                <form onSubmit={handleDispoSubmit}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>Coiffeuse</InputLabel>
                        <Select
                          name="stylist"
                          value={dispoForm.stylist}
                          onChange={handleDispoChange}
                          label="Coiffeuse"
                        >
                          {stylistUsers.map(stylist => (
                            <MenuItem key={stylist._id} value={stylist._id}>
                              {stylist.firstName} {stylist.lastName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
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
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
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
                            bgcolor: '#D4B996',
                            color: 'white',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#c4a985' },
                            '&:disabled': { bgcolor: '#cccccc', color: '#888888' },
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
                            sx={{ color: '#D4B996' }}
                          >
                            <Cancel />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>

            {/* Weekly Calendar View */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 2 }}>
                Vue Calendrier Hebdomadaire
              </Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Sélectionner un styliste</InputLabel>
                <Select
                  value={selectedStylistForCalendar || ''}
                  onChange={(e) => setSelectedStylistForCalendar(e.target.value)}
                  label="Sélectionner un styliste"
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
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
                            <Person sx={{ mr: 1, color: '#D4B996', fontSize: 18 }} />
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
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                onClick={() => handleDispoEdit(dispo)}
                                sx={{ color: '#D4B996' }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={() => handleDispoDelete(dispo._id)}
                                sx={{ color: '#f44336' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>

        {/* Reservations Tab */}
        <TabPanel value={tab} index={3}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: '#ffffff' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 3, display: 'flex', alignItems: 'center' }}>
              <CalendarMonth sx={{ mr: 1, color: '#D4B996' }} />
              Gestion des réservations
            </Typography>

            {reservationError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setReservationError('')}>
                {reservationError}
              </Alert>
            )}

            {reservationSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setReservationSuccess('')}>
                {reservationSuccess}
              </Alert>
            )}

            {/* Reservations Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
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
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={() => handleReservationDelete(reservation._id)}
                                sx={{ color: '#f44336' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>

        {/* Candidatures Tab */}
        <TabPanel value={tab} index={4}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: '#ffffff' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c2c2c', mb: 3, display: 'flex', alignItems: 'center' }}>
              <Work sx={{ mr: 1, color: '#D4B996' }} />
              Gestion des candidatures
            </Typography>

            {applicationsError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApplicationsError('')}>
                {applicationsError}
              </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
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
            </Paper>
          </Paper>
        </TabPanel>

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