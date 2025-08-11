import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Alert,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import axios from 'axios';

const RevenueInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const colors = {
    primary: '#D4B996',
    secondary: '#B8A08A',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/analytics/revenue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(response.data);
    } catch (err) {
      console.error('Revenue data fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const generateInsights = () => {
    if (!data) return [];

    const insights = [];
    
    // Revenue growth analysis
    if (data.overview.totalRevenue > 0) {
      insights.push({
        type: 'revenue',
        title: 'Revenue Performance',
        message: `Total revenue of ${formatCurrency(data.overview.totalRevenue)} generated`,
        trend: 'positive',
        priority: 'high'
      });
    }

    // Average booking value analysis
    if (data.overview.averageBookingValue > 50) {
      insights.push({
        type: 'booking',
        title: 'High Value Bookings',
        message: `Average booking value of ${formatCurrency(data.overview.averageBookingValue)} indicates premium service positioning`,
        trend: 'positive',
        priority: 'medium'
      });
    }

    // Service category performance
    if (data.breakdowns.byServiceCategory.length > 0) {
      const topCategory = data.breakdowns.byServiceCategory[0];
      insights.push({
        type: 'service',
        title: 'Top Performing Service',
        message: `${topCategory._id} services generate ${formatCurrency(topCategory.totalRevenue)} (${topCategory.bookingCount} bookings)`,
        trend: 'positive',
        priority: 'medium'
      });
    }

    // Stylist performance insights
    if (data.breakdowns.byStylist.length > 0) {
      const topStylist = data.breakdowns.byStylist[0];
      insights.push({
        type: 'stylist',
        title: 'Top Performing Stylist',
        message: `Leading stylist generated ${formatCurrency(topStylist.totalRevenue)} in revenue`,
        trend: 'positive',
        priority: 'high'
      });
    }

    return insights;
  };

  const RevenueProjection = () => {
    if (!data) return null;

    // Simple projection based on current trends
    const currentMonthlyRevenue = data.overview.totalRevenue;
    const projectedQuarterly = currentMonthlyRevenue * 3 * 1.1; // 10% growth assumption
    const projectedAnnual = currentMonthlyRevenue * 12 * 1.15; // 15% growth assumption

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon color="primary" />
            Revenue Projections
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {formatCurrency(projectedQuarterly)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projected Quarterly
                </Typography>
                <Typography variant="caption" color="success.main">
                  +10% growth
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {formatCurrency(projectedAnnual)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projected Annual
                </Typography>
                <Typography variant="caption" color="success.main">
                  +15% growth
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {formatCurrency(data.overview.averageBookingValue * 1.2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Target Avg. Booking
                </Typography>
                <Typography variant="caption" color="warning.main">
                  +20% target
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Projections based on current trends and industry growth rates. 
              Actual results may vary based on market conditions and business strategies.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  const ServiceCategoryTable = () => {
    if (!data || !data.breakdowns.byServiceCategory.length) return null;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service Category</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="right">Bookings</TableCell>
              <TableCell align="right">Avg. Price</TableCell>
              <TableCell align="right">Share</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.breakdowns.byServiceCategory.map((category, index) => {
              const sharePercentage = (category.totalRevenue / data.overview.totalRevenue) * 100;
              
              return (
                <TableRow key={category._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: `${Object.values(colors)[index % Object.values(colors).length]}`,
                          mr: 2
                        }}
                      >
                        {category._id.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {category._id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(category.totalRevenue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {category.bookingCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(category.averagePrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {sharePercentage.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={sharePercentage}
                        sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const InsightsList = () => {
    const insights = generateInsights();

    return (
      <List>
        {insights.map((insight, index) => (
          <ListItem key={index} divider>
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: insight.priority === 'high' ? 'error.light' : 
                           insight.priority === 'medium' ? 'warning.light' : 'info.light'
                }}
              >
                <InsightsIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={insight.title}
              secondary={insight.message}
            />
            <Chip
              size="small"
              label={insight.priority}
              color={insight.priority === 'high' ? 'error' : 
                     insight.priority === 'medium' ? 'warning' : 'info'}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h5" gutterBottom>Revenue Insights</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AssessmentIcon color="primary" />
        Revenue Insights & Analysis
      </Typography>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Projections" />
        <Tab label="Service Analysis" />
        <Tab label="Insights" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue vs Bookings Trend
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={data.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="totalRevenue"
                      fill={colors.primary}
                      name="Revenue (€)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalBookings"
                      stroke={colors.info}
                      strokeWidth={3}
                      name="Bookings"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Total Revenue</Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatCurrency(data.overview.totalRevenue)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Total Bookings</Typography>
                    <Typography variant="h6">
                      {data.overview.totalBookings}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Avg. Booking Value</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(data.overview.averageBookingValue)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && <RevenueProjection />}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Category Performance
            </Typography>
            <ServiceCategoryTable />
          </CardContent>
        </Card>
      )}

      {tabValue === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Business Insights
            </Typography>
            <InsightsList />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RevenueInsights; 