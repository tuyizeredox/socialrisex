import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import AddBonusForm from './components/AddBonusForm';
import BonusTransactionsTable from './components/BonusTransactionsTable';
import BonusStatistics from './components/BonusStatistics';

export default function BonusManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bonus-transactions/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching bonus stats:', err);
      setError('Failed to fetch bonus statistics');
      showNotification('Failed to fetch bonus statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBonusAdded = (bonusData) => {
    // Refresh stats when a new bonus is added
    fetchStats();
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Bonus Management"
        subtitle="Manage user bonuses and track bonus transactions"
        icon={TrendingUpIcon}
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bonus Given"
            value={`RWF ${(stats?.totalBonusGiven || 0).toLocaleString()}`}
            icon={AccountBalanceIcon}
            color="success"
            subtitle="All time bonus payments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Transactions"
            value={stats?.totalBonusTransactions || 0}
            icon={TrendingUpIcon}
            color="primary"
            subtitle="Bonus transactions created"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Transactions"
            value={stats?.pendingBonusTransactions || 0}
            icon={PeopleIcon}
            color="warning"
            subtitle="Awaiting approval"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Bonuses"
            value={stats?.recentBonuses?.length || 0}
            icon={AddIcon}
            color="info"
            subtitle="Last 5 bonus payments"
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Add Bonus" />
          <Tab label="Bonus Transactions" />
          <Tab label="Statistics" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Add Bonus to User
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add bonus money to any user. This bonus will be treated as referral earnings and can be withdrawn.
              </Typography>
              <AddBonusForm onBonusAdded={handleBonusAdded} />
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bonus Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                View and manage all bonus transactions.
              </Typography>
              <BonusTransactionsTable />
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bonus Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Detailed statistics about bonus payments.
              </Typography>
              <BonusStatistics />
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
