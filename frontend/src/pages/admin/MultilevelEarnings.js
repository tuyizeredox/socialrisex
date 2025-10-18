import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  People,
  MonetizationOn,
  Refresh,
  Assessment
} from '@mui/icons-material';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';
import MultilevelEarningsTable from './components/MultilevelEarningsTable';
import MultilevelEarningsStats from './components/MultilevelEarningsStats';
import MultilevelEarningsFilters from './components/MultilevelEarningsFilters';

export default function MultilevelEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0 });
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'totalEarnings',
    sortOrder: 'desc',
    minEarnings: 0,
    maxEarnings: null
  });

  // Debounce search to prevent too many API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  const { showNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchEarnings = useCallback(async (page = pagination.page, limit = pagination.limit, filterParams = filters) => {
    // Prevent multiple simultaneous requests
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await api.get('/admin/multilevel-earnings', {
        params: {
          page: page + 1,
          limit: limit,
          ...filterParams
        }
      });
      
      if (response.data && response.data.data) {
        setEarnings(response.data.data);
        setPagination(response.data.pagination);
        setMessage(response.data.message || '');
      }
    } catch (error) {
      console.error('Error fetching multilevel earnings:', error);
      showNotification('Failed to fetch multilevel earnings', 'error');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/multilevel-earnings/stats');
      if (response.data && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEarnings();
    fetchStats();
  }, []);

  // Refetch when pagination or filters change (with debounced search)
  useEffect(() => {
    const filtersWithDebouncedSearch = { ...filters, search: debouncedSearch };
    fetchEarnings(pagination.page, pagination.limit, filtersWithDebouncedSearch);
  }, [pagination.page, pagination.limit, debouncedSearch, filters.sortBy, filters.sortOrder, filters.minEarnings, filters.maxEarnings, fetchEarnings]);

  const handleRecalculateAll = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/multilevel-earnings/recalculate');
      showNotification(response.data.message, 'success');
      fetchEarnings(pagination.page, pagination.limit, filters);
      fetchStats();
    } catch (error) {
      showNotification('Failed to recalculate earnings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserEarnings = async (userId) => {
    try {
      await api.put(`/admin/multilevel-earnings/${userId}`);
      showNotification('User earnings updated successfully', 'success');
      fetchEarnings(pagination.page, pagination.limit, filters);
    } catch (error) {
      showNotification('Failed to update user earnings', 'error');
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 0 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleRowsPerPageChange = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 0 }));
  }, []);

  return (
    <Box sx={{ 
      width: '100%',
      overflowX: 'auto',
      minWidth: 0,
      px: { xs: 1, sm: 2, md: 3 },
      py: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
            💰 Multilevel Earnings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage all multilevel referral earnings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchEarnings(pagination.page, pagination.limit, filters);
              fetchStats();
            }}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={handleRecalculateAll}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            color="primary"
          >
            Recalculate All
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && <MultilevelEarningsStats stats={stats} isMobile={isMobile} />}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <MultilevelEarningsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          isMobile={isMobile}
        />
      </Paper>

      {/* Message */}
      {message && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ borderRadius: 3 }}>
        <MultilevelEarningsTable
          earnings={earnings}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onUpdateUserEarnings={handleUpdateUserEarnings}
          isMobile={isMobile}
        />
      </Paper>
    </Box>
  );
}
