import { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  EmojiEvents,
  Person,
  MonetizationOn,
  Group,
  TrendingUp,
  AssessmentRounded,
  Star,
  ExpandMore
} from '@mui/icons-material';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

export default function UserLeaderboard() {
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalReferrers: 0,
    totalReferrals: 0,
    totalEarnings: 0,
    activeReferrers: 0,
    avgConversionRate: 0,
    topEarner: null,
    recentGrowth: 0
  });
  
  const { showNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/leaderboard');
      
      if (response.data && response.data.referrers) {
        setReferrers(response.data.referrers);
        setStats(response.data.stats || stats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      
      const errorMessage = error.message || 
                          error.response?.data?.message || 
                          'Failed to fetch leaderboard data.';
      showNotification(errorMessage, 'error');
      
      setReferrers([]);
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
  }, [showNotification]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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

  const formatEarnings = (amount) => {
    return `${amount.toLocaleString()} RWF`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6">Loading leaderboard...</Typography>
            <Typography variant="body2" color="text.secondary">
              Analyzing referrer performance data
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

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
            🏆 Top Referrers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            See the top earners from referrals in the platform
          </Typography>
        </Box>
      </Box>

      {/* Stats Dashboard */}
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
                  <Typography variant={isMobile ? 'caption' : 'body2'}>Active Referrers</Typography>
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
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leaderboard Table */}
      <Paper sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Referrer</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Referrals</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Earnings</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Conversion Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {referrers.map((referrer, index) => {
                const rank = page * rowsPerPage + index + 1;
                return (
                  <TableRow 
                    key={referrer.userId} 
                    hover 
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      } 
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
                        {getRankIcon(rank)}
                        <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>
                          #{rank}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {referrer.user?.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {referrer.user?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 150 }}>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          {referrer.totalReferrals}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          {referrer.activeReferrals} active
                        </Typography>
                        <Chip
                          size="small"
                          label={`${referrer.conversionRate}% conversion`}
                          color={referrer.conversionRate > 50 ? 'success' : referrer.conversionRate > 25 ? 'warning' : 'error'}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {formatEarnings(referrer.totalEarnings)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(referrer.totalEarnings / Math.max(referrer.totalReferrals, 1)).toLocaleString()} RWF/referral
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 140 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {referrer.activityScore || 0}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((referrer.activityScore || 0), 100)}
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={referrers.length} // In a real implementation, this would be the total count
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
      </Paper>

      {referrers.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 8 }}>
          <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No referrers found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start referring others to see performance data here
          </Typography>
        </Box>
      )}
    </Container>
  );
}