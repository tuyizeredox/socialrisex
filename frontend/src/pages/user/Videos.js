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
  LinearProgress
} from '@mui/material';
import {
  PlayCircle,
  MonetizationOn,
  Person,
  Timer,
  CheckCircle
} from '@mui/icons-material';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/common/PageHeader';
import VideoPlayer from '../../components/VideoPlayer';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filter, setFilter] = useState('all'); // Keep only this declaration
  const { user } = useAuth();
  const { showNotification } = useNotification();
  // Add the fetchVideos function
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/videos');
      if (response.data) {
        setVideos(response.data);
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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={`https://img.youtube.com/vi/${extractVideoId(video.youtubeUrl)}/hqdefault.jpg`}
          alt={video.title}
          sx={{ cursor: 'pointer' }}
          onClick={() => handleWatchVideo(video)}
        />
        {isVideoCompleted(video) && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'success.main',
              color: 'white',
              borderRadius: '50%',
              p: 0.5
            }}
          >
            <CheckCircle />
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        {renderVideoStatus(video)}
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {video.title}
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Timer sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Min. watch time: {video.minimumWatchTime}s
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <MonetizationOn sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {video.pointsReward} points
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        {video.watched ? (
          <Chip
            icon={<CheckCircle />}
            label="Completed"
            color="success"
            size="small"
          />
        ) : (
          <Button
            startIcon={<PlayCircle />}
            variant="contained"
            onClick={() => handleWatchVideo(video)}
            disabled={!user.isActive}
          >
            Watch Video
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
    <Container>
      <PageHeader 
        title="Available Videos" 
        subtitle="Watch videos to earn points"
      />
  
      {!user.isActive && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Activate your account to start earning points from watching videos.
        </Alert>
      )}
  
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          All Videos
        </Button>
        <Button
          variant={filter === 'unwatched' ? 'contained' : 'outlined'}
          onClick={() => setFilter('unwatched')}
          startIcon={<PlayCircle />}
        >
          Unwatched
        </Button>
        <Button
          variant={filter === 'watched' ? 'contained' : 'outlined'}
          onClick={() => setFilter('watched')}
          startIcon={<CheckCircle />}
          color="success"
        >
          Watched
        </Button>
      </Box>
  
      <Grid container spacing={3}>
        {videos
          .filter(video => {
            if (filter === 'watched') return isVideoCompleted(video);
            if (filter === 'unwatched') return !isVideoCompleted(video);
            return true;
          })
          .map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: isVideoCompleted(video) ? 0.8 : 1,
                  bgcolor: isVideoCompleted(video) ? 'action.hover' : 'background.paper',
                  position: 'relative',
                  '&::after': isVideoCompleted(video) ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: 'success.main',
                    pointerEvents: 'none'
                  } : {}
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={`https://img.youtube.com/vi/${extractVideoId(video.youtubeUrl)}/hqdefault.jpg`}
                    alt={video.title}
                    sx={{ 
                      cursor: 'pointer',
                      filter: isVideoCompleted(video) ? 'grayscale(0.3)' : 'none'
                    }}
                    onClick={() => handleWatchVideo(video)}
                  />
                  {isVideoCompleted(video) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        p: 0.5,
                        boxShadow: 2
                      }}
                    >
                      <CheckCircle />
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      noWrap
                      sx={{ 
                        flex: 1,
                        color: isVideoCompleted(video) ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {video.title}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Timer sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Min. watch time: {video.minimumWatchTime}s
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <MonetizationOn sx={{ mr: 1, fontSize: 20 }} />
                    <Typography 
                      variant="body2" 
                      color={isVideoCompleted(video) ? "text.secondary" : "success.main"}
                      sx={{ fontWeight: isVideoCompleted(video) ? 'normal' : 'bold' }}
                    >
                      {isVideoCompleted(video) ? 'Points Earned' : `${video.pointsReward} points`}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant={isVideoCompleted(video) ? "outlined" : "contained"}
                    startIcon={isVideoCompleted(video) ? <CheckCircle /> : <PlayCircle />}
                    onClick={() => handleWatchVideo(video)}
                    disabled={!user.isActive}
                    color={isVideoCompleted(video) ? "success" : "primary"}
                  >
                    {isVideoCompleted(video) ? 'Watch Again' : 'Watch & Earn'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
  
          {videos.filter(video => {
            if (filter === 'watched') return isVideoCompleted(video);
            if (filter === 'unwatched') return !isVideoCompleted(video);
            return true;
          }).length === 0 && (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  {filter === 'all' 
                    ? 'No videos available at the moment'
                    : filter === 'watched'
                      ? 'You haven\'t watched any videos yet'
                      : 'No new videos to watch'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filter === 'all' 
                    ? 'Please check back later for new videos'
                    : filter === 'watched'
                      ? 'Start watching videos to earn points'
                      : 'You\'ve watched all available videos'
                  }
                </Typography>
              </Box>
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