import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Pagination,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  Email,
  Phone,
  Work,
  Description
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  interview_requested: 'info'
};

function StylistApplicationAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  console.log('StylistApplicationAdmin rendering, user:', user);
  console.log('Applications state:', applications);
  console.log('Loading state:', loading);
  console.log('Error state:', error);

  useEffect(() => {
    console.log('StylistApplicationAdmin useEffect triggered');
    if (!user || user.role !== 'admin') {
      console.log('User not admin, redirecting to login');
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [user, statusFilter, page]);

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...');
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(`${API_URL}/stylist-applications?status=${statusFilter}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Applications response:', response.data);
      setApplications(response.data.applications);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = async (applicationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/stylist-applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedApplication(response.data.application);
      setDialogOpen(true);
    } catch (error) {
      setError('Failed to fetch application details');
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
    if (!selectedApplication) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${API_URL}/stylist-applications/${selectedApplication._id}`;
      let data = {};

      switch (actionType) {
        case 'approve':
          data = { reviewNotes: actionData.reviewNotes };
          await axios.post(`${url}/approve`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'reject':
          data = { 
            reviewNotes: actionData.reviewNotes,
            rejectionMessage: actionData.rejectionMessage
          };
          await axios.post(`${url}/reject`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'interview':
          data = { 
            interviewNotes: actionData.interviewNotes,
            location: actionData.location
          };
          await axios.post(`${url}/request-interview`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        default:
          break;
      }

      setActionDialogOpen(false);
      setDialogOpen(false);
      fetchApplications();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Stylist Applications
        </Typography>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
        <Typography variant="body1" textAlign="center">
          Loading applications...
        </Typography>
      </Container>
    );
  }

  // Debug fallback
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Stylist Applications
        </Typography>
        <Typography variant="body1" color="error">
          No user found. Please log in.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stylist Applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Applications ({applications.length})
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Applications</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="interview_requested">Interview Requested</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {applications.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography variant="body1" color="text.secondary">
              No applications found.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Specializations</TableCell>
                  <TableCell>Submitted</TableCell>
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
                      {application.stylistInfo.experience.years} years
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
                      <Tooltip title="View Details">
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

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Application Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Application Details
          {selectedApplication && (
            <Chip
              label={getStatusLabel(selectedApplication.status)}
              color={statusColors[selectedApplication.status]}
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Applicant Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Name"
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
                            primary="Phone"
                            secondary={selectedApplication.applicant.phone || 'Not provided'}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Professional Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Business Name"
                            secondary={selectedApplication.stylistInfo.businessName || 'Not specified'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Level"
                            secondary={selectedApplication.stylistInfo.level || 'Not specified'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Experience"
                            secondary={`${selectedApplication.stylistInfo.experience.years} years`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Commission"
                            secondary={`${selectedApplication.stylistInfo.commission}%`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Specializations
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {selectedApplication.stylistInfo.specializations.map(spec => (
                          <Chip key={spec} label={spec} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedApplication.stylistInfo.description || 'No description provided'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Motivation
                      </Typography>
                      <Typography variant="body2">
                        {selectedApplication.motivation}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Availability
                      </Typography>
                      <Typography variant="body2">
                        <strong>Immediate:</strong> {selectedApplication.availability.immediate ? 'Yes' : 'No'}
                      </Typography>
                      {!selectedApplication.availability.immediate && (
                        <Typography variant="body2">
                          <strong>Start Date:</strong> {selectedApplication.availability.startDate}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        <strong>Schedule:</strong> {selectedApplication.availability.preferredSchedule.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedApplication && selectedApplication.status === 'pending' && (
            <>
              <Button
                onClick={() => handleAction('interview')}
                startIcon={<Schedule />}
                color="info"
              >
                Request Interview
              </Button>
              <Button
                onClick={() => handleAction('approve')}
                startIcon={<CheckCircle />}
                color="success"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleAction('reject')}
                startIcon={<Cancel />}
                color="error"
              >
                Reject
              </Button>
            </>
          )}
          {selectedApplication && selectedApplication.status === 'interview_requested' && (
            <>
              <Button
                onClick={() => handleAction('approve')}
                startIcon={<CheckCircle />}
                color="success"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleAction('reject')}
                startIcon={<Cancel />}
                color="error"
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
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
          {actionType === 'approve' && 'Approve Application'}
          {actionType === 'reject' && 'Reject Application'}
          {actionType === 'interview' && 'Request Interview'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {actionType === 'approve' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review Notes (Optional)"
                value={actionData.reviewNotes}
                onChange={(e) => setActionData(prev => ({ ...prev, reviewNotes: e.target.value }))}
                helperText="Add any notes about the approval"
              />
            )}

            {actionType === 'reject' && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Review Notes (Optional)"
                  value={actionData.reviewNotes}
                  onChange={(e) => setActionData(prev => ({ ...prev, reviewNotes: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Rejection Message"
                  value={actionData.rejectionMessage}
                  onChange={(e) => setActionData(prev => ({ ...prev, rejectionMessage: e.target.value }))}
                  helperText="This message will be sent to the applicant"
                />
              </>
            )}

            {actionType === 'interview' && (
              <>
                <TextField
                  fullWidth
                  label="Interview Location"
                  value={actionData.location}
                  onChange={(e) => setActionData(prev => ({ ...prev, location: e.target.value }))}
                  sx={{ mb: 2 }}
                  helperText="Where the interview will take place"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Interview Notes (Optional)"
                  value={actionData.interviewNotes}
                  onChange={(e) => setActionData(prev => ({ ...prev, interviewNotes: e.target.value }))}
                  helperText="Additional notes about the interview request"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
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
            {actionLoading ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StylistApplicationAdmin; 