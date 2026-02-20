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
import { useTheme } from '@mui/material/styles';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import GamificationCard from '../../components/common/GamificationCard';
import ProgressRing from '../../components/common/ProgressRing';
import AchievementBadge from '../../components/common/AchievementBadge';
// Logo is in public folder, referenced directly in JSX

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Modern Header Section */}
      <Box 
        sx={{ 
          background: isDark 
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: { xs: 3, sm: 4 },
          p: { xs: 3, sm: 4 },
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark 
            ? '0 20px 40px rgba(0, 0, 0, 0.4)'
            : `0 20px 40px ${theme.palette.primary.main}40`,
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <img 
                src={process.env.PUBLIC_URL + '/logo.png'}
                alt="Pesa Boost"
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  marginRight: 16,
                  marginBottom: 8,
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
              />
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={800} 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  🌐 Admin Control Center
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  Pesa Boost Platform Management
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              justifyContent: { xs: 'center', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <IconButton 
                onClick={fetchStats}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  size: { xs: 'small', sm: 'medium' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Refresh />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  size: { xs: 'small', sm: 'medium' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Notifications />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  size: { xs: 'small', sm: 'medium' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Settings />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Chip
              icon={<Security />}
              label="System Status: Online"
              size="small"
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                color: 'white',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                '& .MuiChip-icon': {
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }
              }}
            />
            <Chip
              icon={<DashboardIcon />}
              label={`Last Updated: ${new Date().toLocaleTimeString()}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                '& .MuiChip-icon': {
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Admin Statistics Grid */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <GamificationCard
            title="Community Members"
            value={stats?.totalUsers?.toLocaleString() || 0}
            subtitle={`${stats?.activeUsers || 0} active today`}
            icon={People}
            gradient={isDark 
              ? 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)'
              : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
            }
            progress={stats?.activeUsers || 0}
            progressMax={stats?.totalUsers || 1}
            glowing={false}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <GamificationCard
            title="Video Quests"
            value={stats?.totalVideos?.toLocaleString() || 0}
            subtitle={`${stats?.activeVideos || 0} currently active`}
            icon={VideoLibrary}
            gradient={isDark 
              ? 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)'
              : 'linear-gradient(135deg, #0277bd 0%, #29b6f6 100%)'
            }
            progress={stats?.activeVideos || 0}
            progressMax={stats?.totalVideos || 1}
            glowing={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GamificationCard
            title="Reward Tokens"
            value={stats?.totalPoints?.toLocaleString() || 0}
            subtitle="Distributed to players"
            icon={MonetizationOn}
            gradient={isDark 
              ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
              : 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)'
            }
            badge={stats?.pointsGrowthPercentage ? `+${stats.pointsGrowthPercentage}% growth` : null}
            glowing={false}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <GamificationCard
            title="Total Platform Earnings"
            value={`RWF ${((stats?.activeUsers || 0) * 8000).toLocaleString()}`}
            subtitle={`From ${stats?.activeUsers || 0} active users`}
            icon={TrendingUp}
            gradient={isDark 
              ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #FF6B9D 70%, #C44569 100%)'
              : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #FF6B9D 70%, #C44569 100%)'
            }
            badge={stats?.activeUsers > 0 ? "Active Platform" : "No Activity"}
            glowing={stats?.activeUsers > 0}
            progress={stats?.activeUsers || 0}
            progressMax={stats?.totalUsers || 1}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <GamificationCard
            title="Pending Cashouts"
            value={stats?.pendingWithdrawals?.toLocaleString() || 0}
            subtitle={`RWF ${stats?.pendingAmount?.toLocaleString() || 0}`}
            icon={AccountBalance}
            gradient={isDark 
              ? 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)'
              : 'linear-gradient(135deg, #f57c00 0%, #ff8a65 100%)'
            }
            badge={stats?.pendingWithdrawals > 0 ? "Action Required" : "All Clear"}
            glowing={stats?.pendingWithdrawals > 0}
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.05)',
              }
            }}
            onClick={() => window.location.href = '/admin/withdrawals'}
          />
        </Grid>
      </Grid>

      {/* Additional Stats Row */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: isDark 
                ? 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)'
                : 'linear-gradient(135deg, #7b1fa2 0%, #5e35b1 100%)',
              borderRadius: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3 },
              color: 'white',
              textAlign: 'center',
              boxShadow: isDark 
                ? '0 8px 32px rgba(156, 39, 176, 0.3)'
                : '0 8px 32px rgba(123, 31, 162, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: isDark 
                  ? '0 16px 40px rgba(156, 39, 176, 0.4)'
                  : '0 16px 40px rgba(123, 31, 162, 0.5)',
                cursor: 'pointer'
              }
            }}
            onClick={() => window.location.href = '/admin/transactions'}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Receipt sx={{ fontSize: { xs: 36, sm: 48 }, mb: 1 }} />
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
                background: isDark 
                  ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                  : 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
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
                background: isDark 
                  ? 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)'
                  : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
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
                  Pesa Boost v2.0.1
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
                background: isDark 
                  ? 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)'
                  : 'linear-gradient(135deg, #7b1fa2 0%, #5e35b1 100%)',
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