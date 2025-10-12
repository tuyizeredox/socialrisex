import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
  CardMedia,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  VideoLibrary,
  PlayArrow,
  Schedule,
  EmojiEvents,
  Search,
  FilterList,
  Visibility,
  Share
} from '@mui/icons-material';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import EmptyState from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';

export default function VideoManagement() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    pointsReward: 1000,
    minimumWatchTime: 60,
    isActive: true
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { showNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Extract YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  };

  // Filter videos based on search term
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.pointsReward.toString().includes(searchTerm)
  );

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/videos');
      if (response.data && response.data.videos) {
        setVideos(response.data.videos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      showNotification(error.message || 'Failed to fetch videos', 'error');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleOpenDialog = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        youtubeUrl: video.youtubeUrl,
        pointsReward: video.pointsReward,
        minimumWatchTime: video.minimumWatchTime,
        isActive: video.isActive
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        youtubeUrl: '',
        pointsReward: 1000,
        minimumWatchTime: 60,
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.youtubeUrl) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      try {
        new URL(formData.youtubeUrl);
      } catch (error) {
        showNotification('Please enter a valid YouTube URL', 'error');
        return;
      }

      if (editingVideo) {
        await api.put(`/admin/videos/${editingVideo._id}`, formData);
        showNotification('Video updated successfully', 'success');
      } else {
        await api.post('/admin/videos', formData);
        showNotification('Video added successfully', 'success');
      }
      fetchVideos();
      handleCloseDialog();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error saving video', 'error');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await api.delete(`/admin/videos/${videoId}`);
        showNotification('Video deleted successfully', 'success');
        fetchVideos();
      } catch (error) {
        showNotification(error.message || 'Error deleting video', 'error');
      }
    }
  };

  const handleToggleStatus = async (videoId, currentStatus) => {
    try {
      await api.put(`/admin/videos/${videoId}`, { isActive: !currentStatus });
      showNotification('Video status updated successfully', 'success');
      fetchVideos();
    } catch (error) {
      showNotification(error.message || 'Error updating video status', 'error');
    }
  };

  const handleWatchVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoComplete = async () => {
    try {
      await api.post(`/videos/${selectedVideo._id}/complete`, {
        watchTime: selectedVideo.minimumWatchTime
      });
      showNotification(`Congratulations! You earned ${selectedVideo.pointsReward} points!`, 'success');
      setSelectedVideo(null);
      fetchVideos();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to record video completion', 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const renderVideoCard = (video) => (
    <Card
      key={video._id}
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: video.isActive 
            ? 'linear-gradient(90deg, #4CAF50, #81C784)'
            : 'linear-gradient(90deg, #f44336, #ef5350)',
        }
      }}
    >
      <CardMedia
        sx={{
          height: { xs: 120, sm: 140, md: 160 },
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        image={getYouTubeThumbnail(video.youtubeUrl)}
        title={video.title}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&:hover': { opacity: 1 }
          }}
        >
          <IconButton
            size="large"
            onClick={() => window.open(video.youtubeUrl, '_blank')}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              color: 'primary.main',
              '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
            }}
          >
            <PlayArrow sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
        
        <Chip
          label={video.isActive ? "🟢 Live Quest" : "🔴 Paused"}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: video.isActive ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </CardMedia>

      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          gutterBottom 
          noWrap
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          {video.title}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmojiEvents sx={{ color: 'gold', fontSize: { xs: 16, sm: 18 } }} />
            <Typography 
              variant="body2" 
              fontWeight="bold" 
              color="primary.main"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              {video.pointsReward} pts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ color: 'text.secondary', fontSize: { xs: 14, sm: 16 } }} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              {video.minimumWatchTime}s min
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={video.isActive}
                onChange={() => handleToggleStatus(video._id, video.isActive)}
                size="small"
              />
            }
            label={
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
              >
                {video.isActive ? 'Active Quest' : 'Quest Paused'}
              </Typography>
            }
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 }, 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Tooltip title="Preview Quest">
            <IconButton
              size="small"
              onClick={() => window.open(video.youtubeUrl, '_blank')}
                sx={{
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.main' },
                width: { xs: 24, sm: 28 },
                height: { xs: 24, sm: 28 }
              }}
            >
              <Visibility fontSize={isMobile ? 'inherit' : 'small'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Quest">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(video)}
              sx={{
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                '&:hover': { bgcolor: 'warning.main' },
                width: { xs: 24, sm: 28 },
                height: { xs: 24, sm: 28 }
              }}
            >
              <EditIcon fontSize={isMobile ? 'inherit' : 'small'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Quest">
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(video.youtubeUrl);
                showNotification('Quest link copied!', 'success');
              }}
              sx={{
                bgcolor: 'info.light',
                color: 'info.contrastText',
                '&:hover': { bgcolor: 'info.main' },
                width: { xs: 24, sm: 28 },
                height: { xs: 24, sm: 28 }
              }}
            >
              <Share fontSize={isMobile ? 'inherit' : 'small'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Quest">
            <IconButton
              size="small"
              onClick={() => handleDeleteVideo(video._id)}
              sx={{
                bgcolor: 'error.light',
                color: 'error.contrastText',
                '&:hover': { bgcolor: 'error.main' },
                width: { xs: 24, sm: 28 },
                height: { xs: 24, sm: 28 }
              }}
            >
              <DeleteIcon fontSize={isMobile ? 'inherit' : 'small'} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      width: '100%',
      overflowX: 'auto',
      minWidth: 0,
      px: { xs: 1, sm: 2, md: 3 },
      py: { xs: 1, sm: 2, md: 3 }
    }}>
        {/* Modern Header */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: { xs: 1, sm: 2, md: 3 },
            p: { xs: 1.5, sm: 2, md: 3 },
            mb: { xs: 1.5, sm: 2, md: 3 },
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
            width: '100%'
          }}
        >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 3 },
            mb: { xs: 1, sm: 2 }
          }}>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem', lg: '2.5rem' },
                  lineHeight: { xs: 1.2, sm: 1.3 }
                }}
              >
                🎬 Quest Library Manager
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  lineHeight: { xs: 1.3, sm: 1.4 }
                }}
              >
                {videos.length} epic video quests available • {videos.filter(v => v.isActive).length} active adventures
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 1 },
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' },
              flexWrap: 'wrap',
              justifyContent: { xs: 'stretch', sm: 'flex-end' }
            }}>
              <Button
                variant="contained"
                startIcon={isMobile ? null : <AddIcon />}
                onClick={() => handleOpenDialog()}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  py: { xs: 0.8, sm: 1.2 },
                  minWidth: { xs: 'auto', sm: 'fit-content' },
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {isMobile ? '🎬 Create Quest' : 'Create New Quest'}
              </Button>
            </Box>
          </Box>
        </Box>
        </Box>

        {/* Search and Controls */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: { xs: 1, sm: 2, md: 3 },
            p: { xs: 1, sm: 1.5, md: 2 },
            mb: { xs: 1.5, sm: 2 },
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            width: '100%'
          }}
        >
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid item xs={12} md={10}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={isMobile ? "🔍 Search quests..." : "🔍 Search video quests by title or reward points..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size={isMobile ? 'small' : 'medium'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1, sm: 2 },
                  bgcolor: 'rgba(255,255,255,0.8)',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'center' } }}>
              <IconButton
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                <FilterList fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        </Paper>

        {/* Content Area */}
        <Box sx={{ width: '100%' }}>
          {filteredVideos.length === 0 && !loading ? (
            <Paper
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: { xs: 2, sm: 3, md: 4 },
                p: { xs: 2, sm: 3, md: 4 },
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Avatar
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                bgcolor: 'primary.light',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              🎬
            </Avatar>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="text.primary"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              {searchTerm ? 'No Matching Quests' : 'Quest Library Empty'}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: { xs: 300, sm: 400 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 1, sm: 0 }
              }}
            >
              {searchTerm 
                ? 'No video quests match your search criteria. Try different keywords.'
                : 'The adventure library is empty! Create your first video quest to get heroes started on their journey.'
              }
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={isMobile ? null : <AddIcon />}
                size={isMobile ? 'medium' : 'large'}
                onClick={() => handleOpenDialog()}
                sx={{
                  mt: { xs: 1, sm: 2 },
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 2, sm: 3 },
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {isMobile ? '🎬 Create Quest' : 'Create First Quest'}
              </Button>
            )}
            </Box>
            </Paper>
          ) : (
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 4, sm: 8 } }}>
                  <CircularProgress size={{ xs: 40, sm: 60 }} />
                </Box>
              ) : (
                <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                  {filteredVideos.map((video) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                      {renderVideoCard(video)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>

      {/* Modern Quest Creation/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,247,247,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)',
            ...(isMobile && {
              margin: 0,
              width: '100vw',
              height: '100vh'
            })
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            borderRadius: isMobile ? 0 : '16px 16px 0 0',
            py: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            fontWeight={800}
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
            🎬 {editingVideo ? 'Edit Quest Details' : 'Create New Epic Quest'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              opacity: 0.9, 
              mt: 1,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {editingVideo ? 'Modify this video quest' : 'Design an amazing adventure for your heroes'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="🎬 Quest Title"
                placeholder="Enter an epic quest title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="📺 YouTube Quest URL"
                placeholder={isMobile ? "YouTube URL..." : "https://www.youtube.com/watch?v=..."}
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                required
                size={isMobile ? 'small' : 'medium'}
                helperText={isMobile ? "Paste YouTube URL here" : "Paste the full YouTube video URL here"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="🏆 Reward Points"
                type="number"
                value={formData.pointsReward}
                onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, max: 10000 }}
                helperText="Points heroes earn for completing this quest"
                InputProps={{
                  startAdornment: <InputAdornment position="start">🏆</InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="⏱️ Minimum Watch Time"
                type="number"
                value={formData.minimumWatchTime}
                onChange={(e) => setFormData({ ...formData, minimumWatchTime: parseInt(e.target.value) || 0 })}
                required
                inputProps={{ min: 10, max: 3600 }}
                helperText="Seconds required to complete quest"
                InputProps={{
                  startAdornment: <InputAdornment position="start">⏱️</InputAdornment>,
                  endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.isActive ? '🟢 Quest is Active' : '🔴 Quest is Paused'}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            background: 'linear-gradient(135deg, rgba(247,247,247,0.8) 0%, rgba(237,237,237,0.8) 100%)',
            borderRadius: isMobile ? 0 : '0 0 16px 16px'
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            size={isMobile ? 'large' : 'large'}
            fullWidth={isMobile}
            sx={{
              borderRadius: 3,
              px: { xs: 2, sm: 4 },
              borderColor: 'grey.400',
              color: 'grey.600',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              order: { xs: 2, sm: 1 },
              '&:hover': {
                borderColor: 'grey.600',
                bgcolor: 'grey.50'
              }
            }}
          >
            {isMobile ? '❌ Cancel' : 'Cancel Quest'}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            size={isMobile ? 'large' : 'large'}
            fullWidth={isMobile}
            sx={{
              borderRadius: 3,
              px: { xs: 2, sm: 4 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              order: { xs: 1, sm: 2 },
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            {editingVideo ? 
              (isMobile ? '✏️ Update' : '✏️ Update Quest') : 
              (isMobile ? '🚀 Launch' : '🚀 Launch Quest')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 