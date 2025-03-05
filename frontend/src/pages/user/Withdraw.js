import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box
} from '@mui/material';
import { MonetizationOn } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import api from '../../utils/api';

const PAYMENT_METHODS = [
  { value: 'momo', label: 'Mobile Money' },
  { value: 'bank', label: 'Bank Transfer' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'warning';
  }
};

export default function Withdraw() {
  const [balance, setBalance] = useState({
    totalReferralEarnings: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    availableBalance: 0
  });
  
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'momo',
    accountNumber: '',
    accountName: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/withdrawals');
      const { data } = response.data;

      setBalance({
        totalReferralEarnings: Number(data.totalReferralEarnings) || 0,
        totalWithdrawn: Number(data.totalWithdrawn) || 0,
        pendingWithdrawals: Number(data.pendingWithdrawals) || 0,
        availableBalance: Number(data.availableBalance) || 0
      });
      
      setWithdrawals(data.withdrawals);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification(
        error.response?.data?.message || 'Failed to fetch data',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = Number(formData.amount);
    const availableBalance = Number(balance.availableBalance);
    console.log(`Attempting withdrawal: ${amount}, Available balance: ${availableBalance}`);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      setError('Withdrawal amount cannot exceed your available balance');
      return;
    }
    if (amount < 5000) {
      setError('Minimum withdrawal amount is RWF 5,000');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/withdrawals', {
        amount,
        paymentMethod: formData.paymentMethod,
        accountDetails: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber
        }
      });

      showNotification('Withdrawal request submitted successfully', 'success');
      await fetchData();
      setFormData({ amount: '', paymentMethod: 'momo', accountNumber: '', accountName: '' });
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      setError(error.response?.data?.message || 'Failed to submit withdrawal request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <PageHeader title="Withdraw Earnings" />
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Referral Earnings" value={`RWF ${balance.totalReferralEarnings.toLocaleString()}`} icon={MonetizationOn} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Withdrawn" value={`RWF ${balance.totalWithdrawn.toLocaleString()}`} icon={MonetizationOn} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Withdrawals" value={`RWF ${balance.pendingWithdrawals.toLocaleString()}`} icon={MonetizationOn} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Available Balance" value={`RWF ${balance.availableBalance.toLocaleString()}`} icon={MonetizationOn} color="primary" />
        </Grid>
      </Grid>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Available Balance: RWF {balance.availableBalance.toLocaleString()}</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField fullWidth label="Amount (RWF)" name="amount" type="number" value={formData.amount} onChange={handleChange} required sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" fullWidth disabled={submitting || balance.availableBalance < 5000} startIcon={<MonetizationOn />}>{submitting ? 'Processing...' : 'Request Withdrawal'}</Button>
        </Box>
      </Paper>
    </Container>
  );
}
