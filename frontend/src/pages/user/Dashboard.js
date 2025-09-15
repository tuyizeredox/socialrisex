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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import worldwideLogo from '../../assets/worldwide.png';

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
    dailyBonus: 500,
    level1Count: 0,
    level2Count: 0,
    level3Count: 0,
    referralBreakdown: { level1: 0, level2: 0, level3: 0 }
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
        const referralEarnings = data.earnings || 0; // Multi-level referral earnings from backend
        
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
          dailyBonus: data.dailyBonus || 500,
          // Add multilevel breakdown for detailed display
          level1Count: data.level1Count || 0,
          level2Count: data.level2Count || 0,
          level3Count: data.level3Count || 0,
          referralBreakdown: data.referralBreakdown || { level1: 0, level2: 0, level3: 0 }
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
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: 3, sm: 4 },
          p: { xs: 3, sm: 4 },
          mb: 4,
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden',
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
          <img 
            src={worldwideLogo} 
            alt="Worldwide Earn" 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%',
              marginBottom: 16,
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          />
          <Typography 
            variant="h3" 
            fontWeight={800} 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2 
            }}
          >
            Welcome back, {user.fullName}! 🌟
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9, 
              mb: 2, 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 1, sm: 0 } 
            }}
          >
            Ready to earn more with Worldwide Earn?
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 1, sm: 2 }, 
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              variant="contained"
              size="large"
              fullWidth={true}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 3,
                px: 3,
                py: { xs: 1.5, sm: 1 },
                fontWeight: 'bold',
                maxWidth: { sm: 200 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
              onClick={() => navigate('/app/videos')}
            >
              🎥 Watch Videos
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth={true}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 3,
                px: 3,
                py: { xs: 1.5, sm: 1 },
                fontWeight: 'bold',
                maxWidth: { sm: 200 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
              onClick={() => navigate('/app/referrals')}
            >
              👥 Invite Friends
            </Button>
          </Box>
        </Box>
      </Box>
      
      <Alert 
        severity="success" 
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white', 
          fontWeight: 'bold',
          borderRadius: 2,
          fontSize: { xs: '0.85rem', sm: '0.875rem' },
          '& .MuiAlert-icon': { color: 'white' },
          '& .MuiAlert-message': {
            padding: { xs: '4px 0', sm: '8px 0' }
          }
        }}
      >
        🎉 Congratulations! You've received a RWF {stats.welcomeBonus} welcome bonus. Start earning more by watching videos and growing your team!
      </Alert>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
              borderRadius: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3 },
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(255, 152, 0, 0.4)'
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                animation: 'shimmer 3s infinite linear'
              }
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 } }}>
              <MonetizationOn sx={{ fontSize: { xs: 36, sm: 48 }, mb: 1 }} />
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                {stats.points.toLocaleString()} pts
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Total Points
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  mt: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Including {stats.welcomeBonus} welcome bonus
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              borderRadius: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3 },
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(33, 150, 243, 0.4)'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <PlayCircle sx={{ fontSize: { xs: 36, sm: 48 }, mb: 1 }} />
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                {stats.videoPoints.toLocaleString()} pts
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Video Points
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  mt: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                From {stats.videosWatched} videos watched
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              borderRadius: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3 },
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
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <TrendingUp sx={{ fontSize: { xs: 36, sm: 48 }, mb: 1 }} />
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                RWF {stats.referralEarnings.toLocaleString()}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Referral Earnings
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  mt: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                L1: {stats.level1Count} • L2: {stats.level2Count} • L3: {stats.level3Count}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7, 
                  display: 'block', 
                  mt: 0.5,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                RWF {stats.referralBreakdown.level1?.toLocaleString()} + {stats.referralBreakdown.level2?.toLocaleString()} + {stats.referralBreakdown.level3?.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
              borderRadius: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3 },
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 16px 40px rgba(156, 39, 176, 0.4)'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <People sx={{ fontSize: { xs: 36, sm: 48 }, mb: 1 }} />
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                {stats.referrals}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Team Members
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  mt: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {stats.activeReferrals} active members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box 
        mt={4} 
        p={{ xs: 3, sm: 4 }}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 5, 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="27" cy="7" r="1"/%3E%3Ccircle cx="47" cy="7" r="1"/%3E%3Ccircle cx="7" cy="27" r="1"/%3E%3Ccircle cx="27" cy="27" r="1"/%3E%3Ccircle cx="47" cy="27" r="1"/%3E%3Ccircle cx="7" cy="47" r="1"/%3E%3Ccircle cx="27" cy="47" r="1"/%3E%3Ccircle cx="47" cy="47" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1
          }
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight={800} 
          color="white" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          🚀 Multi-Level Referral System!
        </Typography>
        <Typography 
          variant="h6" 
          mt={1} 
          color="white" 
          sx={{ 
            position: 'relative', 
            zIndex: 1, 
            opacity: 0.9,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            px: { xs: 1, sm: 0 }
          }}
        >
          Build your team and earn from 3 levels deep
        </Typography>
        <Box mt={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="body1" 
            color="white" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}
          >
            💰 Level 1: 4,000 RWF | Level 2: 2,000 RWF | Level 3: 500 RWF
          </Typography>
        </Box>
        <Button 
          variant="contained"
          size="large"
          sx={{ 
            mt: 3, 
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            textTransform: 'none', 
            fontWeight: 'bold',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
            boxShadow: 3,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            '&:hover': {
              boxShadow: 5,
              transform: 'translateY(-2px)'
            },
            position: 'relative',
            zIndex: 1
          }}
          onClick={() => navigate('/app/referrals')}
          endIcon={<ArrowForward />}
        >
          View Your Team Dashboard
        </Button>
      </Box>

      <Box mt={4}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: 3,
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: { xs: 3, sm: 4 } }}>
              <Share sx={{ fontSize: { xs: 48, sm: 60 }, mb: 2 }} />
              <Typography 
                variant="h5" 
                fontWeight={700} 
                gutterBottom
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                📢 Share & Earn
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Share your referral link and build your earning team of {stats.referrals} members.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.8, sm: 1 },
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
                onClick={() => navigate('/app/referrals')}
                endIcon={<ArrowForward />}
              >
                Share Now
              </Button>
            </CardContent>
          </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Multilevel Earnings Breakdown Section */}
      <Box 
        mt={4} 
        p={{ xs: 3, sm: 4 }}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 5, 
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="27" cy="7" r="1"/%3E%3Ccircle cx="47" cy="7" r="1"/%3E%3Ccircle cx="7" cy="27" r="1"/%3E%3Ccircle cx="27" cy="27" r="1"/%3E%3Ccircle cx="47" cy="27" r="1"/%3E%3Ccircle cx="7" cy="47" r="1"/%3E%3Ccircle cx="27" cy="47" r="1"/%3E%3Ccircle cx="47" cy="47" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1
          }
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight={800} 
          gutterBottom 
          sx={{ 
            position: 'relative', 
            zIndex: 1, 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          💰 Your Multilevel Earnings Breakdown
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            position: 'relative', 
            zIndex: 1, 
            textAlign: 'center', 
            opacity: 0.9, 
            mb: 3,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            px: { xs: 1, sm: 0 }
          }}
        >
          Track your earnings across all three levels of your referral network
        </Typography>
        
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: { xs: 2, sm: 3 },
                color: 'white',
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 }
              }}
            >
              <CardContent>
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  color="inherit"
                  sx={{ fontSize: { xs: '1.8rem', sm: '3rem' } }}
                >
                  {stats.level1Count}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }} 
                  gutterBottom
                >
                  Level 1 Members
                </Typography>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  color="inherit"
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                >
                  RWF {stats.referralBreakdown.level1?.toLocaleString() || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.8, 
                    mt: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  4,000 RWF per active member
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: { xs: 2, sm: 3 },
                color: 'white',
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 }
              }}
            >
              <CardContent>
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  color="inherit"
                  sx={{ fontSize: { xs: '1.8rem', sm: '3rem' } }}
                >
                  {stats.level2Count}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }} 
                  gutterBottom
                >
                  Level 2 Members
                </Typography>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  color="inherit"
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                >
                  RWF {stats.referralBreakdown.level2?.toLocaleString() || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.8, 
                    mt: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  2,000 RWF per active member
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: { xs: 2, sm: 3 },
                color: 'white',
                textAlign: 'center',
                p: { xs: 1.5, sm: 2 }
              }}
            >
              <CardContent>
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  color="inherit"
                  sx={{ fontSize: { xs: '1.8rem', sm: '3rem' } }}
                >
                  {stats.level3Count}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }} 
                  gutterBottom
                >
                  Level 3 Members
                </Typography>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  color="inherit"
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                >
                  RWF {stats.referralBreakdown.level3?.toLocaleString() || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.8, 
                    mt: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  500 RWF per active member
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', mt: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Total Referral Earnings: RWF {stats.referralEarnings.toLocaleString()}
          </Typography>
          <Button 
            variant="contained"
            size="large"
            sx={{ 
              mt: 2, 
              px: 4,
              py: 1.5,
              textTransform: 'none', 
              fontWeight: 'bold',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 5,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate('/app/referrals')}
            endIcon={<ArrowForward />}
          >
            View Full Team Details
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
