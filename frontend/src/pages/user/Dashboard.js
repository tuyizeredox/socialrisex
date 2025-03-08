import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Button,
  Alert,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  MonetizationOn,
  People,
  PlayCircle,
  Star,
  TrendingUp,
  ArrowForward,
  Share,
  Redeem,
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
    activeReferrals: 0,
    topRank: 0,
    dailyBonus: 500
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
          earnings: referralEarnings + (data.points || 0),
          referralEarnings: referralEarnings || 0,
          activeReferrals: data.activeReferrals || 0,
          referrals: data.referrals || 0,
          videosWatched: data.videosWatched || 0,
          topRank: data.topRank || 0,
          dailyBonus: data.dailyBonus || 500
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

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    <Container>
      <PageHeader title={`Welcome back, ${user.fullName}!`} />
      
      <Alert severity="info" sx={{ mb: 3, bgcolor: 'primary.light', color: 'white', fontWeight: 'bold' }}>
        🎉 Congratulations! You've received a RWF {stats.welcomeBonus} welcome bonus. Start earning more by watching videos and growing your team!
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Points" 
            value={`${stats.points.toLocaleString()} pts`} 
            subtitle={`Including ${stats.welcomeBonus} welcome bonus | Worth RWF ${stats.points.toLocaleString()}`} 
            icon={MonetizationOn} 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Video Points"
            value={`${stats.videoPoints.toLocaleString()} pts`}
            subtitle={`From ${stats.videosWatched} videos watched | Worth RWF ${stats.videoPoints.toLocaleString()}`}
            icon={PlayCircle}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`RWF ${stats.earnings.toLocaleString()}`}
            subtitle="Total from referrals and points"
            icon={MonetizationOn}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={stats.referrals}
            subtitle={`${stats.activeReferrals} active members`}
            icon={People}
            color="warning"
          />
        </Grid>
      </Grid>
      
      <Box mt={4} p={3} bgcolor="secondary.light" borderRadius={3} boxShadow={3} textAlign="center">
        <Typography variant="h5" fontWeight={700} color="white">
          🚀 Earn More with Referrals!
        </Typography>
        <Typography variant="body1" mt={1} color="white">
          Invite friends and earn RWF 2,800 per active referral. The more you invite, the more you earn!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}
          onClick={() => navigate('/app/referrals')}
        >
          Start Referring Now
        </Button>
      </Box>

      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>🎁 Redeem Rewards</Typography>
              <Typography variant="body2">Use your points to redeem exciting rewards.</Typography>
              <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={() => navigate('/app/rewards')}>
                Redeem Now <Redeem sx={{ ml: 1 }} />
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>📢 Share & Earn</Typography>
              <Typography variant="body2">Share your referral link and earn rewards.</Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Share Now <Share sx={{ ml: 1 }} />
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
