import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  People,
  VideoLibrary,
  MonetizationOn,
  AccountBalance,
  TrendingUp,
  Security,
  Dashboard as DashboardIcon,
  Refresh,
  Notifications,
  Settings,
  Receipt
} from '@mui/icons-material';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import worldwideLogo from '../../assets/worldwide.png';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Admin stats error:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Modern Header Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={worldwideLogo} 
                alt="Worldwide Earn" 
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  marginRight: 16,
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
              />
              <Box>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  🌐 Admin Control Center
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Worldwide Earn Platform Management
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={fetchStats}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Refresh />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Notifications />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Settings />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Security />}
              label="System Status: Online"
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                color: 'white',
                border: '1px solid rgba(76, 175, 80, 0.3)',
              }}
            />
            <Chip
              icon={<DashboardIcon />}
              label={`Last Updated: ${new Date().toLocaleTimeString()}`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              borderRadius: 4,
              p: 3,
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(33, 150, 243, 0.4)'
              },
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <People sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.totalUsers?.toLocaleString() || 0}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Total Users
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                {stats?.activeUsers || 0} active members
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats?.activeUsers && stats?.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.8)' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
              borderRadius: 4,
              p: 3,
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 188, 212, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(0, 188, 212, 0.4)'
              }
            }}
          >
            <CardContent>
              <VideoLibrary sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.totalVideos?.toLocaleString() || 0}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Total Videos
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                {stats?.activeVideos || 0} currently active
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats?.activeVideos && stats?.totalVideos ? (stats.activeVideos / stats.totalVideos) * 100 : 0}
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.8)' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              borderRadius: 4,
              p: 3,
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(76, 175, 80, 0.4)'
              }
            }}
          >
            <CardContent>
              <MonetizationOn sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.totalPoints?.toLocaleString() || 0}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Points Distributed
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Across all users
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  +12% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
              borderRadius: 4,
              p: 3,
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(255, 152, 0, 0.4)'
              }
            }}
          >
            <CardContent>
              <AccountBalance sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.pendingWithdrawals?.toLocaleString() || 0}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Pending Withdrawals
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                RWF {stats?.pendingAmount?.toLocaleString() || 0}
              </Typography>
              <Chip
                label="Action Required"
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats Row */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
              borderRadius: 4,
              p: 3,
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(156, 39, 176, 0.4)',
                cursor: 'pointer'
              }
            }}
            onClick={() => window.location.href = '/admin/transactions'}
          >
            <CardContent>
              <Receipt sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.pendingTransactions?.toLocaleString() || 0}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ opacity: 0.9 }}>
                Pending Transactions
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Awaiting approval
              </Typography>
              <Chip
                label={stats?.pendingTransactions > 0 ? "Needs Review" : "All Clear"}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: stats?.pendingTransactions > 0 ? 'rgba(255,152,0,0.8)' : 'rgba(76,175,80,0.8)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                p: 3
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                📊 Recent Platform Activity
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 3,
                      pb: 2,
                      borderBottom: index < stats.recentActivity.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        sx={{ 
                          bgcolor: 'primary.light', 
                          width: 40, 
                          height: 40, 
                          mr: 2 
                        }}
                      >
                        <DashboardIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {activity.description || 'System Activity'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(activity.timestamp || Date.now()).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar
                    sx={{ 
                      bgcolor: 'grey.100', 
                      width: 60, 
                      height: 60, 
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <DashboardIcon sx={{ color: 'grey.400' }} />
                  </Avatar>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No recent activity to display
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System activities will appear here as they occur
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider',
              mb: 3
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                color: 'white',
                p: 3
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                ⚡ System Health
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Server Status
                  </Typography>
                  <Chip
                    label="Online"
                    size="small"
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ 
                    bgcolor: 'success.light',
                    '& .MuiLinearProgress-bar': { bgcolor: 'success.main' }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Database Connection
                  </Typography>
                  <Chip
                    label="Connected"
                    size="small"
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ 
                    bgcolor: 'success.light',
                    '& .MuiLinearProgress-bar': { bgcolor: 'success.main' }
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last System Update
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date().toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Platform Version
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  Worldwide Earn v2.0.1
                </Typography>
              </Box>
            </CardContent>
          </Paper>

          {/* Quick Actions Card */}
          <Paper
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
                color: 'white',
                p: 3
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                🚀 Quick Actions
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Chip
                  label="📊 Generate Reports"
                  clickable
                  sx={{
                    p: 1,
                    justifyContent: 'flex-start',
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' }
                  }}
                />
                <Chip
                  label="👥 Manage Users"
                  clickable
                  sx={{
                    p: 1,
                    justifyContent: 'flex-start',
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'info.light', color: 'info.contrastText' }
                  }}
                />
                <Chip
                  label="🎥 Video Management"
                  clickable
                  sx={{
                    p: 1,
                    justifyContent: 'flex-start',
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'success.light', color: 'success.contrastText' }
                  }}
                />
                <Chip
                  label="💰 Withdrawal Requests"
                  clickable
                  sx={{
                    p: 1,
                    justifyContent: 'flex-start',
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'warning.light', color: 'warning.contrastText' }
                  }}
                />
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 