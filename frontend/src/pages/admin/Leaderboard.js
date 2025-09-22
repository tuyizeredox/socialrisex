import { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  Search,
  Visibility,
  EmojiEvents,
  Person,
  MonetizationOn,
  Group,
  Star,
  AccountBalanceWallet,
  ExpandMore,
  FilterList,
  Refresh,
  Timeline,
  AssessmentRounded,
  TrendingDown,
  PersonAdd,
  CheckCircle,
  Download,
  Share,
  Award,
  BarChart,
  PieChart,
  ShowChart,
  Close
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';

export default function LeaderboardNew() {
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('totalEarnings');
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0 });
  const [topPerformers, setTopPerformers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalReferrers: 0,
    totalReferrals: 0,
    totalEarnings: 0,
    activeReferrers: 0,
    avgConversionRate: 0,
    topEarner: null,
    recentGrowth: 0
  });
  
  // Detailed view
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [referrerDetails, setReferrerDetails] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  const { showNotification } = useNotification();
  const debouncedSearch = useDebounce(search, 500);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const timeRanges = [
    { value: 'all', label: 'All Time', icon: <Timeline /> },
    { value: '7d', label: 'Last 7 Days', icon: <TrendingUp /> },
    { value: '30d', label: 'Last 30 Days', icon: <MonetizationOn /> },
    { value: '90d', label: 'Last 3 Months', icon: <BarChart /> },
    { value: '1y', label: 'Last Year', icon: <ShowChart /> }
  ];

  const sortOptions = [
    { value: 'totalEarnings', label: 'Total Earnings', icon: <MonetizationOn /> },
    { value: 'totalReferrals', label: 'Total Referrals', icon: <Group /> },
    { value: 'activeReferrals', label: 'Active Referrals', icon: <CheckCircle /> },
    { value: 'conversionRate', label: 'Conversion Rate', icon: <TrendingUp /> },
    { value: 'activityScore', label: 'Activity Score', icon: <AssessmentRounded /> }
  ];

  const tabLabels = ['🏆 Top Performers', '📊 All Referrers', '📈 Performance Trends', '🎯 Conversion Analysis'];

  const fetchLeaderboard = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await api.get('/admin/leaderboard', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
          timeRange,
          sortBy
        }
      });
      
      if (response.data && response.data.referrers) {
        setReferrers(response.data.referrers);
        setPagination(response.data.pagination);
        setTopPerformers(response.data.topPerformers || []);
        
        // Enhanced stats calculation
        const enhancedStats = {
          ...response.data.stats,
          avgConversionRate: response.data.referrers.length > 0 
            ? response.data.referrers.reduce((sum, r) => sum + r.conversionRate, 0) / response.data.referrers.length
            : 0,
          topEarner: response.data.referrers[0] || null,
          recentGrowth: calculateGrowth(response.data.referrers)
        };
        setStats(enhancedStats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      
      if (retryCount === 0 && (!error.status || error.status >= 500)) {
        console.log('Retrying leaderboard fetch...');
        setTimeout(() => fetchLeaderboard(1), 2000);
        return;
      }
      
      const errorMessage = error.message || 
                          error.response?.data?.message || 
                          'Failed to fetch leaderboard data. Please refresh the page.';
      showNotification(errorMessage, 'error');
      
      setReferrers([]);
      setTopPerformers([]);
      setStats({
        totalReferrers: 0,
        totalReferrals: 0,
        totalEarnings: 0,
        activeReferrers: 0,
        avgConversionRate: 0,
        topEarner: null,
        recentGrowth: 0
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, timeRange, sortBy]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const calculateGrowth = (referrers) => {
    const thisMonth = referrers.filter(r => 
      new Date(r.user.createdAt) >= startOfMonth(new Date())
    ).length;
    const lastMonth = referrers.filter(r => {
      const date = new Date(r.user.createdAt);
      return date >= startOfMonth(subMonths(new Date(), 1)) && 
             date < startOfMonth(new Date());
    }).length;
    
    if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
    return ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
  };

  const openReferrerDetails = async (referrer) => {
    try {
      const response = await api.get(`/admin/referrers/${referrer.userId}`);
      setSelectedReferrer(referrer);
      setReferrerDetails(response.data);
      setPerformanceData(response.data.monthlyStats || []);
      setDetailDialogOpen(true);
    } catch (error) {
      showNotification('Failed to fetch referrer details', 'error');
    }
  };

  const exportLeaderboard = async () => {
    try {
      const response = await api.get('/admin/leaderboard/export', {
        params: {
          search: debouncedSearch,
          timeRange,
          sortBy
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leaderboard-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('Leaderboard exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export leaderboard', 'error');
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <EmojiEvents sx={{ color: '#FFD700', fontSize: 32 }} />;
    if (rank === 2) return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 28 }} />;
    if (rank === 3) return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 24 }} />;
    return <Star sx={{ color: 'primary.main', fontSize: 20 }} />;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return { bgcolor: '#FFD700', color: '#000' };
    if (rank === 2) return { bgcolor: '#C0C0C0', color: '#000' };
    if (rank === 3) return { bgcolor: '#CD7F32', color: '#fff' };
    if (rank <= 10) return { bgcolor: 'primary.main', color: 'primary.contrastText' };
    return { bgcolor: 'grey.400', color: 'grey.800' };
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'success' };
    if (score >= 75) return { label: 'Great', color: 'info' };
    if (score >= 60) return { label: 'Good', color: 'warning' };
    return { label: 'Needs Improvement', color: 'error' };
  };

  const formatEarnings = (amount) => {
    return `${amount.toLocaleString()} RWF`;
  };

  const getConversionRate = (activeReferrals, totalReferrals) => {
    if (!totalReferrals) return 0;
    return ((activeReferrals / totalReferrals) * 100).toFixed(1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Mobile Referrer Card component for responsive display
  const MobileReferrerCard = memo(({ referrer, rank }) => (
    <Card sx={{ mb: 2, border: rank <= 3 ? '2px solid' : '1px solid', borderColor: rank <= 3 ? (rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32') : 'divider' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {getRankIcon(rank)}
            <Typography variant="h6" fontWeight={700} sx={{ ml: 1, mr: 2 }}>
              #{rank}
            </Typography>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
              <Person />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={600} noWrap>
                {referrer.user?.fullName || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {referrer.user?.email || 'N/A'}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                onClick={() => openReferrerDetails(referrer)}
                color="primary"
                size="small"
              >
                <Visibility />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {formatEarnings(referrer.totalEarnings)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Earnings
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {referrer.totalReferrals}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Referrals
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600} color="success.main">
              {referrer.activeReferrals} active
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active Referrals
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Chip
              size="small"
              label={`${referrer.conversionRate}% conv.`}
              color={referrer.conversionRate > 50 ? 'success' : referrer.conversionRate > 25 ? 'warning' : 'error'}
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Activity Score
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {referrer.activityScore || 0}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(referrer.activityScore || 0, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: referrer.activityScore > 80 ? 'success.main' : 
                                referrer.activityScore > 60 ? 'warning.main' : 'error.main'
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  ));

  // Memoized TopPerformerCard for better performance
  const TopPerformerCard = memo(({ performer, rank }) => (
    <Card 
      sx={{ 
        height: '100%',
        border: rank <= 3 ? '2px solid' : '1px solid',
        borderColor: rank <= 3 ? (rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32') : 'divider',
        position: 'relative',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: 4,
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        {rank <= 3 && (
          <Box sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
            <Avatar sx={getRankBadgeColor(rank)} size="small">
              #{rank}
            </Avatar>
          </Box>
        )}
        
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto 16px',
            bgcolor: 'primary.light',
            fontSize: 32
          }}
        >
          <Person fontSize="inherit" />
        </Avatar>
        
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {performer.user?.fullName || 'N/A'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {performer.user?.email || 'N/A'}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6" color="success.main" fontWeight={700}>
              {formatEarnings(performer.totalEarnings)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Earnings
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" color="primary.main" fontWeight={700}>
              {performer.totalReferrals}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Referrals
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {performer.activeReferrals}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight={600}>
              {performer.conversionRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Conversion
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(performer.activityScore || 0, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: performer.activityScore > 80 ? 'success.main' : 
                                performer.activityScore > 60 ? 'warning.main' : 'error.main'
              }
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Activity Score: {performer.activityScore || 0}%
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={() => openReferrerDetails(performer)}
          sx={{ mt: 2 }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  ));

  // Memoized columns for better performance
  const columns = useMemo(() => [
    {
      field: 'rank',
      label: 'Rank',
      render: (row, index) => (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
          {getRankIcon(page * rowsPerPage + index + 1)}
          <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>
            #{page * rowsPerPage + index + 1}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'user',
      label: 'Referrer',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {row.user?.fullName || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.user?.email || 'N/A'}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Joined: {row.user?.createdAt ? format(new Date(row.user.createdAt), 'MMM yyyy') : 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'referrals',
      label: 'Referral Performance',
      render: (row) => (
        <Box sx={{ minWidth: 150 }}>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            {row.totalReferrals}
          </Typography>
          <Typography variant="body2" color="success.main">
            {row.activeReferrals} active
          </Typography>
          <Chip
            size="small"
            label={`${getConversionRate(row.activeReferrals, row.totalReferrals)}% conversion`}
            color={row.conversionRate > 50 ? 'success' : row.conversionRate > 25 ? 'warning' : 'error'}
            variant="outlined"
          />
        </Box>
      ),
    },
    {
      field: 'earnings',
      label: 'Earnings',
      render: (row) => (
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="h6" fontWeight={700} color="success.main">
            {formatEarnings(row.totalEarnings)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatEarnings(row.recentEarnings || 0)} recent
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(row.totalEarnings / Math.max(row.totalReferrals, 1)).toLocaleString()} RWF/referral
          </Typography>
        </Box>
      ),
    },
    {
      field: 'performance',
      label: 'Performance Score',
      render: (row) => {
        const performance = getPerformanceLevel(row.activityScore || 0);
        return (
          <Box sx={{ minWidth: 140 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {row.activityScore || 0}%
              </Typography>
              <Chip
                size="small"
                label={performance.label}
                color={performance.color}
                sx={{ ml: 1 }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((row.activityScore || 0), 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: row.activityScore > 80 ? 'success.main' : 
                                  row.activityScore > 60 ? 'warning.main' : 'error.main'
                }
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Detailed Analytics">
            <IconButton
              onClick={() => openReferrerDetails(row)}
              color="primary"
              size="small"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Performance Insights">
            <IconButton
              color="info"
              size="small"
            >
              <AssessmentRounded />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [openReferrerDetails, page, rowsPerPage]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'flex-start' },
        gap: { xs: 2, md: 0 }
      }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
            🏆 Referrer Leaderboard & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive referrer performance tracking and analytics dashboard
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchLeaderboard()}
            disabled={loading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportLeaderboard}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            Export
          </Button>
        </Stack>
      </Box>

      {/* Enhanced Stats Dashboard */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexDirection: { xs: 'row', sm: 'row' }, 
                textAlign: { xs: 'left', sm: 'left' },
                gap: { xs: 1.5, sm: 0 }
              }}>
                <Group sx={{ fontSize: { xs: 28, sm: 32, md: 40 }, mr: { xs: 1.5, sm: 2 } }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {stats.totalReferrers}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'}>Total Referrers</Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    +{stats.recentGrowth}% this month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexDirection: { xs: 'row', sm: 'row' }, 
                textAlign: { xs: 'left', sm: 'left' },
                gap: { xs: 1.5, sm: 0 }
              }}>
                <TrendingUp sx={{ fontSize: { xs: 28, sm: 32, md: 40 }, mr: { xs: 1.5, sm: 2 } }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {stats.totalReferrals}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'}>Total Referrals</Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    Avg: {Math.round(stats.totalReferrals / Math.max(stats.totalReferrers, 1))} per referrer
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexDirection: { xs: 'row', sm: 'row' }, 
                textAlign: { xs: 'left', sm: 'left' },
                gap: { xs: 1.5, sm: 0 }
              }}>
                <MonetizationOn sx={{ fontSize: { xs: 28, sm: 32, md: 40 }, mr: { xs: 1.5, sm: 2 } }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography 
                    variant={isMobile ? 'body1' : 'h6'} 
                    fontWeight={700} 
                    sx={{ wordBreak: 'break-word', lineHeight: 1.2 }}
                  >
                    {formatEarnings(stats.totalEarnings)}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'}>Total Earnings</Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    Distributed to referrers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText', height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexDirection: { xs: 'row', sm: 'row' }, 
                textAlign: { xs: 'left', sm: 'left' },
                gap: { xs: 1.5, sm: 0 }
              }}>
                <AssessmentRounded sx={{ fontSize: { xs: 28, sm: 32, md: 40 }, mr: { xs: 1.5, sm: 2 } }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {stats.activeReferrers}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'}>Active This Month</Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    {((stats.activeReferrers / Math.max(stats.totalReferrers, 1)) * 100).toFixed(1)}% activity rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexDirection: { xs: 'row', sm: 'row' }, 
                textAlign: { xs: 'left', sm: 'left' },
                gap: { xs: 1.5, sm: 0 }
              }}>
                <TrendingUp sx={{ fontSize: { xs: 28, sm: 32, md: 40 }, mr: { xs: 1.5, sm: 2 } }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {stats.avgConversionRate.toFixed(1)}%
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'}>Avg Conversion</Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    Platform-wide average
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} alignItems="end">
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search by referrer name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size={isMobile ? 'small' : 'medium'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              >
                {timeRanges.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {option.icon}
                      <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {option.icon}
                      <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              size={isMobile ? 'small' : 'medium'}
              onClick={() => {
                setSearch('');
                setTimeRange('all');
                setSortBy('totalEarnings');
                setPage(0);
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Top Performers Section */}
      {topPerformers.length > 0 && activeTab === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            🌟 Hall of Fame - Top 3 Performers
          </Typography>
          <Grid container spacing={3}>
            {topPerformers.slice(0, 3).map((performer, index) => (
              <Grid item xs={12} md={4} key={performer.userId}>
                <TopPerformerCard performer={performer} rank={index + 1} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Main Content */}
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: 160 },
                px: { xs: 1, sm: 3 }
              }
            }}
          >
            {tabLabels.map((label, index) => (
              <Tab 
                key={index} 
                label={isMobile ? label.replace(/[🏆📊📈🎯]/g, '').trim() : label}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={60} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6">Loading leaderboard...</Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyzing referrer performance data
                </Typography>
              </Box>
            </Box>
          ) : referrers.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 8 }}>
              <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No referrers found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start your referral program to see performance data here
              </Typography>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  {referrers.map((referrer, index) => (
                    <MobileReferrerCard 
                      key={referrer.userId} 
                      referrer={referrer} 
                      rank={page * rowsPerPage + index + 1}
                    />
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.field} sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {referrers.map((row, index) => (
                        <TableRow 
                          key={row.userId} 
                          hover 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'action.hover',
                              cursor: 'pointer'
                            } 
                          }}
                        >
                          {columns.map((column) => (
                            <TableCell key={column.field}>
                              {column.render ? column.render(row, index) : row[column.field]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <TablePagination
                component="div"
                count={pagination.total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage={isMobile ? "Per page:" : "Referrers per page:"}
                sx={{
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              />
            </>
          )}
        </Box>
      </Paper>

      {/* Referrer Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: '90vh' }
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedReferrer?.user.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Detailed Performance Analytics
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {referrerDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      👤 Referrer Profile
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {referrerDetails?.referrer?.fullName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">
                        {referrerDetails?.referrer?.email || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Join Date</Typography>
                      <Typography variant="body1">
                        {referrerDetails?.referrer?.createdAt ? format(new Date(referrerDetails.referrer.createdAt), 'PPP') : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Account Status</Typography>
                      <Chip
                        label={referrerDetails?.referrer?.isActive ? 'Active' : 'Inactive'}
                        color={referrerDetails?.referrer?.isActive ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="success.main">
                      📊 Performance Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {referrerDetails?.stats?.totalReferrals || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Referrals
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h4" color="success.main" fontWeight={700}>
                          {referrerDetails?.stats?.activeReferrals || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Referrals
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h5" color="warning.main" fontWeight={700}>
                          {formatEarnings(referrerDetails?.stats?.totalEarnings || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Earnings
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" fontWeight={600}>
                          {referrerDetails?.stats?.conversionRate || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Conversion Rate
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(referrerDetails?.stats?.conversionRate || 0)}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="info.main">
                      📅 Recent Activity
                    </Typography>
                    <List dense>
                      {(referrerDetails?.recentReferrals || []).slice(0, 5).map((referral, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: referral.isActive ? 'success.light' : 'grey.300' }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={referral?.fullName || 'N/A'}
                            secondary={`${referral?.createdAt ? format(new Date(referral.createdAt), 'MMM dd') : 'N/A'} • ${referral?.isActive ? 'Active' : 'Inactive'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {performanceData.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary.main">
                        📈 Monthly Performance Trend
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last 6 months referral and earnings data
                        </Typography>
                        {/* Placeholder for chart - you can integrate a charting library here */}
                        <Grid container spacing={2}>
                          {performanceData.slice(-6).map((month, index) => (
                            <Grid item xs={2} key={index}>
                              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(month.month + '-01'), 'MMM')}
                                </Typography>
                                <Typography variant="h6" color="primary.main">
                                  {month.referrals}
                                </Typography>
                                <Typography variant="caption" color="success.main">
                                  {formatEarnings(month.earnings)}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}