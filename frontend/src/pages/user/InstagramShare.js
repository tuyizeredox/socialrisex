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
  DialogActions,
  TextField
} from '@mui/material';
import {
  Instagram,
  Share,
  MonetizationOn,
  Download,
  EmojiEvents,
  ContentCopy
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';

export default function InstagramShare() {
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
      // Filter only Instagram shares
      setUserShares(allShares.filter(share => share.platform === 'instagram'));
    } catch (error) {
      console.error('Error fetching user shares:', error);
    }
  };

  const handleSharePhoto = (photo) => {
    setSelectedPhoto(photo);
    setOpenDialog(true);
  };

  const shareToInstagram = async () => {
    if (!selectedPhoto) return;
    
    setSharing(true);
    try {
      // Record the share action
      const response = await api.post('/users/share-photo', {
        photoId: selectedPhoto._id,
        platform: 'instagram'
      });

      const pointsEarned = response.data?.pointsEarned || 0;
      const earnedMessage = pointsEarned > 0 
        ? `Photo downloaded! Upload it to Instagram with the caption provided. You earned 50 RWF!`
        : `Photo already shared. Upload new photos to earn more!`;

      showNotification(earnedMessage, 'success');

      // Download the photo first
      downloadPhoto(selectedPhoto);
      
      // Keep dialog open to show caption
      fetchUserShares(); // Refresh shares
      
      // Always dispatch event to notify Dashboard to refresh (even if already shared)
      const photoSharedEvent = new CustomEvent('photoShared', {
        detail: {
          photoId: selectedPhoto._id,
          earnings: pointsEarned
        }
      });
      window.dispatchEvent(photoSharedEvent);
      
    } catch (error) {
      console.error('Error sharing photo:', error);
      showNotification(
        error.response?.data?.message || 'Failed to record photo share', 
        'error'
      );
    } finally {
      setSharing(false);
    }
  };

  const downloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `socialrisex-instagram-${photo._id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInstagramCaption = () => {
    if (!selectedPhoto) return '';
    return `🌟 Check out this amazing photo from SocialRise X! 📸\n\n` +
      `Join me on this incredible earning platform and start making money today! 💰\n\n` +
      `Use my referral code: ${user.referralCode}\n` +
      `Sign up here: ${process.env.REACT_APP_FRONTEND_URL || 'https://socialrisex.com'}/register?ref=${user.referralCode}\n\n` +
      `#SocialRiseX #EarnMoney #InstagramShare #MakeMoneyOnline #PassiveIncome`;
  };

  const copyCaption = () => {
    const caption = getInstagramCaption();
    navigator.clipboard.writeText(caption);
    showNotification('Caption copied to clipboard!', 'success');
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
        title="💜 Instagram Share & Earn" 
        subtitle="Share photos on Instagram and earn RWF for each share!"
      />

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #E1306C 0%, #C13584 100%)',
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
            background: 'linear-gradient(135deg, #C13584 0%, #833AB4 100%)',
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
            background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <CardContent>
              <Instagram sx={{ fontSize: 40, mb: 1 }} />
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
        💡 <strong>How it works:</strong> Choose a photo, download it, and upload to Instagram with the provided caption including your referral link. Earn 50 RWF instantly! 
        Share as posts, stories, or reels to maximize your reach.
      </Alert>

      {/* Available Photos */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        📷 Available Photos to Share on Instagram
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
                          background: 'linear-gradient(135deg, #E1306C 0%, #C13584 100%)',
                          color: 'white'
                        }}
                        variant="filled" 
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Instagram />}
                      onClick={() => handleSharePhoto(photo)}
                      sx={{ 
                        flex: 1,
                        background: 'linear-gradient(135deg, #E1306C 0%, #C13584 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #C13584 0%, #E1306C 100%)' }
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
                        color: '#E1306C',
                        borderColor: '#E1306C',
                        '&:hover': { borderColor: '#C13584', color: '#C13584' }
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
            🎯 Your Recent Instagram Shares
          </Typography>
          <Grid container spacing={2}>
            {userShares.slice(0, 6).map((share, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Instagram sx={{ fontSize: 40, color: '#E1306C', mb: 1 }} />
                    <Typography variant="body1" fontWeight="bold">
                      Shared on {new Date(share.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platform: Instagram
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
          💜 Share to Instagram
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
                🎉 You'll earn <strong>50 RWF</strong> for sharing this photo on Instagram!
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Steps to share:</strong>
              </Typography>
              <Typography variant="body2" component="ol" sx={{ mb: 2, pl: 2 }}>
                <li>Click "Download & Share" to download the photo</li>
                <li>Copy the caption below</li>
                <li>Open Instagram app on your phone</li>
                <li>Upload the downloaded photo</li>
                <li>Paste the caption and post!</li>
              </Typography>
              
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                Caption to use:
              </Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                value={getInstagramCaption()}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={copyCaption}
                fullWidth
                sx={{ 
                  color: '#E1306C',
                  borderColor: '#E1306C',
                  '&:hover': { borderColor: '#C13584', color: '#C13584' }
                }}
              >
                Copy Caption
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={shareToInstagram}
            disabled={sharing}
            startIcon={sharing ? <CircularProgress size={16} /> : <Instagram />}
            sx={{ 
              background: 'linear-gradient(135deg, #E1306C 0%, #C13584 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #C13584 0%, #E1306C 100%)' }
            }}
          >
            {sharing ? 'Downloading...' : 'Download & Share'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}