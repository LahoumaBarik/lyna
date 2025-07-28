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
  FormHelperText
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
import { API_BASE_URL } from '../config/api';

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
      workingHours: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '09:00', end: '17:00', isWorking: true },
        sunday: { start: '09:00', end: '17:00', isWorking: false }
      },
      commission: 50
    },
    availability: {
      immediate: false,
      startDate: '',
      preferredSchedule: 'full_time' // Set default value
    },
    motivation: ''
  });

  // Check for existing application
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/stylist-applications/my-application`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExistingApplication(response.data.application);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error checking application:', error);
        }
      }
    };

    if (user) {
      checkExistingApplication();
    }
  }, [user]);

  const handleNext = () => {
    // Validate motivation field before proceeding to review step
    if (activeStep === 4 && formData.motivation.length < 50) {
      setError('Please write at least 50 characters in the motivation field before proceeding.');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
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
    setFormData(prev => ({
      ...prev,
      stylistInfo: {
        ...prev.stylistInfo,
        specializations: prev.stylistInfo.specializations.includes(spec)
          ? prev.stylistInfo.specializations.filter(s => s !== spec)
          : [...prev.stylistInfo.specializations, spec]
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate required fields before submission
    if (!formData.availability.preferredSchedule) {
      setError('Please select a preferred schedule before submitting.');
      setLoading(false);
      return;
    }

    // Ensure required fields are set
    const submissionData = {
      ...formData,
      availability: {
        ...formData.availability,
        preferredSchedule: formData.availability.preferredSchedule || 'full_time'
      }
    };

    console.log('Submitting application data:', submissionData);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_BASE_URL}/stylist-applications`, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Application submitted successfully! We will review your application and get back to you soon.');
      setTimeout(() => {
        navigate('/dashboard-client');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error.response?.data);
      if (error.response?.data?.code === 'VALIDATION_ERROR') {
        const validationErrors = error.response.data.details;
        const errorMessages = validationErrors.map(err => `${err.path}: ${err.msg}`).join(', ');
        setError(`Validation errors: ${errorMessages}`);
      } else {
        setError(error.response?.data?.message || 'Failed to submit application');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name (Optional)"
                  value={formData.stylistInfo.businessName}
                  onChange={(e) => handleInputChange('stylistInfo', 'businessName', e.target.value)}
                  helperText="Your professional business name if you have one"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Professional Level</InputLabel>
                  <Select
                    value={formData.stylistInfo.level}
                    onChange={(e) => handleInputChange('stylistInfo', 'level', e.target.value)}
                    label="Professional Level"
                  >
                    {levels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Areas of Expertise"
                  value={formData.stylistInfo.expertise}
                  onChange={(e) => handleInputChange('stylistInfo', 'expertise', e.target.value)}
                  helperText="Your main areas of expertise"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Inspiration"
                  value={formData.stylistInfo.inspiration}
                  onChange={(e) => handleInputChange('stylistInfo', 'inspiration', e.target.value)}
                  helperText="What inspires your work?"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Commission Rate (%)"
                  type="number"
                  value={formData.stylistInfo.commission}
                  onChange={(e) => handleInputChange('stylistInfo', 'commission', e.target.value)}
                  inputProps={{ min: 0, max: 100 }}
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
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Specializations
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {specializations.map(spec => (
                    <Chip
                      key={spec}
                      label={spec.charAt(0).toUpperCase() + spec.slice(1)}
                      onClick={() => handleSpecializationToggle(spec)}
                      color={formData.stylistInfo.specializations.includes(spec) ? 'primary' : 'default'}
                      variant={formData.stylistInfo.specializations.includes(spec) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Availability
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.availability.immediate}
                      onChange={(e) => handleInputChange('availability', 'immediate', e.target.checked)}
                    />
                  }
                  label="Available to start immediately"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Preferred Start Date"
                  value={formData.availability.startDate}
                  onChange={(e) => handleInputChange('availability', 'startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={formData.availability.immediate}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Schedule</InputLabel>
                  <Select
                    value={formData.availability.preferredSchedule}
                    onChange={(e) => handleInputChange('availability', 'preferredSchedule', e.target.value)}
                    label="Preferred Schedule"
                  >
                    {scheduleOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Motivation
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Why do you want to join our team?"
              value={formData.motivation}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, motivation: e.target.value }));
                if (error && e.target.value.length >= 50) {
                  setError('');
                }
              }}
              helperText={`Tell us about your motivation and what you can bring to our team (${formData.motivation.length}/1000 characters, minimum 50 required)`}
              inputProps={{ maxLength: 1000 }}
              error={formData.motivation.length > 0 && formData.motivation.length < 50}
            />
            <FormHelperText 
              error={formData.motivation.length > 0 && formData.motivation.length < 50}
              sx={{ mt: 1 }}
            >
              {formData.motivation.length < 50 && formData.motivation.length > 0 
                ? `Please write at least ${50 - formData.motivation.length} more characters`
                : `${formData.motivation.length}/1000 characters`
              }
            </FormHelperText>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Application
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Business Name:</strong> {formData.stylistInfo.businessName || 'Not specified'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Level:</strong> {formData.stylistInfo.level || 'Not specified'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Experience:</strong> {formData.stylistInfo.experience.years} years
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Specializations:</strong> {formData.stylistInfo.specializations.join(', ') || 'None selected'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Availability:</strong> {formData.availability.immediate ? 'Immediate' : formData.availability.startDate}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Schedule:</strong> {formData.availability.preferredSchedule.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Motivation:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formData.motivation}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  // If user has existing application, show status
  if (existingApplication) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle color="primary" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Application Already Submitted
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Status: {existingApplication.status.replace('_', ' ').toUpperCase()}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You have already submitted an application. We will review it and get back to you soon.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard-client')}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Become a Hairstylist
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }} align="center" color="text.secondary">
          Join our team of professional hairstylists and start your journey with us
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
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
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default StylistApplication; 