import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  Refresh,
  Search
} from '@mui/icons-material';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';
import MultilevelEarningsTable from './components/MultilevelEarningsTable';
import MultilevelEarningsStats from './components/MultilevelEarningsStats';

export default function MultilevelEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
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

  // Memoized filter params to prevent unnecessary re-renders
  const filterParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch
  }), [filters.sortBy, filters.sortOrder, filters.minEarnings, filters.maxEarnings, debouncedSearch]);

  const fetchEarnings = useCallback(async (page = pagination.page, limit = pagination.limit, filterParams = filters) => {
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
      } else if (response.data && Array.isArray(response.data)) {
        setEarnings(response.data);
        setPagination({ page: 0, limit: 10, total: response.data.length });
      }
    } catch (error) {
      console.error('Error fetching multilevel earnings:', error);
      showNotification('Failed to fetch multilevel earnings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

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

  // Initial load - fetch both data and stats in parallel
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEarnings(),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []); // Empty dependency array - only run once on mount

  // Refetch when filters change
  useEffect(() => {
    if (debouncedSearch || filters.sortBy !== 'totalEarnings' || filters.sortOrder !== 'desc' ||
        filters.minEarnings !== 0 || filters.maxEarnings !== null) {
      fetchEarnings(0, 10, filterParams); // Always start from page 0 when filters change
    }
  }, [debouncedSearch, filters.sortBy, filters.sortOrder, filters.minEarnings, filters.maxEarnings, fetchEarnings]);

  const handleEnsureAllUsers = async () => {
    try {
      setRecalculating(true);
      const response = await api.post('/admin/multilevel-earnings/ensure-all-users');
      
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        // Refresh data after ensuring all users have records
        await Promise.all([
          fetchEarnings(),
          fetchStats()
        ]);
      }
    } catch (error) {
      console.error('Error ensuring all users have earnings:', error);
      showNotification('Failed to ensure all users have earnings records', 'error');
    } finally {
      setRecalculating(false);
    }
  };

  const handleRecalculateAll = async () => {
    try {
      setRecalculating(true);
      const response = await api.post('/admin/multilevel-earnings/recalculate-all');
      
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        // Refresh data after recalculation
        await Promise.all([
          fetchEarnings(),
          fetchStats()
        ]);
      }
    } catch (error) {
      console.error('Error recalculating multilevel earnings:', error);
      showNotification('Failed to recalculate multilevel earnings', 'error');
    } finally {
      setRecalculating(false);
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchEarnings(newPage, pagination.limit, filterParams);
  }, [fetchEarnings, pagination.limit, filterParams]);

  const handleRowsPerPageChange = useCallback((event) => {
    const newLimit = parseInt(event?.target?.value || 10, 10);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 0 }));
    fetchEarnings(0, newLimit, filterParams);
  }, [fetchEarnings, filterParams]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page when filters change
  }, []);


  const handleUpdateUserEarnings = useCallback(async (userId, earningsData) => {
    try {
      const response = await api.put(`/admin/multilevel-earnings/${userId}/edit`, earningsData);
      
      if (response.data.success) {
        showNotification('User earnings updated successfully', 'success');
        // Refresh the data
        await fetchEarnings(pagination.page, pagination.limit, filterParams);
      }
    } catch (error) {
      console.error('Error updating user earnings:', error);
      showNotification('Failed to update user earnings', 'error');
    }
  }, [showNotification, fetchEarnings, pagination.page, pagination.limit, filterParams]);

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100vw',
      overflow: 'hidden',
      py: { xs: 1, sm: 3, md: 4 },
      px: { xs: 0, sm: 2, md: 3 }
    }}>
      <Box sx={{ 
        mb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 0 },
        width: '100%',
        maxWidth: '100%'
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          sx={{ 
            textAlign: { xs: 'center', sm: 'left' },
            fontSize: { xs: '1.25rem', sm: '2rem' },
            wordBreak: 'break-word'
          }}
        >
          Multilevel Earnings Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            textAlign: { xs: 'center', sm: 'left' },
            fontSize: { xs: '0.8rem', sm: '1rem' },
            wordBreak: 'break-word'
          }}
        >
          Manage and monitor multilevel referral earnings across all users
        </Typography>
      </Box>

      {message && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Stats Cards */}
      <MultilevelEarningsStats stats={stats} isMobile={isMobile} />

      {/* Search and Action Buttons */}
      <Box sx={{ 
        mb: { xs: 1.5, sm: 3 }, 
        px: { xs: 2, sm: 0 },
        width: '100%',
        maxWidth: '100%'
      }}>
        {/* Search Field */}
        <Box sx={{ mb: 1.5, width: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              },
              '& .MuiInputBase-input': {
                padding: { xs: '10px 12px', sm: '16px 14px' }
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-start' },
          width: '100%'
        }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleEnsureAllUsers}
            disabled={loading || recalculating}
            color="secondary"
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              minWidth: { xs: 'auto', sm: 200 },
              maxWidth: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.65rem', sm: '0.875rem' },
              px: { xs: 1, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              whiteSpace: { xs: 'nowrap', sm: 'normal' }
            }}
          >
            {recalculating ? 'Ensuring...' : 'Ensure All Users Have Records'}
          </Button>
        </Box>
      </Box>


      {/* Earnings Table */}
      <Paper 
        sx={{ 
          p: { xs: 1, sm: 1.5, md: 2 },
          borderRadius: { xs: 1, sm: 2 },
          boxShadow: { xs: 1, sm: 2, md: 3 },
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          mx: { xs: 2, sm: 0 }
        }}
      >
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