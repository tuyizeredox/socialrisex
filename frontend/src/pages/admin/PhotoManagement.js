import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload,
  Add,
  Edit,
  Delete,
  PhotoCamera,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import FileUpload from '../../components/common/FileUpload';

export default function PhotoManagement() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoStats, setPhotoStats] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    isActive: true,
    imageFile: null,
    imageUrl: ''
  });

  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPhotos();
    fetchPhotoStats();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get('/admin/photos');
      setPhotos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      showNotification('Failed to load photos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotoStats = async () => {
    try {
      const response = await api.get('/admin/photo-stats');
      setPhotoStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching photo stats:', error);
    }
  };

  const handleOpenDialog = (photo = null) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        title: photo.title,
        description: photo.description,
        tags: photo.tags?.join(', ') || '',
        isActive: photo.isActive,
        imageFile: null,
        imageUrl: photo.imageUrl
      });
    } else {
      setEditingPhoto(null);
      setFormData({
        title: '',
        description: '',
        tags: '',
        isActive: true,
        imageFile: null,
        imageUrl: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPhoto(null);
    setFormData({
      title: '',
      description: '',
      tags: '',
      isActive: true,
      imageFile: null,
      imageUrl: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file) => {
    setFormData(prev => ({ ...prev, imageFile: file }));
  };

  const handleSubmit = async () => {
    if (!formData.title || (!formData.imageFile && !formData.imageUrl)) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('tags', formData.tags);
      submitData.append('isActive', formData.isActive);
      
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      }

      if (editingPhoto) {
        await api.put(`/admin/photos/${editingPhoto._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Photo updated successfully!', 'success');
      } else {
        await api.post('/admin/photos', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Photo uploaded successfully!', 'success');
      }

      handleCloseDialog();
      fetchPhotos();
      fetchPhotoStats();
    } catch (error) {
      console.error('Error saving photo:', error);
      showNotification(
        error.response?.data?.error || 'Failed to save photo',
        'error'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await api.delete(`/admin/photos/${photoId}`);
      showNotification('Photo deleted successfully!', 'success');
      fetchPhotos();
      fetchPhotoStats();
    } catch (error) {
      console.error('Error deleting photo:', error);
      showNotification('Failed to delete photo', 'error');
    }
  };

  const togglePhotoStatus = async (photoId, currentStatus) => {
    try {
      await api.patch(`/admin/photos/${photoId}/toggle-status`);
      showNotification(
        `Photo ${currentStatus ? 'deactivated' : 'activated'} successfully!`,
        'success'
      );
      fetchPhotos();
    } catch (error) {
      console.error('Error toggling photo status:', error);
      showNotification('Failed to update photo status', 'error');
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
    <Container maxWidth="xl">
      <PageHeader 
        title="📸 Photo Management" 
        subtitle="Manage photos for user sharing campaigns"
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <PhotoCamera sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {photos.length}
              </Typography>
              <Typography variant="body1">Total Photos</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <Visibility sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {photos.filter(p => p.isActive).length}
              </Typography>
              <Typography variant="body1">Active Photos</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <CloudUpload sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {photoStats.totalShares || 0}
              </Typography>
              <Typography variant="body1">Total Shares</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">RWF</Typography>
              <Typography variant="h4" fontWeight="bold">
                {photoStats.totalRwfPaid || 0}
              </Typography>
              <Typography variant="body1">Total RWF Paid</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          📷 Photo Gallery
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
          }}
        >
          Upload New Photo
        </Button>
      </Box>

      {photos.length === 0 ? (
        <Alert severity="info">
          No photos uploaded yet. Click "Upload New Photo" to add your first photo.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={photo._id}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo.imageUrl}
                  alt={photo.title}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Image failed to load:', photo.imageUrl);
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f5f5f5"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                      {photo.title}
                    </Typography>
                    <Chip 
                      label={photo.isActive ? 'Active' : 'Inactive'}
                      color={photo.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {photo.description}
                  </Typography>
                  
                  {photo.tags && photo.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                      {photo.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Uploaded: {new Date(photo.createdAt).toLocaleDateString()}
                    {photo.shareCount && (
                      <span> • {photo.shareCount} shares</span>
                    )}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(photo)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => togglePhotoStatus(photo._id, photo.isActive)}
                      sx={{ color: photo.isActive ? 'warning.main' : 'success.main' }}
                    >
                      {photo.isActive ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePhoto(photo._id)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPhoto ? '✏️ Edit Photo' : '📤 Upload New Photo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Photo Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="nature, landscape, beauty"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.value)}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {editingPhoto ? 'Update Photo (optional)' : 'Upload Photo'}
                </Typography>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </Box>
              
              {(formData.imageUrl || editingPhoto?.imageUrl) && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Preview:</Typography>
                  <img 
                    src={formData.imageUrl || editingPhoto?.imageUrl} 
                    alt="Preview"
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      maxHeight: '200px',
                      borderRadius: '8px' 
                    }}
                    onError={(e) => {
                      console.error('Preview image failed to load:', formData.imageUrl || editingPhoto?.imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={uploadingPhoto}
            startIcon={uploadingPhoto ? <CircularProgress size={16} /> : <CloudUpload />}
          >
            {uploadingPhoto 
              ? 'Uploading...' 
              : editingPhoto 
                ? 'Update Photo' 
                : 'Upload Photo'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}