import { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Cancel,
  PendingActions
} from '@mui/icons-material';
import { getPendingWithdrawals, processWithdrawal } from '../../services/withdrawal.service';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import FormField from '../../components/common/FormField';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/format';

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await getPendingWithdrawals();
      setWithdrawals(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch withdrawals', 'error');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedWithdrawal(null);
    setOpenDialog(false);
    setNotes('');
  };

  const handleProcessWithdrawal = async (status) => {
    try {
      setProcessing(true);
      await processWithdrawal(selectedWithdrawal._id, { status, notes });
      showNotification(`Withdrawal ${status} successfully`, 'success');
      setOpenDialog(false);
      setNotes('');
      fetchWithdrawals();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${status} withdrawal`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      field: 'user',
      label: 'User',
      render: (row) => (
        <Typography variant="body2">
          <strong>{row.user?.name || 'N/A'}</strong>
          <br />
          {row.user?.email || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => formatCurrency(row.amount || 0)
    },
    {
      field: 'paymentMethod',
      label: 'Payment Method',
      render: (row) => (
        <Chip
          label={row.paymentMethod === 'momo' ? 'Mobile Money' : 'Bank Transfer'}
          color="primary"
          size="small"
        />
      )
    },
    {
      field: 'accountDetails',
      label: 'Account Details',
      render: (row) => {
        if (!row.accountDetails) {
          return (
            <Typography variant="body2" color="text.secondary">
              No details available
            </Typography>
          );
        }

        return (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            <strong>Name:</strong> {row.accountDetails.accountName || 'N/A'}
            <br />
            <strong>Number:</strong> {row.accountDetails.accountNumber || 'N/A'}
          </Typography>
        );
      }
    },
    {
      field: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusConfig = {
          pending: { icon: PendingActions, color: 'warning', label: 'Pending' },
          approved: { icon: CheckCircle, color: 'success', label: 'Approved' },
          rejected: { icon: Cancel, color: 'error', label: 'Rejected' }
        };
        const config = statusConfig[row.status] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <Chip
            icon={<Icon />}
            label={config.label}
            color={config.color}
            size="small"
          />
        );
      }
    },
    {
      field: 'createdAt',
      label: 'Requested Date',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      field: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => row.status === 'pending' && (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenDialog(row)}
        >
          Process
        </Button>
      )
    }
  ];

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Withdrawal Requests"
        subtitle="Manage pending withdrawal requests"
        icon={Payment}
      />

      {withdrawals.length === 0 && !loading ? (
        <EmptyState
          icon={Payment}
          title="No Withdrawal Requests"
          description="There are no pending withdrawal requests at this time."
        />
      ) : (
        <DataTable
          columns={columns}
          data={withdrawals}
          loading={loading}
          initialSort={{ field: 'createdAt', direction: 'desc' }}
        />
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Process Withdrawal Request</DialogTitle>
        <DialogContent>
          {selectedWithdrawal && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Withdrawal Details
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>User:</strong> {selectedWithdrawal.user?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Amount:</strong> {formatCurrency(selectedWithdrawal.amount || 0)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Payment Method:</strong>{' '}
                {selectedWithdrawal.paymentMethod === 'momo' ? 'Mobile Money' : 'Bank Transfer'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Account Name:</strong> {selectedWithdrawal.accountDetails?.accountName || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Account Number:</strong> {selectedWithdrawal.accountDetails?.accountNumber || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Requested:</strong>{' '}
                {new Date(selectedWithdrawal.createdAt).toLocaleString()}
              </Typography>

              <FormField
                label="Processing Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => handleProcessWithdrawal('rejected')}
            color="error"
            variant="contained"
          >
            Reject
          </Button>
          <Button
            onClick={() => handleProcessWithdrawal('approved')}
            color="success"
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </Container>
  );
}