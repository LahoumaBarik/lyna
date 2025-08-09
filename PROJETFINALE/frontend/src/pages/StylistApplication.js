import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  Person,
  Work,
  Schedule,
  Description,
  CheckCircle,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';

const steps = [
  'Personal Information',
  'Professional Details',
  'Experience & Skills',
  'Availability',
  'Motivation',
  'Review & Submit'
];

const specializations = [
  'cutting',
  'coloring',
  'styling',
  'extensions',
  'treatments',
  'bridal',
  'mens',
  'kids'
];

const levels = [
  'Senior / Master',
  'Styliste / Expert',
  'Nouveau Talent',
  'Académie'
];

const scheduleOptions = [
  'full_time',
  'part_time',
  'flexible',
  'weekends_only'
];

function StylistApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingApplication, setExistingApplication] = useState(null);

  const [formData, setFormData] = useState({
    stylistInfo: {
      businessName: '',
      description: '',
      level: '',
      expertise: '',
      inspiration: '',
      expertTip: '',
      favoriteProducts: [],
      specializations: [],
      experience: {
        years: '',
        description: ''
      },
      socialMedia: {
        instagram: '',
        facebook: '',
        tiktok: '',
        website: ''
      },
      availability: {
        schedule: '',
        hoursPerWeek: '',
        preferredDays: [],
        notes: ''
      },
      motivation: {
        whyJoin: '',
        goals: '',
        expectations: ''
      }
    }
  });

  useEffect(() => {
    if (user) {
      checkExistingApplication();
    }
  }, [user]);

  const checkExistingApplication = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/stylist-applications/check`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success && response.data.application) {
        setExistingApplication(response.data.application);
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSpecializationToggle = (spec) => {
    const currentSpecs = formData.stylistInfo.specializations || [];
    const updatedSpecs = currentSpecs.includes(spec)
      ? currentSpecs.filter(s => s !== spec)
      : [...currentSpecs, spec];
    
    handleInputChange('stylistInfo', 'specializations', updatedSpecs);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stylist-applications`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Application submitted successfully! We will review it and get back to you soon.');
        setTimeout(() => {
          navigate('/dashboard-client');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={formData.stylistInfo.businessName}
                  onChange={(e) => handleInputChange('stylistInfo', 'businessName', e.target.value)}
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#6B6B6B' }}>Level</InputLabel>
                  <Select
                    value={formData.stylistInfo.level}
                    onChange={(e) => handleInputChange('stylistInfo', 'level', e.target.value)}
                    label="Level"
                    sx={{
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
                    }}
                  >
                    {levels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
              Professional Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Professional Description"
                  value={formData.stylistInfo.description}
                  onChange={(e) => handleInputChange('stylistInfo', 'description', e.target.value)}
                  helperText="Tell us about your professional background and approach"
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Areas of Expertise"
                  value={formData.stylistInfo.expertise}
                  onChange={(e) => handleInputChange('stylistInfo', 'expertise', e.target.value)}
                  helperText="Your main areas of expertise"
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Inspiration"
                  value={formData.stylistInfo.inspiration}
                  onChange={(e) => handleInputChange('stylistInfo', 'inspiration', e.target.value)}
                  helperText="What inspires your work?"
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
              Experience & Skills
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Years of Experience"
                  value={formData.stylistInfo.experience.years}
                  onChange={(e) => handleNestedChange('stylistInfo', 'experience', 'years', e.target.value)}
                  inputProps={{ min: 0, max: 50 }}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hours per Week"
                  type="number"
                  value={formData.stylistInfo.availability.hoursPerWeek}
                  onChange={(e) => handleNestedChange('stylistInfo', 'availability', 'hoursPerWeek', e.target.value)}
                  inputProps={{ min: 0, max: 168 }}
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
                  multiline
                  rows={3}
                  label="Experience Description"
                  value={formData.stylistInfo.experience.description}
                  onChange={(e) => handleNestedChange('stylistInfo', 'experience', 'description', e.target.value)}
                  helperText="Describe your experience and achievements"
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
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                  Specializations
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {specializations.map(spec => (
                    <Chip
                      key={spec}
                      label={spec.charAt(0).toUpperCase() + spec.slice(1)}
                      onClick={() => handleSpecializationToggle(spec)}
                      sx={{
                        backgroundColor: formData.stylistInfo.specializations.includes(spec) ? '#D4B996' : 'rgba(212, 185, 150, 0.2)',
                        color: formData.stylistInfo.specializations.includes(spec) ? '#2C2C2C' : '#6B6B6B',
                        fontWeight: formData.stylistInfo.specializations.includes(spec) ? 600 : 500,
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: formData.stylistInfo.specializations.includes(spec) ? '#B8A08A' : 'rgba(212, 185, 150, 0.3)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
              Availability
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#6B6B6B' }}>Schedule Preference</InputLabel>
                  <Select
                    value={formData.stylistInfo.availability.schedule}
                    onChange={(e) => handleNestedChange('stylistInfo', 'availability', 'schedule', e.target.value)}
                    label="Schedule Preference"
                    sx={{
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
                    }}
                  >
                    {scheduleOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preferred Start Date"
                  type="date"
                  value={formData.stylistInfo.availability.startDate}
                  onChange={(e) => handleNestedChange('stylistInfo', 'availability', 'startDate', e.target.value)}
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  value={formData.stylistInfo.availability.notes}
                  onChange={(e) => handleNestedChange('stylistInfo', 'availability', 'notes', e.target.value)}
                  helperText="Any additional information about your availability"
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
              Motivation
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Why do you want to join our team?"
                  value={formData.stylistInfo.motivation.whyJoin}
                  onChange={(e) => handleNestedChange('stylistInfo', 'motivation', 'whyJoin', e.target.value)}
                  helperText="Tell us why you want to join our team and what you can bring"
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
                  multiline
                  rows={3}
                  label="Your Goals"
                  value={formData.stylistInfo.motivation.goals}
                  onChange={(e) => handleNestedChange('stylistInfo', 'motivation', 'goals', e.target.value)}
                  helperText="What are your professional goals?"
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 3 }}>
              Review & Submit
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '12px',
                    background: 'rgba(248, 246, 242, 0.8)',
                    border: '1px solid rgba(212, 185, 150, 0.3)',
                    boxShadow: '0px 2px 8px rgba(44, 44, 44, 0.04)'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                      Application Summary
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(212, 185, 150, 0.3)' }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Business Name:</strong> {formData.stylistInfo.businessName || 'Not specified'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Level:</strong> {formData.stylistInfo.level || 'Not specified'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Experience:</strong> {formData.stylistInfo.experience.years || '0'} years
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Schedule:</strong> {formData.stylistInfo.availability.schedule || 'Not specified'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Hours/Week:</strong> {formData.stylistInfo.availability.hoursPerWeek || 'Not specified'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: '#6B6B6B' }}>
                          <strong style={{ color: '#2C2C2C' }}>Specializations:</strong> {formData.stylistInfo.specializations.length > 0 ? formData.stylistInfo.specializations.join(', ') : 'None selected'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        );

      default:
        return null;
    }
  };

  // If user has existing application, show status
  if (existingApplication) {
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
          <Grow in timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 185, 150, 0.2)',
                boxShadow: '0px 8px 32px rgba(44, 44, 44, 0.08)'
              }}
            >
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
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                Application Already Submitted
              </Typography>
              <Typography variant="h6" sx={{ color: '#D4B996', fontWeight: 600, mb: 2 }}>
                Status: {existingApplication.status.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#6B6B6B' }}>
                You have already submitted an application. We will review it and get back to you soon.
              </Typography>
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
                Back to Dashboard
              </Button>
            </Paper>
          </Grow>
        </Container>
      </Box>
    );
  }

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
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', mb: 1, letterSpacing: '-0.02em' }}>
              Become a Hairstylist
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B6B6B', fontWeight: 500 }}>
              Join our team of professional hairstylists and start your journey with us
            </Typography>
          </Paper>
        </Slide>

        {/* Success/Error Alerts */}
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

        {/* Stepper */}
        <Grow in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ color: '#D4B996' }}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grow>

        {/* Step Content */}
        <Grow in timeout={1200}>
          <Box sx={{ mt: 4, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Grow>

        {/* Navigation Buttons */}
        <Grow in timeout={1400}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 185, 150, 0.2)',
              boxShadow: '0px 4px 8px rgba(44, 44, 44, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
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
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
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
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
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
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
}

export default StylistApplication; 