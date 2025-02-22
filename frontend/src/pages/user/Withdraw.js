import { useState, useEffect, useCallback } from 'react'; // Add useCallback
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
import StatCard from '../../components/common/StatCard'; // Add this import
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
        totalReferralEarnings: data.totalReferralEarnings,
        totalWithdrawn: data.totalWithdrawn,
        pendingWithdrawals: data.pendingWithdrawals,
        availableBalance: data.availableBalance
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
    
    // Validate withdrawal amount
    const amount = Number(formData.amount);
    if (amount > balance.availableBalance) {
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
      
      // Update balance and withdrawals
      await fetchData();
      
      // Reset form
      setFormData({
        amount: '',
        paymentMethod: 'momo',
        accountNumber: '',
        accountName: ''
      });
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
          <StatCard
            title="Total Referral Earnings"
            value={`RWF ${balance.totalReferralEarnings.toLocaleString()}`}
            icon={MonetizationOn}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Withdrawn"
            value={`RWF ${balance.totalWithdrawn.toLocaleString()}`}
            icon={MonetizationOn}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Withdrawals"
            value={`RWF ${balance.pendingWithdrawals.toLocaleString()}`}
            icon={MonetizationOn}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Balance"
            value={`RWF ${balance.availableBalance.toLocaleString()}`}
            icon={MonetizationOn}
            color="primary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Balance
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              RWF {balance.availableBalance.toLocaleString()}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Minimum withdrawal: RWF 5,000
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Amount (RWF)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                inputProps={{
                  min: 5000,
                  max: balance.availableBalance
                }}
              />

              <TextField
                fullWidth
                select
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              >
                {PAYMENT_METHODS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Account Name"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting || balance.availableBalance < 5000}
                startIcon={<MonetizationOn />}
              >
                {submitting ? 'Processing...' : 'Request Withdrawal'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Withdrawal History
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.length > 0 ? (
                    withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal._id}>
                        <TableCell>
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          RWF {withdrawal.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {withdrawal.paymentMethod === 'momo' ? 'Mobile Money' : 'Bank Transfer'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={withdrawal.status}
                            color={getStatusColor(withdrawal.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" py={3}>
                          No withdrawal history
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}