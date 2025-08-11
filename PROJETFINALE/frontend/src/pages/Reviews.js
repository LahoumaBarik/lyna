import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Avatar,
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Star as StarIcon,
  PhotoCamera as PhotoIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import axios from 'axios';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [newReview, setNewReview] = useState({
    overallRating: 5,
    detailedRatings: {
      quality: 5,
      timeliness: 5,
      cleanliness: 5,
      communication: 5,
      value: 5
    },
    title: '',
    comment: '',
    wouldRecommend: true,
    wouldBookAgain: true,
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchMyReservations();
  }, []);

  const fetchReviews = async () => {
    try {
      // Fetch featured reviews for display
      const response = await axios.get('/reviews/featured');
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchMyReservations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get('/reservations?status=completed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter reservations that don't have reviews yet
      const reservations = Array.isArray(response.data) ? response.data : response.data.reservations || [];
      const reservationsWithoutReviews = reservations.filter(res => !res.review?.rating);
      setMyReservations(reservationsWithoutReviews);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const openReviewDialog = (reservation) => {
    setSelectedReservation(reservation);
    setReviewDialog(true);
  };

  const closeReviewDialog = () => {
    setReviewDialog(false);
    setSelectedReservation(null);
    setNewReview({
      overallRating: 5,
      detailedRatings: {
        quality: 5,
        timeliness: 5,
        cleanliness: 5,
        communication: 5,
        value: 5
      },
      title: '',
      comment: '',
      wouldRecommend: true,
      wouldBookAgain: true,
      photos: []
    });
  };

  const submitReview = async () => {
    if (!selectedReservation || !newReview.comment.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
              await axios.post('/reviews', {
        reservationId: selectedReservation._id,
        ...newReview
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Review submitted successfully!' });
      closeReviewDialog();
      fetchReviews();
      fetchMyReservations();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to submit review' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const DetailedRating = ({ label, value, onChange }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
      <Typography variant="body2">{label}</Typography>
      <Rating
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        size="small"
      />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Reviews & Testimonials
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your experience and read what others say about our services
        </Typography>
      </Box>

      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* My Completed Appointments - Can Leave Reviews */}
      {myReservations.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            📝 Leave a Review
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Share your experience for completed appointments
          </Typography>
          
          <Grid container spacing={2}>
            {myReservations.map((reservation) => (
              <Grid item xs={12} md={6} key={reservation._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {reservation.services?.[0]?.service?.name || 'Service'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      with {reservation.stylist?.firstName} {reservation.stylist?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {formatDate(reservation.date)}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      startIcon={<StarIcon />}
                      onClick={() => openReviewDialog(reservation)}
                      fullWidth
                    >
                      Leave Review
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Featured Reviews Display */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          ⭐ Client Reviews
        </Typography>
        
        {reviews.length === 0 ? (
          <Alert severity="info">
            No reviews yet. Be the first to leave a review! 🌟
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {reviews.map((review) => (
              <Grid item xs={12} md={6} key={review._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2 }}>
                          {review.client?.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.client?.firstName} {review.client?.lastName?.[0]}.
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Rating value={review.overallRating} readOnly size="small" />
                            {review.verified && (
                              <Tooltip title="Verified review">
                                <VerifiedIcon color="primary" sx={{ ml: 1, fontSize: 16 }} />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.createdAt)}
                      </Typography>
                    </Box>

                    {review.title && (
                      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        {review.title}
                      </Typography>
                    )}

                    <Typography variant="body2" mb={2}>
                      {review.comment}
                    </Typography>

                    <Box display="flex" gap={1} mb={2}>
                      {review.wouldRecommend && (
                        <Chip 
                          label="Would Recommend" 
                          size="small" 
                          color="success" 
                          variant="outlined" 
                        />
                      )}
                      {review.wouldBookAgain && (
                        <Chip 
                          label="Would Book Again" 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Service: {review.service?.name} • Stylist: {review.stylist?.firstName}
                    </Typography>

                    {review.response?.comment && (
                      <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                        <Typography variant="caption" color="primary" fontWeight="bold">
                          Stylist Response:
                        </Typography>
                        <Typography variant="body2" mt={1}>
                          {review.response.comment}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onClose={closeReviewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Leave a Review
          {selectedReservation && (
            <Typography variant="body2" color="text.secondary">
              {selectedReservation.services?.[0]?.service?.name} with {selectedReservation.stylist?.firstName}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Overall Rating */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Overall Rating
              </Typography>
              <Rating
                value={newReview.overallRating}
                onChange={(e, newValue) => setNewReview({
                  ...newReview,
                  overallRating: newValue
                })}
                size="large"
              />
            </Box>

            {/* Detailed Ratings */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Detailed Ratings
              </Typography>
              <DetailedRating
                label="Quality of Service"
                value={newReview.detailedRatings.quality}
                onChange={(value) => setNewReview({
                  ...newReview,
                  detailedRatings: { ...newReview.detailedRatings, quality: value }
                })}
              />
              <DetailedRating
                label="Timeliness"
                value={newReview.detailedRatings.timeliness}
                onChange={(value) => setNewReview({
                  ...newReview,
                  detailedRatings: { ...newReview.detailedRatings, timeliness: value }
                })}
              />
              <DetailedRating
                label="Cleanliness"
                value={newReview.detailedRatings.cleanliness}
                onChange={(value) => setNewReview({
                  ...newReview,
                  detailedRatings: { ...newReview.detailedRatings, cleanliness: value }
                })}
              />
              <DetailedRating
                label="Communication"
                value={newReview.detailedRatings.communication}
                onChange={(value) => setNewReview({
                  ...newReview,
                  detailedRatings: { ...newReview.detailedRatings, communication: value }
                })}
              />
              <DetailedRating
                label="Value for Money"
                value={newReview.detailedRatings.value}
                onChange={(value) => setNewReview({
                  ...newReview,
                  detailedRatings: { ...newReview.detailedRatings, value: value }
                })}
              />
            </Box>

            {/* Review Title */}
            <TextField
              fullWidth
              label="Review Title (Optional)"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Great experience!"
            />

            {/* Review Comment */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review *"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Tell us about your experience..."
              required
            />

            {/* Recommendations */}
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newReview.wouldRecommend}
                    onChange={(e) => setNewReview({ ...newReview, wouldRecommend: e.target.checked })}
                  />
                }
                label="I would recommend this stylist"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newReview.wouldBookAgain}
                    onChange={(e) => setNewReview({ ...newReview, wouldBookAgain: e.target.checked })}
                  />
                }
                label="I would book again"
              />
            </Box>

            {/* Photo Upload Placeholder */}
            <Box mb={2}>
              <Button
                variant="outlined"
                startIcon={<PhotoIcon />}
                disabled
                fullWidth
              >
                Add Photos (Coming Soon)
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Photo upload functionality will be available soon
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeReviewDialog}>
            Cancel
          </Button>
          <Button
            onClick={submitReview}
            variant="contained"
            disabled={loading || !newReview.comment.trim()}
            startIcon={<SendIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reviews; 