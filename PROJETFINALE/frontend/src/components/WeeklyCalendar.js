import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
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
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, Delete, Edit, Schedule } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi', short: 'Lun' },
  { key: 'tuesday', label: 'Mardi', short: 'Mar' },
  { key: 'wednesday', label: 'Mercredi', short: 'Mer' },
  { key: 'thursday', label: 'Jeudi', short: 'Jeu' },
  { key: 'friday', label: 'Vendredi', short: 'Ven' },
  { key: 'saturday', label: 'Samedi', short: 'Sam' },
  { key: 'sunday', label: 'Dimanche', short: 'Dim' }
];

// Time slots from 9 AM to 5 PM (30-minute intervals)
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

function WeeklyCalendar({ user, isAdmin = false, selectedStylist = null }) {
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    return now;
  });

  useEffect(() => {
    if (user) {
      fetchWeeklySchedule();
    }
  }, [user, selectedStylist, currentWeek]);

  const getWeekDates = (date) => {
    const dates = {};
    const startOfWeek = new Date(date);
    
    // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = startOfWeek.getDay();
    
    // Calculate days to subtract to get to Monday
    // If it's Sunday (0), we subtract 6 to get to last Monday
    // If it's Monday (1), we subtract 0
    // If it's Tuesday (2), we subtract 1, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Set to Monday of the current week
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    
    DAYS_OF_WEEK.forEach((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      dates[day.key] = date.toISOString().split('T')[0];
    });
    
    return dates;
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const weekDates = getWeekDates(currentWeek);
  
  // Debug: Log the dates to see what's happening

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const fetchWeeklySchedule = async () => {
    setLoading(true);
    setError('');
    
    try {
      const targetUser = selectedStylist || user;
      const response = await axios.get(`${API_BASE_URL}/disponibilites/my-schedule`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch availabilities');
      }

      const availabilities = response.data;
      
      // Extract the disponibilites array from the response
      const disponibilitesArray = availabilities.disponibilites || availabilities;
      
      // Group availabilities by day
      const grouped = {};
      DAYS_OF_WEEK.forEach(day => {
        grouped[day.key] = [];
      });

      disponibilitesArray.forEach(availability => {
        const date = new Date(availability.jour).toISOString().split('T')[0];
        const dayKey = Object.keys(weekDates).find(key => weekDates[key] === date);
        if (dayKey) {
          grouped[dayKey].push(availability);
        }
      });

      setWeeklySchedule(grouped);
    } catch (err) {
      setError('Erreur lors du chargement des disponibilités');
      console.error('Error fetching availabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = (dayKey) => {
    setSelectedDay(dayKey);
    setSelectedSlot(null);
    setEditMode(false);
    setDialogOpen(true);
  };

  const handleEditAvailability = (dayKey, availability) => {
    setSelectedDay(dayKey);
    setSelectedSlot(availability);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDeleteAvailability = async (availabilityId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/disponibilites/my-schedule/${availabilityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to delete availability');
      }

      setSuccess('Disponibilité supprimée avec succès');
      fetchWeeklySchedule();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Error deleting availability:', err);
    }
  };

  const handleSaveAvailability = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editMode 
        ? `${API_BASE_URL}/disponibilites/my-schedule/${selectedSlot._id}`
        : `${API_BASE_URL}/disponibilites/my-schedule`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        data: formData
      });

      if (response.status !== 200) {
        throw new Error('Failed to save availability');
      }

      setSuccess(editMode ? 'Disponibilité modifiée avec succès' : 'Disponibilité ajoutée avec succès');
      setDialogOpen(false);
      fetchWeeklySchedule();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Error saving availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    // Parse the date string properly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const isTimeSlotAvailable = (dayKey, timeSlot) => {
    const dayAvailabilities = weeklySchedule[dayKey] || [];
    return dayAvailabilities.some(availability => 
      availability.heureDebut <= timeSlot && availability.heureFin > timeSlot
    );
  };

  const getAvailabilityForTimeSlot = (dayKey, timeSlot) => {
    const dayAvailabilities = weeklySchedule[dayKey] || [];
    return dayAvailabilities.find(availability => 
      availability.heureDebut <= timeSlot && availability.heureFin > timeSlot
    );
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 4, 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid #e8e8e8',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: '#D4B996',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 12px rgba(212, 185, 150, 0.3)'
            }}>
              <Schedule sx={{ color: '#ffffff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#2c2c2c',
                background: 'linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Planning Hebdomadaire
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#666',
                fontWeight: 500,
                mt: 0.5
              }}>
                {formatDate(weekDates.monday)} - {formatDate(weekDates.sunday)}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
              onClick={() => navigateWeek(-1)}
              sx={{ 
                color: '#D4B996', 
                backgroundColor: '#f8f4f0',
                '&:hover': { 
                  backgroundColor: '#D4B996',
                  color: '#ffffff',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ArrowBack />
            </IconButton>
            <Button
              variant="contained"
              onClick={() => {
                const today = new Date();
                setCurrentWeek(today);
              }}
              startIcon={<Today />}
              sx={{ 
                backgroundColor: '#D4B996',
                color: '#ffffff',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(212, 185, 150, 0.3)',
                '&:hover': { 
                  backgroundColor: '#B8A08A',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(212, 185, 150, 0.4)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Aujourd'hui
            </Button>
            <IconButton 
              onClick={() => navigateWeek(1)}
              sx={{ 
                color: '#D4B996', 
                backgroundColor: '#f8f4f0',
                '&:hover': { 
                  backgroundColor: '#D4B996',
                  color: '#ffffff',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={50} sx={{ color: '#D4B996' }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Grid container spacing={1} sx={{ minWidth: 800 }}>
              {/* Time column */}
              <Grid item xs={1}>
                <Box sx={{ height: 60 }} /> {/* Header spacer */}
                {TIME_SLOTS.map((timeSlot, index) => (
                  <Box
                    key={timeSlot}
                    sx={{
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: '#f8f9fa',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#666'
                    }}
                  >
                    {timeSlot}
                  </Box>
                ))}
              </Grid>

              {/* Days */}
              {DAYS_OF_WEEK.map((day) => {
                const dayAvailabilities = weeklySchedule[day.key] || [];
                const date = weekDates[day.key];
                const isCurrentDay = isToday(date);
                
                return (
                  <Grid item xs key={day.key}>
                    {/* Day header */}
                    <Card 
                      elevation={isCurrentDay ? 4 : 2}
                      sx={{ 
                        mb: 1,
                        background: isCurrentDay 
                          ? 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: isCurrentDay ? '2px solid #B8A08A' : '2px solid #e8e8e8',
                        borderRadius: 2,
                        transform: isCurrentDay ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: isCurrentDay ? 'scale(1.03)' : 'scale(1.01)',
                          boxShadow: isCurrentDay 
                            ? '0 8px 24px rgba(212, 185, 150, 0.4)'
                            : '0 6px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 800,
                            color: isCurrentDay ? '#ffffff' : '#2c2c2c',
                            mb: 0.5
                          }}
                        >
                          {day.short}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isCurrentDay ? '#ffffff' : '#666',
                            fontWeight: 600,
                            opacity: 0.9
                          }}
                        >
                          {formatDate(date)}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Time slots */}
                    {TIME_SLOTS.map((timeSlot, index) => {
                      const isAvailable = isTimeSlotAvailable(day.key, timeSlot);
                      const availability = getAvailabilityForTimeSlot(day.key, timeSlot);
                      
                      return (
                        <Box
                          key={timeSlot}
                          sx={{
                            height: 40,
                            border: '1px solid #e0e0e0',
                            borderTop: index === 0 ? '1px solid #e0e0e0' : 'none',
                            backgroundColor: isAvailable ? '#e8f5e8' : '#ffffff',
                            cursor: !isAdmin ? 'pointer' : 'default',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': !isAdmin ? {
                              backgroundColor: isAvailable ? '#d4edda' : '#f8f4f0',
                              transform: 'scale(1.02)'
                            } : {},
                            position: 'relative'
                          }}
                          onClick={() => {
                            if (!isAdmin) {
                              if (isAvailable) {
                                handleEditAvailability(day.key, availability);
                              } else {
                                handleAddAvailability(day.key);
                              }
                            }
                          }}
                        >
                          {isAvailable && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: '#4caf50',
                                opacity: 0.8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                {availability?.heureDebut}-{availability?.heureFin}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Availability Dialog */}
      <AvailabilityDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveAvailability}
        selectedDay={selectedDay}
        selectedSlot={selectedSlot}
        editMode={editMode}
        weekDates={weekDates}
        loading={loading}
      />
    </Box>
  );
}

// Availability Dialog Component
function AvailabilityDialog({ open, onClose, onSave, selectedDay, selectedSlot, editMode, weekDates, loading }) {
  const [formData, setFormData] = useState({
    jour: '',
    heureDebut: '09:00',
    heureFin: '17:00'
  });

  useEffect(() => {
    if (selectedSlot) {
      setFormData({
        jour: selectedSlot.jour.split('T')[0],
        heureDebut: selectedSlot.heureDebut,
        heureFin: selectedSlot.heureFin
      });
    } else if (selectedDay) {
      setFormData({
        jour: weekDates[selectedDay],
        heureDebut: '09:00',
        heureFin: '17:00'
      });
    }
  }, [selectedSlot, selectedDay, weekDates]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const dayLabel = DAYS_OF_WEEK.find(day => day.key === selectedDay)?.label || '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)', 
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '1.25rem',
        textAlign: 'center',
        py: 3
      }}>
        {editMode ? 'Modifier la disponibilité' : 'Ajouter une disponibilité'}
        {dayLabel && (
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9, fontWeight: 500 }}>
            {dayLabel}
          </Typography>
        )}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.jour}
                onChange={(e) => setFormData(prev => ({ ...prev, jour: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#D4B996',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#D4B996',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#D4B996',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Heure de début"
                value={formData.heureDebut}
                onChange={(e) => setFormData(prev => ({ ...prev, heureDebut: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#D4B996',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#D4B996',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#D4B996',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Heure de fin"
                value={formData.heureFin}
                onChange={(e) => setFormData(prev => ({ ...prev, heureFin: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#D4B996',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#D4B996',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#D4B996',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: '#666',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #D4B996 0%, #B8A08A 100%)',
              color: '#ffffff',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(212, 185, 150, 0.3)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #B8A08A 0%, #A08A7A 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(212, 185, 150, 0.4)'
              },
              '&:disabled': { 
                background: '#cccccc',
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? <CircularProgress size={20} /> : (editMode ? 'Modifier' : 'Ajouter')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default WeeklyCalendar; 