import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Avatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Search,
  Visibility,
  ContentCopy,
  Schedule,
  Person,
  Receipt,
  ExpandMore,
  Group,
  AssignmentTurnedIn,
  Security,
  FilterList,
  Refresh,
  Download,
  Delete,
  Edit,
  History,
  MonetizationOn,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    duplicates: 0,
    total: 0,
    totalAmount: 0
  });
  
  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(null);
  const [processNotes, setProcessNotes] = useState('');
  const [processLoading, setProcessLoading] = useState(false);

  const { showNotification } = useNotification();
  const debouncedSearch = useDebounce(search, 500);

  const tabFilters = ['all', 'pending', 'approved', 'rejected', 'duplicate'];
  const tabLabels = ['All Transactions', 'Pending Review', 'Approved', 'Rejected', 'Duplicates'];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const fetchTransactions = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      const filter = tabFilters[activeTab];
      const response = await api.get('/admin/transactions', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
          filter,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          dateRange: dateRange !== 'all' ? dateRange : undefined
        }
      });
      
      if (response.data && response.data.transactions) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
        
        // Enhanced stats
        const enhancedStats = {
          ...response.data.stats,
          total: response.data.pagination.total,
          totalAmount: response.data.transactions.reduce((sum, t) => sum + t.amount, 0)
        };
        setStats(enhancedStats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Transaction fetch error:', error);
      
      if (retryCount === 0 && (!error.status || error.status >= 500)) {
        console.log('Retrying transaction fetch...');
        setTimeout(() => fetchTransactions(1), 2000);
        return;
      }
      
      const errorMessage = error.message || 
                          error.response?.data?.message || 
                          'Failed to fetch transactions. Please refresh the page.';
      showNotification(errorMessage, 'error');
      
      setTransactions([]);
      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        duplicates: 0,
        total: 0,
        totalAmount: 0
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, activeTab, statusFilter, dateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openTransactionDetails = async (transaction) => {
    try {
      const response = await api.get(`/admin/transactions/${transaction._id}`);
      setSelectedTransaction(transaction);
      setTransactionDetails(response.data);
      setDetailDialogOpen(true);
    } catch (error) {
      showNotification('Failed to fetch transaction details', 'error');
    }
  };

  const openProcessDialog = (transaction, action) => {
    setProcessingTransaction({ ...transaction, action });
    setProcessNotes('');
    setProcessDialogOpen(true);
  };

  const handleProcessTransaction = async () => {
    if (!processingTransaction) return;

    try {
      setProcessLoading(true);
      await api.put(`/admin/transactions/${processingTransaction._id}`, {
        status: processingTransaction.action,
        notes: processNotes
      });
      
      showNotification(
        `Transaction ${processingTransaction.action} successfully`,
        'success'
      );
      
      setProcessDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to process transaction',
        'error'
      );
    } finally {
      setProcessLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  const exportTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions/export', {
        params: {
          search: debouncedSearch,
          filter: tabFilters[activeTab],
          status: statusFilter !== 'all' ? statusFilter : undefined,
          dateRange: dateRange !== 'all' ? dateRange : undefined
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('Transactions exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export transactions', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      default: return null;
    }
  };

  const getPriorityLevel = (transaction) => {
    if (transaction.isDuplicate && transaction.duplicateCount > 3) return 'high';
    if (transaction.userAttempts > 2) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Memoized columns for better performance
  const columns = useMemo(() => [
    {
      field: 'priority',
      label: 'Priority',
      render: (row) => {
        const priority = getPriorityLevel(row);
        return (
          <Chip
            size="small"
            label={priority.toUpperCase()}
            color={getPriorityColor(priority)}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'user',
      label: 'User Details',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.user.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.user.email}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Mobile: {row.user.mobileNumber || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'transactionId',
      label: 'Transaction ID',
      render: (row) => (
        <Box sx={{ minWidth: 180 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
              {row.transactionId}
            </Typography>
            <IconButton
              size="small"
              onClick={() => copyToClipboard(row.transactionId)}
              sx={{ ml: 1 }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
          {row.isDuplicate && (
            <Chip
              label={`${row.duplicateCount} duplicates`}
              color="warning"
              size="small"
              icon={<Warning />}
            />
          )}
          {row.userAttempts > 1 && (
            <Chip
              label={`${row.userAttempts} attempts`}
              color="info"
              size="small"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'amount',
      label: 'Amount',
      render: (row) => (
        <Box>
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {row.amount.toLocaleString()} RWF
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Activation Fee
          </Typography>
        </Box>
      ),
    },
    {
      field: 'timing',
      label: 'Timing',
      render: (row) => (
        <Box sx={{ minWidth: 140 }}>
          <Typography variant="body2" fontWeight={500}>
            {format(new Date(row.submittedAt), 'MMM dd, yyyy')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(row.submittedAt), 'HH:mm')}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {formatDistanceToNow(new Date(row.submittedAt), { addSuffix: true })}
          </Typography>
          {row.processedAt && (
            <Typography variant="caption" color="success.main">
              Processed: {format(new Date(row.processedAt), 'MMM dd, HH:mm')}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'status',
      label: 'Status',
      render: (row) => (
        <Box>
          <Chip
            icon={getStatusIcon(row.status)}
            label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
            color={getStatusColor(row.status)}
            variant={row.status === 'pending' ? 'filled' : 'outlined'}
          />
          {row.processedBy && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              By: {row.processedBy.fullName}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              onClick={() => openTransactionDetails(row)}
              color="primary"
              size="small"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          {row.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <IconButton
                  onClick={() => openProcessDialog(row, 'approved')}
                  sx={{ color: 'success.main' }}
                  size="small"
                >
                  <CheckCircle />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton
                  onClick={() => openProcessDialog(row, 'rejected')}
                  sx={{ color: 'error.main' }}
                  size="small"
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ], [openTransactionDetails, openProcessDialog]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            💳 Transaction Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive transaction tracking and approval system
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchTransactions()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportTransactions}
          >
            Export
          </Button>
        </Stack>
      </Box>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2">Total Transactions</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2">Pending Review</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2">Approved</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Cancel sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2">Rejected</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MonetizationOn sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {stats.totalAmount.toLocaleString()} RWF
                  </Typography>
                  <Typography variant="body2">Total Amount</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by Transaction ID, User name, or Email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRanges.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateRange('all');
                setActiveTab(0);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 6 }}>
              <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search criteria
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.field} sx={{ fontWeight: 600 }}>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((row) => (
                      <TableRow key={row._id} hover>
                        {columns.map((column) => (
                          <TableCell key={column.field}>
                            {column.render ? column.render(row) : row[column.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={pagination.total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
              />
            </>
          )}
        </Box>
      </Paper>

      {/* Transaction Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Transaction Details</Typography>
            <IconButton
              onClick={() => setDetailDialogOpen(false)}
              size="small"
            >
              <Cancel />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {transactionDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Transaction Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Transaction ID
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {transactionDetails.transaction.transactionId}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="h6">
                        {transactionDetails.transaction.amount.toLocaleString()} RWF
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={transactionDetails.transaction.status}
                        color={getStatusColor(transactionDetails.transaction.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Submitted At
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(transactionDetails.transaction.submittedAt), 'PPPp')}
                      </Typography>
                    </Box>
                    {transactionDetails.transaction.processedAt && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Processed At
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(transactionDetails.transaction.processedAt), 'PPPp')}
                        </Typography>
                      </Box>
                    )}
                    {transactionDetails.transaction.notes && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body1">
                          {transactionDetails.transaction.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      User Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {transactionDetails.transaction.user.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transactionDetails.transaction.user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mobile Number
                      </Typography>
                      <Typography variant="body1">
                        {transactionDetails.transaction.user.mobileNumber || 'Not provided'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Account Status
                      </Typography>
                      <Chip
                        label={transactionDetails.transaction.user.isActive ? 'Active' : 'Inactive'}
                        color={transactionDetails.transaction.user.isActive ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Joined Date
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(transactionDetails.transaction.user.createdAt), 'PPP')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {transactionDetails.duplicateTransactions.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ border: '2px solid', borderColor: 'warning.main' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="warning.main">
                        ⚠️ Duplicate Submissions ({transactionDetails.duplicateTransactions.length})
                      </Typography>
                      <List dense>
                        {transactionDetails.duplicateTransactions.map((dup, index) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'warning.light' }}>
                                <Person />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={dup.user.fullName}
                              secondary={`${dup.user.email} • ${format(new Date(dup.submittedAt), 'PPp')}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Transaction Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {processingTransaction?.action === 'approved' ? 'Approve Transaction' : 'Reject Transaction'}
        </DialogTitle>
        <DialogContent>
          {processingTransaction && (
            <Box sx={{ pt: 2 }}>
              <Alert
                severity={processingTransaction.action === 'approved' ? 'success' : 'warning'}
                sx={{ mb: 3 }}
              >
                You are about to <strong>{processingTransaction.action}</strong> transaction{' '}
                <strong>{processingTransaction.transactionId}</strong> for user{' '}
                <strong>{processingTransaction.user.fullName}</strong>.
                {processingTransaction.action === 'approved' && ' This will activate their account.'}
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                placeholder="Add any notes about this decision..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setProcessDialogOpen(false)}
            disabled={processLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProcessTransaction}
            variant="contained"
            disabled={processLoading}
            color={processingTransaction?.action === 'approved' ? 'success' : 'error'}
          >
            {processLoading ? (
              <CircularProgress size={20} />
            ) : (
              `${processingTransaction?.action === 'approved' ? 'Approve' : 'Reject'} Transaction`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}