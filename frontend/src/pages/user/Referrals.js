import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  Chip,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ContentCopy,
  People,
  PersonAdd,
  MonetizationOn,
  CheckCircle,
  WhatsApp,
  Phone,
  Search,
  Clear
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

export default function Referrals() {
  const theme = useTheme();
  const [referralData, setReferralData] = useState(null);
  const [referralInfo, setReferralInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all', 'level1', 'level2', 'level3'
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [referralsRes, infoRes] = await Promise.all([
        api.get('/users/referrals'),
        api.get('/users/referral-info')
      ]);

      setReferralData(referralsRes.data);
      setReferralInfo(infoRes.data);
    } catch (err) {
      console.error('Referral fetch error:', err);
      setError('Failed to fetch referrals');
      showNotification('Failed to fetch referral data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (referralInfo?.referralLink) {
      // Clean up the referral link by removing any double slashes except for https://
      const cleanLink = referralInfo.referralLink.replace(/([^:]\/)\/+/g, "$1");
      navigator.clipboard.writeText(cleanLink);
      showNotification('Referral link copied to clipboard!', 'success');
    }
  };

  const openWhatsAppChat = (mobileNumber, name) => {
    if (!mobileNumber) {
      showNotification('Mobile number not available', 'error');
      return;
    }
    
    // Remove any non-digit characters from mobile number
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    
    // Create WhatsApp URL with optional pre-filled message
    const message = encodeURIComponent(`Hi ${name}, I wanted to reach out to you from SocialRise X!`);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  // Filter referrals based on search query and selected level
  const filteredReferrals = referralData?.referrals.filter((referral) => {
    // Filter by level
    if (selectedLevel !== 'all') {
      const levelMap = { level1: 1, level2: 2, level3: 3 };
      if (referral.level !== levelMap[selectedLevel]) return false;
    }
    
    // Filter by search query
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const name = referral.fullName?.toLowerCase() || '';
    const mobile = referral.mobileNumber?.toLowerCase() || '';
    
    return name.includes(query) || mobile.includes(query);
  }) || [];

  const clearSearch = () => {
    setSearchQuery('');
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

  return (
    <Container sx={{ px: { xs: 2, sm: 3 } }}>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
          borderRadius: { xs: 2, sm: 3 },
          p: { xs: 3, sm: 4 },
          mb: 4,
          color: 'white',
          textAlign: 'center',
          boxShadow: 3
        }}
      >
        <Typography 
          variant="h3" 
          fontWeight={800} 
          gutterBottom
          sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
        >
          Your Team Dashboard 👥
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            px: { xs: 1, sm: 0 }
          }}
        >
          Manage your multi-level referral network and track earnings
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Level 1 Members"
            value={referralData?.stats.level1Count || 0}
            icon={PersonAdd}
            color="success"
            subtitle="3,200 RWF per active member"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Level 2 Members"
            value={referralData?.stats.level2Count || 0}
            icon={People}
            color="warning"
            subtitle="1,100 RWF per active member"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Level 3 Members"
            value={referralData?.stats.level3Count || 0}
            icon={People}
            color="info"
            subtitle="700 RWF per active member"
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Team Members"
            value={referralData?.stats.total || 0}
            icon={People}
            color="primary"
            subtitle="All levels combined"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`RWF ${(referralData?.stats?.earnings ?? 0).toLocaleString()}`}
            subtitle={`Multi-level earnings`}
            icon={MonetizationOn}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Level 1 Earnings"
            value={`RWF ${(referralData?.stats?.breakdown?.level1 ?? 0).toLocaleString()}`}
            subtitle={`${referralData?.stats.level1Count || 0} × 3,200 RWF`}
            icon={MonetizationOn}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Level 2+3 Earnings"
            value={`RWF ${((referralData?.stats?.breakdown?.level2 ?? 0) + (referralData?.stats?.breakdown?.level3 ?? 0)).toLocaleString()}`}
            subtitle={`Level 2: ${referralData?.stats.level2Count || 0} + Level 3: ${referralData?.stats.level3Count || 0}`}
            icon={MonetizationOn}
            color="warning"
          />
        </Grid>
      </Grid>

      <Card 
        sx={{ 
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #06d6a0 0%, #048c69 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: 3
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            gutterBottom 
            textAlign="center"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            🏆 Multi-Level Referral System Explained
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }} mt={2}>
            <Grid item xs={12} sm={6} md={4} textAlign="center">
              <Box sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: { xs: 1.5, sm: 2 }
              }}>
                <Typography 
                  variant="h3" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}
                >
                  💰
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  Level 1
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  color="success.main"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                >
                  3,200 RWF
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Per person you directly refer
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4} textAlign="center">
              <Box sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: { xs: 1.5, sm: 2 }
              }}>
                <Typography 
                  variant="h3" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}
                >
                  💸
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  Level 2
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  color="warning.main"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                >
                  1,100 RWF
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Per person your referrals refer
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4} textAlign="center">
              <Box sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: { xs: 1.5, sm: 2 }
              }}>
                <Typography 
                  variant="h3" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}
                >
                  💵
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  Level 3
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  color="info.main"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                >
                  700 RWF
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Per person their referrals refer
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
          >
            Your Referral Link
          </Typography>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={2}
            sx={{ 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1,
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                wordBreak: 'break-all'
              }}
            >
              {referralInfo?.referralLink?.replace(/([^:]\/)\/+/g, "$1")}
            </Typography>
            <Tooltip title="Copy link">
              <IconButton 
                onClick={copyReferralLink} 
                color="primary"
                sx={{ 
                  alignSelf: { xs: 'center', sm: 'auto' },
                  mt: { xs: 1, sm: 0 }
                }}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      {referralData?.referrals.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <TextField
              fullWidth
              placeholder="Search by name or mobile number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
            
            {/* Level Filter Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={selectedLevel === 'all' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedLevel('all')}
                sx={{ borderRadius: 2 }}
              >
                All Levels ({referralData?.referrals.length || 0})
              </Button>
              <Button
                variant={selectedLevel === 'level1' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedLevel('level1')}
                color="success"
                sx={{ borderRadius: 2 }}
              >
                Level 1 ({referralData?.level1Referrals?.length || 0})
              </Button>
              <Button
                variant={selectedLevel === 'level2' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedLevel('level2')}
                color="warning"
                sx={{ borderRadius: 2 }}
              >
                Level 2 ({referralData?.level2Referrals?.length || 0})
              </Button>
              <Button
                variant={selectedLevel === 'level3' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedLevel('level3')}
                color="info"
                sx={{ borderRadius: 2 }}
              >
                Level 3 ({referralData?.level3Referrals?.length || 0})
              </Button>
            </Box>
            
            {(searchQuery || selectedLevel !== 'all') && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1.5, ml: 0.5 }}
              >
                Found {filteredReferrals.length} result{filteredReferrals.length !== 1 ? 's' : ''}
                {selectedLevel !== 'all' && ` in Level ${selectedLevel.replace('level', '')}`}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Referral List - Desktop View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Name & Contact</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Level</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Earnings Generated</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Joined Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReferrals.map((referral) => (
                <TableRow 
                  key={referral._id}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        {referral.fullName}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {referral.mobileNumber || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`Level ${referral.level}`}
                      color={
                        referral.level === 1 ? 'success' : 
                        referral.level === 2 ? 'warning' : 'info'
                      }
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {referral.isActive ? (
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small"
                        icon={<CheckCircle />}
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip 
                        label="Inactive" 
                        color="default" 
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      color={referral.isActive ? 'success.main' : 'text.secondary'}
                    >
                      RWF {referral.earnings?.toLocaleString() || '0'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {referral.mobileNumber ? (
                      <Tooltip title="Chat on WhatsApp">
                        <IconButton
                          size="small"
                          onClick={() => openWhatsAppChat(referral.mobileNumber, referral.fullName)}
                          sx={{
                            color: '#25D366',
                            backgroundColor: 'rgba(37, 211, 102, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(37, 211, 102, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <WhatsApp />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredReferrals.length === 0 && (searchQuery || selectedLevel !== 'all') && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={6}>
                      <Search sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No results found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedLevel !== 'all' 
                          ? `No referrals found in Level ${selectedLevel.replace('level', '')}`
                          : 'Try searching with a different name or mobile number'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {referralData?.referrals.length === 0 && !searchQuery && selectedLevel === 'all' && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={6}>
                      <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No referrals yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Share your referral link to start earning!
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Referral List - Mobile View */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredReferrals.length === 0 && (searchQuery || selectedLevel !== 'all') ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Search sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No results found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLevel !== 'all' 
                ? `No referrals found in Level ${selectedLevel.replace('level', '')}`
                : 'Try searching with a different name or mobile number'
              }
            </Typography>
          </Paper>
        ) : referralData?.referrals.length === 0 && selectedLevel === 'all' ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No referrals yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share your referral link to start earning!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredReferrals.map((referral) => (
              <Grid item xs={12} key={referral._id}>
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: 'all 0.3s',
                    '&:hover': { 
                      boxShadow: 4,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {referral.fullName}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {referral.mobileNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1} alignItems="end">
                        <Chip 
                          label={`Level ${referral.level}`}
                          color={
                            referral.level === 1 ? 'success' : 
                            referral.level === 2 ? 'warning' : 'info'
                          }
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        {referral.isActive ? (
                          <Chip 
                            label="Active" 
                            color="success" 
                            size="small"
                            icon={<CheckCircle />}
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Chip label="Inactive" color="default" size="small" />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          💰 Earnings Generated
                        </Typography>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          color={referral.isActive ? 'success.main' : 'text.secondary'}
                        >
                          RWF {referral.earnings?.toLocaleString() || '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          📅 Joined Date
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    {referral.mobileNumber && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<WhatsApp />}
                        onClick={() => openWhatsAppChat(referral.mobileNumber, referral.fullName)}
                        sx={{
                          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                          fontWeight: 600,
                          py: 1.2,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)',
                            transform: 'scale(1.02)'
                          },
                          transition: 'all 0.2s'
                        }}
                      >
                        Chat on WhatsApp
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
