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
          height: 200,
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

      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {video.title}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmojiEvents sx={{ color: 'gold', fontSize: 18 }} />
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {video.pointsReward} pts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ color: 'text.secondary', fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              {video.minimumWatchTime}s min
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={video.isActive}
                onChange={() => handleToggleStatus(video._id, video.isActive)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" fontWeight="medium">
                {video.isActive ? 'Active Quest' : 'Quest Paused'}
              </Typography>
            }
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Preview Quest">
            <IconButton
              size="small"
              onClick={() => window.open(video.youtubeUrl, '_blank')}
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.main' }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Quest">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(video)}
              sx={{
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                '&:hover': { bgcolor: 'warning.main' }
              }}
            >
              <EditIcon fontSize="small" />
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
                '&:hover': { bgcolor: 'info.main' }
              }}
            >
              <Share fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Quest">
            <IconButton
              size="small"
              onClick={() => handleDeleteVideo(video._id)}
              sx={{
                bgcolor: 'error.light',
                color: 'error.contrastText',
                '&:hover': { bgcolor: 'error.main' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* Modern Header */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: 3, sm: 4 },
          p: { xs: 3, sm: 4 },
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            mb: 2
          }}>
            <Box>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                gutterBottom
                sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
              >
                🎬 Quest Library Manager
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                {videos.length} epic video quests available • {videos.filter(v => v.isActive).length} active adventures
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Create New Quest
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
          borderRadius: 4,
          p: { xs: 2, sm: 3 },
          mb: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={10}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="🔍 Search video quests by title or reward points..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
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
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                <FilterList />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Content Area */}
      {filteredVideos.length === 0 && !loading ? (
        <Paper
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.light',
                fontSize: '2rem'
              }}
            >
              🎬
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {searchTerm ? 'No Matching Quests' : 'Quest Library Empty'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              {searchTerm 
                ? 'No video quests match your search criteria. Try different keywords.'
                : 'The adventure library is empty! Create your first video quest to get heroes started on their journey.'
              }
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
                onClick={() => handleOpenDialog()}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Create First Quest
              </Button>
            )}
          </Box>
        </Paper>
      ) : (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredVideos.map((video) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                  {renderVideoCard(video)}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Modern Quest Creation/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,247,247,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            borderRadius: '16px 16px 0 0',
            py: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight={800}>
            🎬 {editingVideo ? 'Edit Quest Details' : 'Create New Epic Quest'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            {editingVideo ? 'Modify this video quest' : 'Design an amazing adventure for your heroes'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="🎬 Quest Title"
                placeholder="Enter an epic quest title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
              <TextField
                fullWidth
                label="📺 YouTube Quest URL"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                required
                helperText="Paste the full YouTube video URL here"
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
            p: 3, 
            gap: 2,
            background: 'linear-gradient(135deg, rgba(247,247,247,0.8) 0%, rgba(237,237,237,0.8) 100%)',
            borderRadius: '0 0 16px 16px'
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 3,
              px: 4,
              borderColor: 'grey.400',
              color: 'grey.600',
              '&:hover': {
                borderColor: 'grey.600',
                bgcolor: 'grey.50'
              }
            }}
          >
            Cancel Quest
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            size="large"
            sx={{
              borderRadius: 3,
              px: 4,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            {editingVideo ? '✏️ Update Quest' : '🚀 Launch Quest'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 