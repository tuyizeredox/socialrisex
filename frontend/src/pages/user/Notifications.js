import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  Badge
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MonetizationOn,
  Star,
  CheckCircle,
  Info,
  Warning,
  Error
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import api from '../../utils/api';

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [bonusHistory, setBonusHistory] = useState([]);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats and bonus information
      const [statsRes, bonusRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/bonus-history') // We'll need to create this endpoint
      ]);

      setStats(statsRes.data.data);
      setBonusHistory(bonusRes.data.bonusHistory || []);
    } catch (err) {
      console.error('Error fetching notification data:', err);
      setError('Failed to fetch notification data');
      showNotification('Failed to fetch notification data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bonus': return <MonetizationOn color="success" />;
      case 'referral': return <Star color="primary" />;
      case 'withdrawal': return <CheckCircle color="info" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'bonus': return 'success';
      case 'referral': return 'primary';
      case 'withdrawal': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Notifications & Bonuses"
        subtitle="Stay updated with your earnings and bonus information"
        icon={NotificationsIcon}
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`RWF ${(stats?.earnings || 0).toLocaleString()}`}
            icon={MonetizationOn}
            color="success"
            subtitle="All earnings combined"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bonus Earnings"
            value={`RWF ${(stats?.bonusEarnings || 0).toLocaleString()}`}
            icon={Star}
            color="warning"
            subtitle="Admin bonus rewards"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Referral Earnings"
            value={`RWF ${((stats?.referralBreakdown?.level1 || 0) + (stats?.referralBreakdown?.level2 || 0) + (stats?.referralBreakdown?.level3 || 0)).toLocaleString()}`}
            icon={Star}
            color="primary"
            subtitle="Multi-level referrals"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Welcome Bonus"
            value="RWF 3,000"
            icon={Star}
            color="info"
            subtitle="Display only"
          />
        </Grid>
      </Grid>

      {/* Bonus Information */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💰 Bonus Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" color="success.contrastText" gutterBottom>
                  <strong>Your Bonus Earnings:</strong>
                </Typography>
                <Typography variant="h5" color="success.contrastText" fontWeight="bold">
                  RWF {(stats?.bonusEarnings || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="success.contrastText" sx={{ mt: 1 }}>
                  These bonus earnings are included in your total earnings and can be withdrawn.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" color="info.contrastText" gutterBottom>
                  <strong>Welcome Bonus:</strong>
                </Typography>
                <Typography variant="h5" color="info.contrastText" fontWeight="bold">
                  RWF 3,000
                </Typography>
                <Typography variant="body2" color="info.contrastText" sx={{ mt: 1 }}>
                  This is a display bonus for motivation and cannot be withdrawn.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Debug Information for Users */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Your Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>User ID:</strong> {user?.id || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {user?.email || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Full Name:</strong> {user?.fullName || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Referral Code:</strong> {user?.referralCode || 'N/A'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Earnings Breakdown
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Video Points:</strong> {stats?.videoPoints || 0} points
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Photo Points:</strong> {stats?.photoPoints || 0} points
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Referral Count:</strong> {stats?.referrals || 0} people
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Active Referrals:</strong> {stats?.activeReferrals || 0} people
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔔 Recent Activity
          </Typography>
          {bonusHistory.length > 0 ? (
            <List>
              {bonusHistory.map((item, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {getNotificationIcon(item.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={item.amount ? `RWF ${item.amount.toLocaleString()}` : item.status}
                      color={getNotificationColor(item.type)}
                      size="small"
                    />
                  </ListItem>
                  {index < bonusHistory.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recent activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your bonus and earnings activity will appear here
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
