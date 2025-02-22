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
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  VideoLibrary
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

  const { showNotification } = useNotification();

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

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Video Management"
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Videos', path: '/admin/videos' }
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Video
          </Button>
        }
      />

      {videos.length === 0 ? (
        <EmptyState
          icon={VideoLibrary}
          title="No Videos Found"
          description="Add your first video to get started"
          action={() => handleOpenDialog()}
          actionText="Add Video"
        />
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(videos) && videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Points: {video.pointsReward}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Min. Watch Time: {video.minimumWatchTime}s
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={video.isActive}
                        onChange={() => handleToggleStatus(video._id, video.isActive)}
                      />
                    }
                    label={video.isActive ? 'Active' : 'Inactive'}
                  />
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleOpenDialog(video)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteVideo(video._id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVideo ? 'Edit Video' : 'Add New Video'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormField
              label="Title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
              margin="normal"
            />
            <FormField
              label="YouTube URL"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              required
              fullWidth
              margin="normal"
              helperText="Enter the full YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
            />
            <FormField
              label="Points Reward"
              name="pointsReward"
              type="number"
              value={formData.pointsReward}
              onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) })}
              required
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <FormField
              label="Minimum Watch Time (seconds)"
              name="minimumWatchTime"
              type="number"
              value={formData.minimumWatchTime}
              onChange={(e) => setFormData({ ...formData, minimumWatchTime: parseInt(e.target.value) })}
              required
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingVideo ? 'Update' : 'Add'} Video
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 