import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Dialog, 
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  LinearProgress,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import { Close as CloseIcon, CheckCircle } from '@mui/icons-material';

const VideoPlayer = ({ videoId, onComplete, minimumWatchTime, onClose, title, isCompleted }) => {
  const [watchTime, setWatchTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadYouTubeAPI = async () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);

        return new Promise((resolve) => {
          window.onYouTubeIframeAPIReady = resolve;
        });
      }
      return Promise.resolve();
    };

    const initPlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player('youtube-player', {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
            playsinline: 1,
            origin: window.location.origin,
            enablejsapi: 1,
            host: 'https://www.youtube.com'
          },
          events: {
            onReady: () => {
              setLoading(false);
              playerRef.current.playVideo();
            },
            onStateChange: handlePlayerStateChange,
            onError: (error) => {
              console.error('YouTube Player Error:', error);
              setLoading(false);
            }
          }
        });
      } catch (error) {
        console.error('Error initializing player:', error);
        setLoading(false);
      }
    };

    initPlayer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId]);

  const handlePlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      // Clear existing interval if any
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start tracking watch time
      intervalRef.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          if (newTime >= minimumWatchTime) {
            clearInterval(intervalRef.current);
            onComplete();
          }
          return newTime;
        });
      }, 1000);
    } else if (event.data === window.YT.PlayerState.PAUSED || 
               event.data === window.YT.PlayerState.ENDED) {
      // Stop tracking watch time
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const progress = Math.min((watchTime / minimumWatchTime) * 100, 100);

  return (
    <Dialog 
      open 
      maxWidth="md" 
      fullWidth 
      onClose={onClose}
      // Add these props for better performance
      keepMounted
      disablePortal
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <Box display="flex" alignItems="center">
            {isCompleted && (
              <Chip
                icon={<CheckCircle />}
                label="Already Completed"
                color="success"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box 
          mb={2} 
          sx={{ 
            position: 'relative',
            paddingTop: '56.25%', // 16:9 aspect ratio
            bgcolor: 'black'
          }}
        >
          {loading && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <Box 
            id="youtube-player"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <div id="youtube-player" />
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box flex={1} mr={2}>
                <LinearProgress
                  variant="determinate"
                  value={(watchTime / minimumWatchTime) * 100}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {watchTime}/{minimumWatchTime}s
              </Typography>
            </Box>
            {isCompleted && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You've already earned points for this video. You can watch it again, but no additional points will be awarded.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;