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
  Facebook,
  Share,
  MonetizationOn,
  Download,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';

export default function FacebookShare() {
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
      const allShares = response.data.data || [];
      // Filter only Facebook shares
      setUserShares(allShares.filter(share => share.platform === 'facebook'));
    } catch (error) {
      console.error('Error fetching user shares:', error);
    }
  };

  const handleSharePhoto = (photo) => {
    setSelectedPhoto(photo);
    setOpenDialog(true);
  };

  const shareToFacebook = async () => {
    if (!selectedPhoto) return;
    
    setSharing(true);
    try {
      // Record the share action
      await api.post('/users/share-photo', {
        photoId: selectedPhoto._id,
        platform: 'facebook'
      });

      // Create Facebook share link
      const shareUrl = encodeURIComponent(
        `${process.env.REACT_APP_FRONTEND_URL || 'https://socialrisex.com'}/register?ref=${user.referralCode}`
      );
      
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(
        `🌟 Check out this amazing photo from SocialRise X! 📸\n\n` +
        `Join me on this incredible earning platform and start making money today! 💰\n\n` +
        `Use my referral code: ${user.referralCode}\n\n` +
        `#SocialRiseX #EarnMoney #FacebookShare`
      )}`;
      
      window.open(facebookUrl, '_blank', 'width=600,height=400');
      
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
    link.download = `socialrisex-facebook-${photo._id}.jpg`;
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
        title="💙 Facebook Share & Earn" 
        subtitle="Share photos on Facebook and earn RWF for each share!"
      />

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1877F2 0%, #0C63D4 100%)',
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
            background: 'linear-gradient(135deg, #0C63D4 0%, #044A9C 100%)',
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
            background: 'linear-gradient(135deg, #4267B2 0%, #1877F2 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <Facebook sx={{ fontSize: 40, mb: 1 }} />
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
        💡 <strong>How it works:</strong> Choose a photo, share it on Facebook with your referral link, and earn 50 RWF instantly! 
        Share to your timeline, groups, or pages to maximize your earnings.
      </Alert>

      {/* Available Photos */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        📷 Available Photos to Share on Facebook
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
                        sx={{ 
                          backgroundColor: '#1877F2',
                          color: 'white'
                        }}
                        variant="filled" 
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Facebook />}
                      onClick={() => handleSharePhoto(photo)}
                      sx={{ 
                        flex: 1,
                        background: 'linear-gradient(135deg, #1877F2 0%, #0C63D4 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #0C63D4 0%, #1877F2 100%)' }
                      }}
                    >
                      Share & Earn
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => downloadPhoto(photo)}
                      size="small"
                      sx={{ 
                        color: '#1877F2',
                        borderColor: '#1877F2',
                        '&:hover': { borderColor: '#0C63D4', color: '#0C63D4' }
                      }}
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
            🎯 Your Recent Facebook Shares
          </Typography>
          <Grid container spacing={2}>
            {userShares.slice(0, 6).map((share, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Facebook sx={{ fontSize: 40, color: '#1877F2', mb: 1 }} />
                    <Typography variant="body1" fontWeight="bold">
                      Shared on {new Date(share.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platform: Facebook
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
          💙 Share to Facebook
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
                🎉 You'll earn <strong>50 RWF</strong> for sharing this photo on Facebook!
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This will open Facebook's share dialog with a pre-written message including your referral link. 
                Share it on your timeline, groups, or pages to earn RWF!
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={shareToFacebook}
            disabled={sharing}
            startIcon={sharing ? <CircularProgress size={16} /> : <Facebook />}
            sx={{ 
              background: 'linear-gradient(135deg, #1877F2 0%, #0C63D4 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #0C63D4 0%, #1877F2 100%)' }
            }}
          >
            {sharing ? 'Opening Facebook...' : 'Share Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}