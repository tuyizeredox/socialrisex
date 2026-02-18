import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PhotoCamera,
  WhatsApp,
  Share,
  MonetizationOn,
  Download,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';

export default function PhotoShare() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userShares, setUserShares] = useState([]);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPhotos();
    fetchUserShares();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get('/photos/available');
      setPhotos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      showNotification('Failed to load photos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShares = async () => {
    try {
      const response = await api.get('/users/photo-shares');
      setUserShares(response.data.data || []);
    } catch (error) {
      console.error('Error fetching user shares:', error);
    }
  };

  const handleSharePhoto = (photo) => {
    setSelectedPhoto(photo);
    setOpenDialog(true);
  };

  const shareToWhatsApp = async () => {
    if (!selectedPhoto) return;
    
    setSharing(true);
    try {
      // Record the share action
      await api.post('/users/share-photo', {
        photoId: selectedPhoto._id,
        platform: 'whatsapp'
      });

      // Create WhatsApp share link
      const shareText = encodeURIComponent(
        `🌟 Check out this amazing photo from Pesa Boost! 📸\n\n` +
        `Join me on this incredible earning platform and start making money today! 💰\n\n` +
        `Use my referral code: ${user.referralCode}\n` +
        `Sign up here: ${process.env.REACT_APP_FRONTEND_URL || 'https://worldwideearn.com'}/register?ref=${user.referralCode}\\n\\n` +
        `#PesaBoost #EarnMoney #PhotoShare`
      );
      
      const whatsappUrl = `https://wa.me/?text=${shareText}`;
      window.open(whatsappUrl, '_blank');
      
      showNotification('Photo shared successfully! You earned 50 RWF!', 'success');
      setOpenDialog(false);
      fetchUserShares(); // Refresh shares
      
    } catch (error) {
      console.error('Error sharing photo:', error);
      showNotification('Failed to record photo share', 'error');
    } finally {
      setSharing(false);
    }
  };

  const downloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `worldwide-earn-${photo._id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        title="📸 Photo Share & Earn" 
        subtitle="Share photos on WhatsApp and earn RWF for each share!"
      />

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <MonetizationOn sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                RWF {userShares.reduce((total, share) => total + (share.rwfEarned || 50), 0)}
              </Typography>
              <Typography variant="body1">Total Earned</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <Share sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {userShares.length}
              </Typography>
              <Typography variant="body1">Photos Shared</Typography>
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
              <PhotoCamera sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {photos.length}
              </Typography>
              <Typography variant="body1">Available Photos</Typography>
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
              <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                50
              </Typography>
              <Typography variant="body1">RWF per Share</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 <strong>How it works:</strong> Choose a photo, share it on WhatsApp with your referral link, and earn 50 RWF instantly! 
        Each photo can be shared multiple times to different groups or contacts.
      </Alert>

      {/* Available Photos */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        📷 Available Photos to Share
      </Typography>

      {photos.length === 0 ? (
        <Alert severity="warning">
          No photos available for sharing at the moment. Check back later!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo._id}>
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
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {photo.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {photo.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {photo.tags?.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<WhatsApp />}
                      onClick={() => handleSharePhoto(photo)}
                      sx={{ 
                        flex: 1,
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)' }
                      }}
                    >
                      Share & Earn
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => downloadPhoto(photo)}
                      size="small"
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Recent Shares */}
      {userShares.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🎯 Your Recent Shares
          </Typography>
          <Grid container spacing={2}>
            {userShares.slice(0, 6).map((share, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" fontWeight="bold">
                      Shared on {new Date(share.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platform: WhatsApp
                    </Typography>
                    <Chip 
                      label={`+${share.rwfEarned || 50} RWF`}
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Share Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📱 Share to WhatsApp
        </DialogTitle>
        <DialogContent>
          {selectedPhoto && (
            <>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img 
                  src={selectedPhoto.imageUrl} 
                  alt={selectedPhoto.title}
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px', borderRadius: '8px' }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                {selectedPhoto.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedPhoto.description}
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                🎉 You'll earn <strong>50 RWF</strong> for sharing this photo!
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This will open WhatsApp with a pre-written message including the photo and your referral link. 
                Share it with your contacts or groups to earn RWF!
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={shareToWhatsApp}
            disabled={sharing}
            startIcon={sharing ? <CircularProgress size={16} /> : <WhatsApp />}
            sx={{ 
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)' }
            }}
          >
            {sharing ? 'Opening WhatsApp...' : 'Share Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}