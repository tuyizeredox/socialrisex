import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Backdrop,
} from '@mui/material';
import {
  PlayCircle,
  MonetizationOn,
  Person,
  Timer,
  CheckCircle,
  Close,
  Star,
  TrendingUp,
  Whatshot,
  PlayArrow,
  Pause,
  Videocam,
  Replay,
} from '@mui/icons-material';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/common/PageHeader';
import VideoPlayer from '../../components/VideoPlayer';
import GamificationCard from '../../components/common/GamificationCard';
import AchievementBadge from '../../components/common/AchievementBadge';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ watchedToday: 0, totalWatched: 0, totalEarned: 0 });
  
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  // Fetch videos and stats
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const [videosRes, statsRes] = await Promise.all([
        api.get('/videos'),
        api.get('/users/stats')
      ]);
      
      if (videosRes.data) {
        setVideos(videosRes.data);
      }
      
      if (statsRes.data?.data) {
        const data = statsRes.data.data;
        setStats({
          watchedToday: Math.floor(Math.random() * 5), // Mock data
          totalWatched: data.videosWatched || 0,
          totalEarned: data.videoPoints || 0
        });
      }
    } catch (err) {
      setError('Failed to load videos');
      showNotification('Failed to load videos', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVideos();
  }, []);
  // Define handleWatchVideo before it's used
  const handleWatchVideo = (video) => {
    if (!user.isActive) {
      showNotification('Please activate your account to watch videos', 'warning');
      return;
    }
    setSelectedVideo(video);
  };
  const handleVideoComplete = async () => {
    try {
      const response = await api.post(`/videos/${selectedVideo._id}/complete`, {
        watchTime: selectedVideo.minimumWatchTime
      });
      
      // Update the videos list to mark the completed video as watched
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video._id === selectedVideo._id 
            ? { 
                ...video, 
                watched: true,
                completedAt: new Date()
              }
            : video
        )
      );
    // Update the videos list
    setVideos(prevVideos => 
      prevVideos.map(video => 
        video._id === selectedVideo._id 
          ? { 
              ...video, 
              watched: true,
              completedAt: new Date()
            }
          : video
      )
    );
    // Dispatch event with points data
    const videoCompletedEvent = new CustomEvent('videoCompleted', {
      detail: {
        pointsEarned: response.data.pointsEarned,
        videoPoints: response.data.videoPoints || 0
      }
    });
    window.dispatchEvent(videoCompletedEvent);

    if (response.data.pointsEarned > 0) {
      showNotification(
        `Congratulations! You earned ${response.data.pointsEarned} points!`, 
        'success'
      );
    }
    
    setSelectedVideo(null);
  } catch (err) {
    console.error('Video completion error:', err);
    showNotification(
      'Failed to record video completion. Please try again.', 
      'error'
    );
  }
};
  // Keep this single implementation of isVideoCompleted
  const isVideoCompleted = (video) => {
    return video.watched || 
           Boolean(video.completedAt) || 
           video.watchedBy?.some(watch => 
             watch.user === user._id && watch.completedAt
           );
  };
  // Remove the second declaration of isVideoCompleted that appears later in the code
  
  // Update the render method to show watched status
  const renderVideoCard = (video) => (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: { xs: 2, sm: 3 },
      boxShadow: { xs: 1, sm: 3, md: 2 },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      position: 'relative',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
      '&:hover': {
        transform: { xs: 'scale(0.98)', sm: 'translateY(-4px)' },
        boxShadow: { xs: 2, sm: 8, md: 6 },
        '& .video-thumbnail': {
          transform: 'scale(1.05)'
        }
      }
    }}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height={{ xs: 160, sm: 180, md: 200 }}
          image={`https://img.youtube.com/vi/${extractVideoId(video.youtubeUrl)}/hqdefault.jpg`}
          alt={video.title}
          className="video-thumbnail"
          sx={{ 
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            objectFit: 'cover',
            width: '100%'
          }}
          onClick={() => handleWatchVideo(video)}
        />
        {isVideoCompleted(video) && (
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 12 },
              right: { xs: 8, sm: 12 },
              bgcolor: 'success.main',
              color: 'white',
              borderRadius: '50%',
              p: { xs: 0.5, sm: 0.75 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <CheckCircle sx={{ fontSize: { xs: 18, sm: 24 } }} />
          </Box>
        )}
        
        {/* Play Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              opacity: 1
            }
          }}
          onClick={() => handleWatchVideo(video)}
        >
          <PlayCircle
            sx={{
              fontSize: { xs: 48, sm: 60, md: 72 },
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
            }}
          />
        </Box>
      </Box>
      <CardContent sx={{ 
        flexGrow: 1,
        p: { xs: 1.5, sm: 2, md: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 1.5 }
      }}>
        {renderVideoStatus(video)}
        <Typography 
          variant="h6" 
          component="div"
          sx={{ 
            fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
            fontWeight: 600,
            lineHeight: { xs: 1.3, sm: 1.4 },
            display: '-webkit-box',
            WebkitLineClamp: { xs: 2, sm: 2 },
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: { xs: 1, sm: 1.5 }
          }}
          title={video.title}
        >
          {video.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Timer sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: 'primary.main' }} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                fontWeight: 500
              }}
            >
              {video.minimumWatchTime}s minimum
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <MonetizationOn sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, color: 'success.main' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                fontWeight: 600,
                color: 'success.main'
              }}
            >
              {video.pointsReward} RWF reward
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ 
        p: { xs: 1.5, sm: 2 },
        justifyContent: 'stretch'
      }}>
        {video.watched ? (
          <Chip
            icon={<CheckCircle />}
            label="Completed"
            color="success"
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.8125rem' },
              fontWeight: 600,
              width: '100%',
              height: { xs: 36, sm: 40 }
            }}
          />
        ) : (
          <Button
            startIcon={<PlayCircle />}
            variant="contained"
            onClick={() => handleWatchVideo(video)}
            disabled={!user.isActive}
            size={isMobile ? 'small' : 'medium'}
            fullWidth
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
              fontWeight: 600,
              py: { xs: 1, sm: 1.25 },
              borderRadius: { xs: 2, sm: 2.5 },
              background: user.isActive 
                ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
                : 'disabled',
              boxShadow: user.isActive ? '0 4px 12px rgba(33, 150, 243, 0.3)' : 'none',
              '&:hover': user.isActive ? {
                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-1px)'
              } : {},
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {isMobile ? 'Watch' : 'Watch Video'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
  const extractVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
    } catch (error) {
      console.error('Error extracting video ID:', error);
    }
    return null;
  };

  const renderVideoStatus = (video) => {
    if (isVideoCompleted(video)) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Completed"
          color="success"
          size="small"
          sx={{ mb: 1 }}
        />
      );
    }
    return null;
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
  // Remove this duplicate declaration
  // const [filter, setFilter] = useState('all');
  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 },
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #374151 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        minHeight: '100vh',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header Section */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: 3, sm: 4 },
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Videocam sx={{ fontSize: { xs: 32, sm: 40 }, color: '#FF6F00', mr: 1 }} />
          <Typography 
            variant="h3" 
            fontWeight={800}
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #6366f1, #818cf8)'
                : 'linear-gradient(45deg, #4f46e5, #6366f1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Video Theater
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
          Watch amazing content and earn rewards! 🎬
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <GamificationCard
            title="Today's Progress"
            value={stats.watchedToday}
            subtitle="videos watched today"
            icon={Whatshot}
            gradient="linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%)"
            progress={stats.watchedToday}
            progressMax={10}
            streakCount={stats.watchedToday >= 3 ? 1 : null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GamificationCard
            title="Total Watched"
            value={stats.totalWatched}
            subtitle="videos completed"
            icon={PlayCircle}
            gradient="linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)"
            achievements={stats.totalWatched >= 10 ? ['Speed Demon'] : []}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <GamificationCard
            title="Video Earnings"
            value={`${stats.totalEarned} RWF`}
            subtitle="from watching videos"
            icon={MonetizationOn}
            gradient="linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)"
            glowing={stats.totalEarned >= 1000}
          />
        </Grid>
      </Grid>

      {/* Account Activation Warning */}
      {!user.isActive && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
            color: 'white',
            fontWeight: 'bold',
            '& .MuiAlert-icon': { color: 'white' },
            boxShadow: '0 8px 20px rgba(255, 152, 0, 0.3)',
          }}
        >
          🔐 Activate your account to start earning points from watching videos!
        </Alert>
      )}
  
      {/* Modern Filter Buttons */}
      <Paper 
        sx={{ 
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, sm: 3 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: { xs: 2.5, sm: 3 },
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          display: 'flex',
          gap: { xs: 1, sm: 1.5, md: 2 },
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {[
          { key: 'all', label: 'All Videos', shortLabel: 'All', icon: Videocam, color: 'primary' },
          { key: 'unwatched', label: 'Unwatched', shortLabel: 'New', icon: PlayArrow, color: 'warning' },
          { key: 'watched', label: 'Completed', shortLabel: 'Done', icon: CheckCircle, color: 'success' },
        ].map(({ key, label, shortLabel, icon: Icon, color }) => (
          <Button
            key={key}
            variant={filter === key ? 'contained' : 'outlined'}
            onClick={() => setFilter(key)}
            startIcon={<Icon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            color={color}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              fontWeight: 700,
              px: { xs: 1.5, sm: 2.5, md: 3 },
              py: { xs: 0.75, sm: 1, md: 1.25 },
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
              minWidth: { xs: 'auto', sm: 100, md: 120 },
              flex: { xs: 1, sm: 'none' },
              maxWidth: { xs: 120, sm: 'none' },
              textTransform: 'none',
              boxShadow: filter === key ? 
                '0 4px 16px rgba(0,0,0,0.15)' : 
                '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: { 
                  xs: '0 2px 12px rgba(0,0,0,0.1)',
                  sm: '0 6px 20px rgba(0,0,0,0.2)' 
                },
              },
              ...(filter === key && {
                boxShadow: `0 4px 16px ${
                  color === 'primary' ? 'rgba(33, 150, 243, 0.4)' :
                  color === 'warning' ? 'rgba(255, 152, 0, 0.4)' :
                  'rgba(76, 175, 80, 0.4)'
                }`,
              })
            }}
          >
            {isMobile ? shortLabel : label}
          </Button>
        ))}
      </Paper>
  
      <Grid 
        container 
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        sx={{ 
          justifyContent: { xs: 'center', sm: 'flex-start' },
          alignItems: 'stretch' 
        }}
      >
        {videos
          .filter(video => {
            if (filter === 'watched') return isVideoCompleted(video);
            if (filter === 'unwatched') return !isVideoCompleted(video);
            return true;
          })
          .map((video) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3}
              xl={3}
              key={video._id}
              sx={{
                display: 'flex',
                alignItems: 'stretch'
              }}
            >
              {renderVideoCard(video)}
            </Grid>
          ))}
  
          {videos.filter(video => {
            if (filter === 'watched') return isVideoCompleted(video);
            if (filter === 'unwatched') return !isVideoCompleted(video);
            return true;
          }).length === 0 && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  textAlign: 'center',
                  py: 6,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(233, 30, 99, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(233, 30, 99, 0.04) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(156, 39, 176, 0.25)'
                    : '1px solid rgba(156, 39, 176, 0.15)',
                  borderRadius: 4,
                }}
              >
                <Videocam 
                  sx={{ 
                    fontSize: 80, 
                    color: theme.palette.text.secondary,
                    mb: 2,
                    opacity: 0.7,
                  }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 2,
                    color: theme.palette.text.primary,
                  }}
                >
                  {filter === 'all' 
                    ? 'No Videos Available'
                    : filter === 'watched'
                      ? 'No Completed Videos'
                      : 'All Videos Completed!'
                  }
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    maxWidth: 400,
                    mx: 'auto',
                  }}
                >
                  {filter === 'all' 
                    ? 'No videos are available right now. Check back soon for new content!'
                    : filter === 'watched'
                      ? 'You haven\'t completed any videos yet. Time to start watching!'
                      : 'Congratulations! You\'ve watched all available videos. More content coming soon!'
                  }
                </Typography>
              </Paper>
            </Grid>
          )}
      </Grid>
  {selectedVideo && (
        <VideoPlayer
          videoId={extractVideoId(selectedVideo.youtubeUrl)}
          minimumWatchTime={selectedVideo.minimumWatchTime}
          onComplete={handleVideoComplete}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.title}
          isCompleted={isVideoCompleted(selectedVideo)}
        />
      )}
    </Container>
  );
}