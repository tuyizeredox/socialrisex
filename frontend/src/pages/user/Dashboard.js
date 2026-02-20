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
  Chip,
  Avatar,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  MonetizationOn,
  People,
  PlayCircle,
  PhotoCamera,
  Star,
  TrendingUp,
  ArrowForward,
  Share,
  EmojiEvents,
  LocalFireDepartment,
  Diamond,
  Rocket,
  Flash,
  WorkspacePremium,
  Whatshot,
  Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import GamificationCard from '../../components/common/GamificationCard';
import ProgressRing from '../../components/common/ProgressRing';
import AchievementBadge from '../../components/common/AchievementBadge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
// Logo is in public folder, referenced directly in JSX

export default function Dashboard() {
  const [stats, setStats] = useState({
    points: 0,
    videoPoints: 0,
    photoPoints: 0,
    photoShares: 0,
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
  
  // Gamification states
  const [userLevel, setUserLevel] = useState(1);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(1000);
  const [achievements, setAchievements] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState({ current: 0, target: 50 });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Gamification helper functions
  const calculateLevel = (totalPoints) => {
    if (totalPoints < 1000) return 1;
    if (totalPoints < 5000) return 2;
    if (totalPoints < 15000) return 3;
    if (totalPoints < 30000) return 4;
    if (totalPoints < 50000) return 5;
    return Math.floor(totalPoints / 10000) + 1;
  };

  const calculateNextLevelXP = (currentLevel) => {
    const xpThresholds = [0, 1000, 5000, 15000, 30000, 50000];
    if (currentLevel < xpThresholds.length) {
      return xpThresholds[currentLevel];
    }
    return 50000 + (currentLevel - 5) * 10000;
  };

  const calculateAchievements = (data) => {
    const earned = [];
    
    if (data.videosWatched >= 1) earned.push('first_video');
    if (data.photoShares >= 1) earned.push('first_photo');
    if (dailyStreak >= 3) earned.push('streak_3');
    if (dailyStreak >= 7) earned.push('streak_7');
    if (data.referrals >= 1) earned.push('referral_1');
    if (data.referrals >= 10) earned.push('referral_10');
    if (data.points >= 1000) earned.push('earnings_1000');
    if (data.points >= 10000) earned.push('earnings_10000');
    if (data.videosWatched >= 10) earned.push('speed_demon');
    if (data.photoShares >= 10) earned.push('photo_master');
    
    return earned;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, referralRes, videosRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/referral-info'),
        api.get('/users/watched-videos')
      ]);
      
      if (statsRes.data?.data) {
        const data = statsRes.data.data;
        
        // Calculate referral earnings from breakdown (level1 + level2 + level3)
        const referralBreakdown = data.referralBreakdown || { level1: 0, level2: 0, level3: 0 };
        const referralEarnings = (referralBreakdown.level1 || 0) + 
                                 (referralBreakdown.level2 || 0) + 
                                 (referralBreakdown.level3 || 0);
        
        const totalPoints = (data.points || 0) + referralEarnings;
        const currentLevel = calculateLevel(totalPoints);
        const nextLevelThreshold = calculateNextLevelXP(currentLevel);
        
        setStats({
          points: data.points || 0,
          videoPoints: data.videoPoints || 0,
          photoPoints: data.photoPoints || 0,
          photoShares: data.photoShares || 0,
          welcomeBonus: data.welcomeBonus || 3000,
          earnings: data.earnings || 0,
          referralEarnings: referralEarnings,
          activeReferrals: data.activeReferrals || 0,
          referrals: data.referrals || 0,
          videosWatched: data.videosWatched || 0,
          topRank: data.topRank || 0,
          dailyBonus: data.dailyBonus || 500,
          level1Count: data.level1Count || 0,
          level2Count: data.level2Count || 0,
          level3Count: data.level3Count || 0,
          referralBreakdown: referralBreakdown
        });

        // Update gamification states
        setUserLevel(currentLevel);
        setExperiencePoints(totalPoints);
        setNextLevelXP(nextLevelThreshold);
        setAchievements(calculateAchievements(data));
        setDailyStreak(Math.floor(Math.random() * 10)); // Mock streak data
        setWeeklyProgress({ current: data.videosWatched || 0, target: 50 });
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load dashboard data';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification, dailyStreak]);

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
    <Container 
      maxWidth="xl" 
      sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        pb: { xs: 2, sm: 4 },
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #dcfce7 75%, #ecfdf5 100%)',
        backgroundAttachment: 'fixed',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Hero Section with Level & Profile */}
      <Paper 
        elevation={0}
        sx={{ 
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: 4, sm: 6 },
          p: { xs: 3, sm: 5 },
          mb: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(148, 163, 184, 0.1)' 
            : '1px solid rgba(15, 23, 42, 0.05)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(0,0,0,0.3)'
            : '0 20px 40px rgba(0,0,0,0.05)',
        }}
      >
        {/* Animated Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark'
              ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M30 30l-10-10 10-10 10 10-10 10zM10 10l10 10-10 10-10-10 10-10zM50 10l10 10-10 10-10-10 10-10zM10 50l10 10-10 10-10-10 10-10zM50 50l10 10-10 10-10-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.03'%3E%3Cpath d='M30 30l-10-10 10-10 10 10-10 10zM10 10l10 10-10 10-10-10 10-10zM50 10l10 10-10 10-10-10 10-10zM10 50l10 10-10 10-10-10 10-10zM50 50l10 10-10 10-10-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: theme.palette.mode === 'dark' ? 0.3 : 0.6,
            animation: 'float 8s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(5deg)' },
            },
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Level and Streak Info */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            animation: 'bounceIn 0.8s ease-out',
            '@keyframes bounceIn': {
              '0%': { opacity: 0, transform: 'scale(0.3)' },
              '50%': { opacity: 1, transform: 'scale(1.05)' },
              '70%': { transform: 'scale(0.9)' },
              '100%': { transform: 'scale(1)' }
            }
          }}>
            <Chip
              icon={<Rocket />}
              label={`Level ${userLevel}`}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 1,
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(-5deg)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                },
                '& .MuiChip-icon': { color: '#ffffff' }
              }}
            />
            {dailyStreak > 0 && (
              <Chip
                icon={<LocalFireDepartment />}
                label={`${dailyStreak} Day Streak`}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 1,
                  boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' }
                  },
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.6)',
                  },
                  '& .MuiChip-icon': { color: '#ffffff' }
                }}
              />
            )}
            <Chip
              icon={<Star />}
              label="Elite"
              sx={{
                background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)', // Yellowish green
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 1,
                boxShadow: '0 4px 15px rgba(163, 230, 53, 0.4)',
                '& .MuiChip-icon': { color: '#000000' }
              }}
            />
          </Box>

          {/* Profile Section */}
          <Avatar
            src={process.env.PUBLIC_URL + '/logo.png'}
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              mx: 'auto',
              mb: 2,
              border: `4px solid ${theme.palette.primary.main}`,
              boxShadow: `0 10px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(79, 70, 229, 0.2)'}`,
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' }
              },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 15px 40px rgba(79, 70, 229, 0.4)',
              }
            }}
          />
          
          <Typography 
            variant="h3" 
            fontWeight={800} 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              background: `linear-gradient(45deg, #0284c7, #38bdf8)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2 
            }}
          >
            Welcome back, {user.fullName}! 🌟
          </Typography>

          {/* Quick Stats Comparison */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mt: 2, 
            mb: 1,
            flexWrap: 'wrap'
          }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 3,
                borderRadius: 4,
                bgcolor: 'rgba(56, 189, 248, 0.05)',
                border: `1px solid rgba(56, 189, 248, 0.2)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: { xs: '100%', sm: 140 },
                flex: { xs: '1 1 100%', sm: 'none' }
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Activation Fee
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7' }}>
                6,000 RWF
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 3,
                borderRadius: 4,
                bgcolor: 'rgba(56, 189, 248, 0.05)',
                border: `1px solid rgba(56, 189, 248, 0.2)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: { xs: '100%', sm: 140 },
                flex: { xs: '1 1 100%', sm: 'none' }
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Earnings
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7' }}>
                {stats.earnings.toLocaleString()} RWF
              </Typography>
            </Paper>
          </Box>

          {/* XP Progress */}
          <Box sx={{ 
            mt: 3, 
            mb: 3,
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Experience Points: {experiencePoints.toLocaleString()} / {nextLevelXP.toLocaleString()}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
                animation: 'glow 2s ease-in-out infinite',
              },
              '@keyframes glow': {
                '0%, 100%': { opacity: 0.5 },
                '50%': { opacity: 1 }
              }
            }}>
              <ProgressRing
                progress={experiencePoints}
                max={nextLevelXP}
                size={isMobile ? 100 : 120}
                color={theme.palette.mode === 'dark' ? "#06d6a0" : "#10b981"}
                centerContent={
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? "#06d6a0" : "#10b981"}>
                      {Math.round((experiencePoints / nextLevelXP) * 100)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      to next level
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 1, sm: 2 }, 
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            maxWidth: { xs: '100%', sm: 500 },
            mx: 'auto',
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayCircle />}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: '0 12px 28px rgba(56, 189, 248, 0.5)',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                }
              }}
              onClick={() => navigate('/app/videos')}
            >
              Watch & Earn
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<People />}
              sx={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                boxShadow: '0 8px 20px rgba(56, 189, 248, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: '0 12px 28px rgba(125, 211, 252, 0.5)',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                }
              }}
              onClick={() => navigate('/app/referrals')}
            >
              Invite & Earn
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Welcome Bonus Alert */}
      <Alert 
        severity="success" 
        sx={{ 
          mb: 3, 
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #062c24 0%, #0a3a2d 50%, #104034 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #06d6a0 50%, #048c69 100%)',
          color: theme.palette.mode === 'dark' ? '#06d6a0' : 'white', 
          fontWeight: 'bold',
          borderRadius: 3,
          fontSize: { xs: '0.85rem', sm: '0.875rem' },
          backdropFilter: 'blur(10px)',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(6, 214, 160, 0.3)' 
            : '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInDown 0.5s ease-out',
          '@keyframes slideInDown': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(6, 214, 160, 0.2), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            opacity: theme.palette.mode === 'dark' ? 0.6 : 1,
            animation: 'shimmer 3s infinite',
          },
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' }
          },
          '& .MuiAlert-icon': { color: theme.palette.mode === 'dark' ? '#06d6a0' : 'white' },
          '& .MuiAlert-message': {
            padding: { xs: '8px 0', sm: '12px 0' },
            position: 'relative',
            zIndex: 1
          }
        }}
      >
        🎉 Amazing! You've received RWF {stats.welcomeBonus} welcome bonus! Complete your first video to unlock more rewards!
      </Alert>

      {/* Modern Gamified Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              animation: 'fadeInUp 0.6s ease-out',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <GamificationCard
              title="Total Earnings"
              value={`RWF ${stats.earnings.toLocaleString()}`}
              subtitle={`Videos + Photos + Team + Bonus + Welcome bonus`}
              icon={MonetizationOn}
              gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #FF6B9D 70%, #C44569 100%)"
              glowing={stats.points >= 10000}
              level={userLevel}
              achievements={stats.points >= 10000 ? ['High Roller'] : []}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              animation: 'fadeInUp 0.6s ease-out 0.1s backwards',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <GamificationCard
              title="Network Income"
              value={`RWF ${stats.referralEarnings.toLocaleString()}`}
              subtitle={`From ${stats.level1Count + stats.level2Count + stats.level3Count} team members`}
              progress={stats.referrals}
              progressMax={100}
              icon={TrendingUp}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 70%, #f5576c 100%)"
              glowing={stats.referralEarnings >= 50000}
              achievements={stats.referralEarnings >= 50000 ? ['Network Master'] : stats.referralEarnings >= 10000 ? ['Network Builder'] : []}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              animation: 'fadeInUp 0.6s ease-out 0.2s backwards',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <GamificationCard
              title="Video Earnings"
              value={`RWF ${stats.videoPoints.toLocaleString()}`}
              subtitle={`From ${stats.videosWatched} videos`}
              progress={stats.videosWatched}
              progressMax={weeklyProgress.target}
              icon={PlayCircle}
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 30%, #43e97b 70%, #38f9d7 100%)"
              streakCount={stats.videosWatched >= 10 ? 1 : null}
              achievements={stats.videosWatched >= 10 ? ['Speed Demon'] : []}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              animation: 'fadeInUp 0.6s ease-out 0.3s backwards',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <GamificationCard
              title="Photo Earnings"
              value={`RWF ${stats.photoPoints.toLocaleString()}`}
              subtitle={`From ${stats.photoShares} photo shares`}
              progress={stats.photoShares}
              progressMax={50}
              icon={PhotoCamera}
              gradient="linear-gradient(135deg, #fa709a 0%, #fee140 30%, #fa709a 70%, #ff6b6b 100%)"
              badge={stats.photoShares >= 10 ? "Photo Master" : stats.photoShares >= 1 ? "Sharer" : null}
              achievements={stats.photoShares >= 10 ? ['Photo Master'] : stats.photoShares >= 1 ? ['Sharer'] : []}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Achievements Section */}
      <Paper 
        sx={{ 
          mt: 4, 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
          animation: 'fadeInUp 0.8s ease-out 0.4s backwards',
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea)',
            backgroundSize: '200% 100%',
            animation: 'gradientMove 3s linear infinite',
          },
          '@keyframes gradientMove': {
            '0%': { backgroundPosition: '0% 0%' },
            '100%': { backgroundPosition: '200% 0%' }
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          animation: 'slideInLeft 0.6s ease-out',
          '@keyframes slideInLeft': {
            from: { opacity: 0, transform: 'translateX(-20px)' },
            to: { opacity: 1, transform: 'translateX(0)' }
          }
        }}>
          <EmojiEvents 
            sx={{ 
              color: '#FFD700', 
              fontSize: 32, 
              mr: 1,
              animation: 'rotate 3s ease-in-out infinite',
              '@keyframes rotate': {
                '0%, 100%': { transform: 'rotate(0deg)' },
                '25%': { transform: 'rotate(-10deg)' },
                '75%': { transform: 'rotate(10deg)' }
              }
            }} 
          />
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #06d6a0, #10b981)'
                : 'linear-gradient(45deg, #10b981, #059669)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Achievements
          </Typography>
        </Box>
        
        <Grid container spacing={2} justifyContent="center">
          {['first_video', 'first_photo', 'streak_3', 'referral_1', 'earnings_1000', 'speed_demon', 'photo_master', 'streak_7', 'referral_10', 'earnings_10000'].map(achievementId => (
            <Grid item key={achievementId}>
              <AchievementBadge
                achievementId={achievementId}
                unlocked={achievements.includes(achievementId)}
                size={isMobile ? 'small' : 'medium'}
                animated={true}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Multi-Level Referral CTA */}
      <Paper
        sx={{ 
          mt: 4, 
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
          border: '1px solid rgba(255,255,255,0.2)',
          animation: 'fadeInUp 0.8s ease-out 0.5s backwards',
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
        }}
      >
        {/* Animated background effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="10" cy="10" r="2"/%3E%3Ccircle cx="30" cy="10" r="2"/%3E%3Ccircle cx="10" cy="30" r="2"/%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'pulse 4s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.8, transform: 'scale(1.1)' },
            },
          }}
        />
        
        {/* Floating particles effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite',
            },
            '&::before': {
              top: '10%',
              left: '10%',
            },
            '&::after': {
              bottom: '10%',
              right: '10%',
              animationDelay: '3s',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            }
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Rocket 
            sx={{ 
              fontSize: 48, 
              color: '#FFD700', 
              mb: 2,
              animation: 'bounce 2s ease-in-out infinite',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-15px)' }
              }
            }} 
          />
          <Typography 
            variant="h4" 
            fontWeight={800} 
            color="white" 
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            🚀 Multi-Level Referral System
          </Typography>
          <Typography 
            variant="h6" 
            color="white" 
            sx={{ 
              opacity: 0.9,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 1, sm: 0 },
              mb: 3
            }}
          >
            Build your empire and earn from 3 levels deep
          </Typography>
          
          {/* Earnings breakdown chips */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1, 
            mb: 3, 
            flexWrap: 'wrap',
            animation: 'fadeIn 1s ease-out 0.6s backwards',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}>
            <Chip 
              label="L1: 3,200 RWF" 
              sx={{ 
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #06d6a0 0%, #048c69 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: theme.palette.mode === 'dark' ? '#000' : '#ffffff',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)',
                }
              }} 
            />
            <Chip 
              label="L2: 1,100 RWF" 
              sx={{ 
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #06d6a0 0%, #048c69 100%)',
                color: theme.palette.mode === 'dark' ? '#000' : '#ffffff',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 20px rgba(192, 192, 192, 0.6)',
                }
              }} 
            />
            <Chip 
              label="L3: 700 RWF" 
              sx={{ 
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)'
                  : 'linear-gradient(135deg, #048c69 0%, #065f46 100%)',
                color: theme.palette.mode === 'dark' ? '#000' : '#ffffff',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 20px rgba(205, 127, 50, 0.6)',
                }
              }} 
            />
          </Box>
          
          <Button 
            variant="contained"
            size="large"
            startIcon={<Timeline />}
            endIcon={<ArrowForward />}
            sx={{ 
              px: { xs: 3, sm: 4 },
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%)',
              boxShadow: '0 8px 20px rgba(255, 111, 0, 0.4)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              transition: 'all 0.3s ease',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' }
              },
              '&:hover': {
                boxShadow: '0 12px 28px rgba(255, 111, 0, 0.6)',
                transform: 'translateY(-2px) scale(1.05)',
                animation: 'none',
                transform: 'translateY(-2px)'
              },
            }}
            onClick={() => navigate('/app/referrals')}
          >
            View Team Dashboard
          </Button>
        </Box>
      </Paper>

      {/* Weekly Progress Challenge */}
      <Paper 
        sx={{ 
          mt: 4,
          p: { xs: 3, sm: 4 },
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Whatshot sx={{ color: '#FF6F00', fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Weekly Challenge
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Watch {weeklyProgress.target} videos this week to unlock special rewards!
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ProgressRing
            progress={weeklyProgress.current}
            max={weeklyProgress.target}
            size={120}
            color="#4CAF50"
            centerContent={
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color="#4CAF50">
                  {weeklyProgress.current}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  of {weeklyProgress.target}
                </Typography>
              </Box>
            }
          />
        </Box>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayCircle />}
          sx={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
            boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)',
            '&:hover': { 
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 24px rgba(76, 175, 80, 0.4)',
            }
          }}
          onClick={() => navigate('/app/videos')}
        >
          Continue Watching
        </Button>
      </Paper>

    </Container>
  );
}
