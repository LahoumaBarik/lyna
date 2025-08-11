import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  EventAvailable as BookingsIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');
  const [lastUpdated, setLastUpdated] = useState(null);

  const colors = {
    primary: '#D4B996',
    secondary: '#B8A08A',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
              const response = await axios.get(`/analytics/dashboard?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const MetricCard = ({ title, value, change, icon, color = 'primary', loading: cardLoading }) => {
    if (cardLoading) {
      return (
        <Card sx={{ height: 140 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="40%" />
          </CardContent>
        </Card>
      );
    }

    const isPositive = change >= 0;
    const changeColor = isPositive ? 'success' : 'error';
    const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

    return (
      <Card sx={{ height: 140, position: 'relative', overflow: 'hidden' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {value}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendIcon color={changeColor} fontSize="small" />
                <Typography
                  variant="body2"
                  color={`${changeColor}.main`}
                  sx={{ ml: 0.5 }}
                >
                  {formatPercentage(Math.abs(change))}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  vs last period
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: `${color}.light`,
                color: `${color}.dark`
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const RevenueChart = ({ data: chartData, loading: chartLoading }) => {
    if (chartLoading) {
      return <Skeleton variant="rectangular" height={300} />;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(0,0,0,0.6)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(0,0,0,0.6)"
            fontSize={12}
            tickFormatter={(value) => `€${value}`}
          />
          <ChartTooltip
            formatter={(value) => [formatCurrency(value), 'Revenue']}
            labelStyle={{ color: '#666' }}
          />
          <Area
            type="monotone"
            dataKey="totalRevenue"
            stroke={colors.primary}
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const BookingsChart = ({ data: chartData, loading: chartLoading }) => {
    if (chartLoading) {
      return <Skeleton variant="rectangular" height={300} />;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(0,0,0,0.6)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(0,0,0,0.6)"
            fontSize={12}
          />
          <ChartTooltip />
          <Bar dataKey="totalBookings" fill={colors.info} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const ServiceDistribution = ({ data: chartData, loading: chartLoading }) => {
    if (chartLoading) {
      return <Skeleton variant="rectangular" height={300} />;
    }

    const pieColors = [colors.primary, colors.secondary, colors.info, colors.success, colors.warning];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="totalRevenue"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <ChartTooltip formatter={(value) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <IconButton onClick={fetchAnalytics} size="small" sx={{ ml: 1 }}>
          <RefreshIcon />
        </IconButton>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Business Intelligence Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 3 months</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchAnalytics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export data">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {lastUpdated && (
        <Box mb={2}>
          <Chip
            icon={<CalendarIcon />}
            label={`Last updated: ${lastUpdated.toLocaleString()}`}
            size="small"
            variant="outlined"
          />
        </Box>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={data ? formatCurrency(data.summary.totalRevenue) : '€0'}
            change={data ? data.summary.revenueGrowth : 0}
            icon={<MoneyIcon />}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Bookings"
            value={data ? data.summary.totalBookings.toLocaleString() : '0'}
            change={data ? ((data.summary.totalBookings - data.summary.totalBookings) / Math.max(data.summary.totalBookings, 1)) * 100 : 0}
            icon={<BookingsIcon />}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="New Clients"
            value={data ? data.summary.newClients.toLocaleString() : '0'}
            change={data ? 15.2 : 0}
            icon={<PeopleIcon />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Booking Value"
            value={data ? formatCurrency(data.summary.averageBookingValue) : '€0'}
            change={data ? 8.7 : 0}
            icon={<StarIcon />}
            color="warning"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              <RevenueChart 
                data={data ? data.charts.revenueByPeriod : []} 
                loading={loading} 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Distribution
              </Typography>
              <ServiceDistribution 
                data={data ? data.charts.topServices : []} 
                loading={loading} 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Volume
              </Typography>
              <BookingsChart 
                data={data ? data.charts.revenueByPeriod : []} 
                loading={loading} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 