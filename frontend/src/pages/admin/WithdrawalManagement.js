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
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  useMediaQuery,
  useTheme,
  Stack,
  Divider
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const renderWithdrawalCard = (withdrawal) => {
    const statusConfig = {
      pending: { icon: PendingActions, color: 'warning', label: 'Pending' },
      approved: { icon: CheckCircle, color: 'success', label: 'Approved' },
      rejected: { icon: Cancel, color: 'error', label: 'Rejected' }
    };
    const config = statusConfig[withdrawal.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Card key={withdrawal._id} sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h6" component="div">
                  {withdrawal.user?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {withdrawal.user?.email || 'N/A'}
                </Typography>
              </Box>
              <Chip
                icon={<Icon />}
                label={config.label}
                color={config.color}
                size="small"
              />
            </Box>
            
            <Divider />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(withdrawal.amount || 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Chip
                  label={withdrawal.paymentMethod === 'momo' ? 'Mobile Money' : 'Bank Transfer'}
                  color="primary"
                  size="small"
                />
              </Grid>
            </Grid>

            {withdrawal.accountDetails && (
              <>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Account Details
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {withdrawal.accountDetails.accountName || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Number:</strong> {withdrawal.accountDetails.accountNumber || 'N/A'}
                  </Typography>
                </Box>
              </>
            )}

            <Divider />
            
            <Typography variant="body2" color="text.secondary">
              Requested: {new Date(withdrawal.createdAt).toLocaleString()}
            </Typography>
          </Stack>
        </CardContent>
        
        {withdrawal.status === 'pending' && (
          <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog(withdrawal)}
              fullWidth={isMobile}
            >
              Process Request
            </Button>
          </CardActions>
        )}
      </Card>
    );
  };

  return (
    <Box sx={{ 
      width: '100%',
      overflowX: 'auto',
      minWidth: 0,
      px: { xs: 1, sm: 2, md: 3 },
      py: { xs: 1, sm: 2, md: 3 },
      minHeight: 'calc(100vh - 120px)'
    }}>
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
        <>
          {isMobile ? (
            <Box sx={{ 
              px: { xs: 0, sm: 1 },
              '& > *': { mb: 2 }
            }}>
              {withdrawals.map(renderWithdrawalCard)}
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={withdrawals}
              loading={loading}
              initialSort={{ field: 'createdAt', direction: 'desc' }}
            />
          )}
        </>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            m: isMobile ? 0 : 2,
            height: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '90vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Process Withdrawal Request
        </DialogTitle>
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          {selectedWithdrawal && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Withdrawal Details
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1">
                    {selectedWithdrawal.user?.name || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(selectedWithdrawal.amount || 0)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1">
                    {selectedWithdrawal.paymentMethod === 'momo' ? 'Mobile Money' : 'Bank Transfer'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedWithdrawal.accountDetails?.accountName || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1">
                    {selectedWithdrawal.accountDetails?.accountNumber || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Requested
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <FormField
                  label="Processing Notes"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          px: isMobile ? 2 : 3, 
          pb: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth={isMobile}
            variant={isMobile ? "outlined" : "text"}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleProcessWithdrawal('rejected')}
            color="error"
            variant="contained"
            fullWidth={isMobile}
            disabled={processing}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleProcessWithdrawal('approved')}
            color="success"
            variant="contained"
            fullWidth={isMobile}
            disabled={processing}
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
    </Box>
  );
}