import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../utils/api';

export default function BonusTransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/admin/bonus-transactions?${params}`);
      setTransactions(response.data.data.bonusTransactions);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total,
        pages: response.data.data.pagination.pages
      }));
    } catch (err) {
      console.error('Error fetching bonus transactions:', err);
      setError('Failed to fetch bonus transactions');
      showNotification('Failed to fetch bonus transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setEditNotes(transaction.notes || '');
    setEditStatus(transaction.status);
    setDialogOpen(true);
  };

  const handleUpdateTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      await api.put(`/admin/bonus-transactions/${selectedTransaction._id}`, {
        status: editStatus,
        notes: editNotes
      });

      showNotification('Transaction updated successfully', 'success');
      setDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      const message = error.response?.data?.message || 'Failed to update transaction';
      showNotification(message, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'admin_bonus': return 'primary';
      case 'referral_bonus': return 'success';
      case 'special_promotion': return 'warning';
      default: return 'default';
    }
  };

  const formatType = (type) => {
    switch (type) {
      case 'admin_bonus': return 'Admin Bonus';
      case 'referral_bonus': return 'Referral Bonus';
      case 'special_promotion': return 'Special Promotion';
      default: return type;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={handleFilterChange('search')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearFilters}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={handleFilterChange('type')}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="admin_bonus">Admin Bonus</MenuItem>
                <MenuItem value="referral_bonus">Referral Bonus</MenuItem>
                <MenuItem value="special_promotion">Special Promotion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={handleFilterChange('status')}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Added By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {transaction.user?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.user?.email || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    RWF {transaction.amount?.toLocaleString() || '0'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={formatType(transaction.type)}
                    color={getTypeColor(transaction.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={getStatusColor(transaction.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {transaction.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {transaction.addedBy?.fullName || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(transaction.addedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Transaction Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">User</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedTransaction.user?.fullName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTransaction.user?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    RWF {selectedTransaction.amount?.toLocaleString() || '0'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Chip
                    label={formatType(selectedTransaction.type)}
                    color={getTypeColor(selectedTransaction.type)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedTransaction.status}
                    color={getStatusColor(selectedTransaction.status)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">
                    {selectedTransaction.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTransaction} variant="contained">
            Update Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
