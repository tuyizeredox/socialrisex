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
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon, CheckCircle } from '@mui/icons-material';

const VideoPlayer = ({ videoId, onComplete, minimumWatchTime, onClose, title, isCompleted }) => {
  const [watchTime, setWatchTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      maxWidth={isMobile ? 'sm' : 'md'} 
      fullWidth 
      fullScreen={isMobile}
      onClose={onClose}
      keepMounted
      disablePortal
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 2,
          margin: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          height: isMobile ? '100%' : 'auto',
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start"
          gap={2}
        >
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              fontWeight: 600,
              lineHeight: 1.3,
              flex: 1,
              pr: 1
            }}
          >
            {title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {isCompleted && (
              <Chip
                icon={<CheckCircle sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                label={isMobile ? "Done" : "Already Completed"}
                color="success"
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  height: { xs: 28, sm: 32 }
                }}
              />
            )}
            <IconButton 
              onClick={onClose} 
              size={isMobile ? "small" : "medium"}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent 
        sx={{ 
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '100%' : 'auto',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            paddingTop: isMobile ? '75%' : '56.25%', // Different aspect ratio for mobile
            bgcolor: '#000',
            borderRadius: { xs: 1, sm: 2 },
            overflow: 'hidden',
            mb: { xs: 2, sm: 3 },
            flex: isMobile ? 1 : 'none',
            maxHeight: isMobile ? '50vh' : 'none'
          }}
        >
          {loading && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2
              }}
            >
              <CircularProgress 
                size={isMobile ? 40 : 60}
                sx={{ color: 'white' }}
              />
            </Box>
          )}
          <Box 
            id="youtube-player"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />
        </Box>
        {!loading && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: { xs: 2, sm: 2.5 },
              flex: isMobile ? 'none' : 'auto'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: { xs: 1.5, sm: 2 },
                p: { xs: 2, sm: 2.5 },
                bgcolor: 'background.paper',
                borderRadius: { xs: 1.5, sm: 2 },
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ flex: 1, mr: { xs: 1.5, sm: 2 } }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Progress
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      fontWeight: 600
                    }}
                  >
                    {watchTime}/{minimumWatchTime}s
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((watchTime / minimumWatchTime) * 100, 100)}
                  sx={{
                    height: { xs: 6, sm: 8 },
                    borderRadius: { xs: 3, sm: 4 },
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: { xs: 3, sm: 4 },
                      bgcolor: watchTime >= minimumWatchTime ? 'success.main' : 'primary.main'
                    }
                  }}
                />
              </Box>
              {watchTime >= minimumWatchTime && (
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    color: 'white'
                  }}
                >
                  <CheckCircle sx={{ fontSize: { xs: 18, sm: 22 } }} />
                </Box>
              )}
            </Box>
            
            {isCompleted && (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '& .MuiAlert-message': {
                    padding: { xs: '4px 0', sm: '8px 0' }
                  }
                }}
              >
                {isMobile 
                  ? "Already earned points for this video." 
                  : "You've already earned points for this video. You can watch it again, but no additional points will be awarded."
                }
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;