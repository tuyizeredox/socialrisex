import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Button,
  Alert,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  MonetizationOn,
  People,
  PlayCircle,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function Dashboard() {
  const [stats, setStats] = useState({
    points: 0,
    videoPoints: 0,
    welcomeBonus: 3000,
    earnings: 0,
    referralEarnings: 0,
    videosWatched: 0,
    referrals: 0,
    activeReferrals: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, referralRes, videosRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/referral-info'),
        api.get('/users/watched-videos')
      ]);
      
      if (statsRes.data?.data) {
        const data = statsRes.data.data;
        const referralEarnings = (referralRes.data?.activeReferrals || 0) * 2800;
        
        setStats({
          points: data.points || 0,
          videoPoints: data.videoPoints || 0,
          welcomeBonus: data.welcomeBonus || 3000,
          earnings: referralEarnings || 0,
          referralEarnings: referralEarnings || 0,
          activeReferrals: data.activeReferrals || 0,
          referrals: data.referrals || 0,
          videosWatched: data.videosWatched || 0
        });
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load dashboard data';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  // Handle video completion
  useEffect(() => {
    const handleVideoComplete = (event) => {
      const { pointsEarned, videoPoints } = event.detail;
      setStats(prevStats => ({
        ...prevStats,
        points: prevStats.points + pointsEarned,
        videoPoints: videoPoints,
        videosWatched: prevStats.videosWatched + 1
      }));
    };
  
    window.addEventListener('videoCompleted', handleVideoComplete);
    return () => window.removeEventListener('videoCompleted', handleVideoComplete);
  }, []);
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
      >
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
    <Container>
      <PageHeader 
        title={`Welcome back, ${user.fullName}!`}
        action={
          !user.isActive && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/app/activate')}
            >
              Activate Account
            </Button>
          )
        }
      />

      {!user.isActive && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your account is not activated. Activate your account to start earning points and rewards.
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Points"
            value={
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {`${(stats?.points || 0).toLocaleString()} points`}
                </Typography>
                <Typography variant="subtitle1" color="success.main" sx={{ mt: 0.5 }}>
                  {`≈ RWF ${(stats?.points || 0).toLocaleString()}`}
                </Typography>
              </Box>
            }
            subtitle={
              <Typography variant="body2" color="text.secondary">
                Including <Box component="span" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                  {(stats?.welcomeBonus || 0).toLocaleString()}
                </Box> welcome bonus
              </Typography>
            }
            icon={MonetizationOn}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Video Points"
            value={`${(stats?.videoPoints || 0).toLocaleString()} pts`}
            subtitle={`From ${stats?.videosWatched || 0} videos watched`}
            icon={PlayCircle}
            color="info"
            action={user.isActive && {
              label: 'Watch Videos',
              onClick: () => navigate('/app/videos')
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`RWF ${(stats?.earnings || 0).toLocaleString()}`}
            subtitle={`From ${stats?.activeReferrals || 0} active referrals`}
            icon={MonetizationOn}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={stats?.referrals || 0}
            subtitle={`${stats?.activeReferrals || 0} active members`}
            icon={People}
            color="warning"
            action={{
              label: 'View Team',
              onClick: () => navigate('/app/referrals')
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 4,
              bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'background.paper',
              borderRadius: 3,
              boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
              border: '1px solid',
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : theme.palette.divider,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: theme => `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.15)'}`,
                transform: 'translateY(-4px)',
                borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : theme.palette.primary.main
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Box>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{
                    fontWeight: 700,
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px',
                    textShadow: theme => theme.palette.mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                    mb: 2
                  }}
                >
                  Your Referral Link
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme => theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[800],
                    fontWeight: 500,
                    opacity: 0.9
                  }}
                >
                  Share this link to earn RWF 2,800 per active member
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/app/referrals')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: theme => `0 8px 24px ${theme.palette.primary.main}40`,
                    background: theme => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                  }
                }}
              >
                View Details
              </Button>
            </Box>
            <Box
              sx={{
                p: 3,
                bgcolor: theme => theme.palette.mode === 'dark' 
                  ? `linear-gradient(145deg, ${theme.palette.primary.dark}20, ${theme.palette.secondary.dark}30)`
                  : `linear-gradient(145deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}25)`,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme => theme.palette.mode === 'dark' 
                  ? `${theme.palette.primary.main}40`
                  : `${theme.palette.primary.main}30`,
                position: 'relative',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(8px)',
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? `0 8px 32px -4px ${theme.palette.primary.main}30`
                  : `0 8px 32px -4px ${theme.palette.primary.main}80`,
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark'
                    ? `linear-gradient(145deg, ${theme.palette.primary.dark}30, ${theme.palette.secondary.dark}40)`
                    : `linear-gradient(145deg, ${theme.palette.primary.light}25, ${theme.palette.secondary.light}35)`,
                  borderColor: theme => theme.palette.primary.main,
                  transform: 'scale(1.01)',
                  boxShadow: theme => `0 12px 40px -8px ${theme.palette.primary.main}40`
                }
              }}
            >
              <Typography 
                variant="body1"
                sx={{
                  fontFamily: 'monospace',
                  letterSpacing: 0.5,
                  fontSize: '1rem',
                  color: theme => theme.palette.mode === 'dark' 
                    ? theme.palette.primary.light 
                    : theme.palette.primary.dark,
                  fontWeight: 600,
                  wordBreak: 'break-all',
                  textShadow: theme => theme.palette.mode === 'dark'
                    ? '0 0 8px rgba(255,255,255,0.2)'
                    : 'none'
                }}
              >
                {`${window.location.origin}/register?ref=${user?.referralCode || ''}`}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
} // Make sure this is the last closing brace