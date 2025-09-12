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
  useTheme
} from '@mui/material';
import {
  ContentCopy,
  People,
  PersonAdd,
  MonetizationOn,
  CheckCircle
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
    <Container>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          textAlign: 'center',
          boxShadow: 3
        }}
      >
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Your Team Dashboard 👥
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage your multi-level referral network and track earnings
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Level 1 Members"
            value={referralData?.stats.level1Count || 0}
            icon={PersonAdd}
            color="success"
            subtitle="4,000 RWF per active member"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Level 2 Members"
            value={referralData?.stats.level2Count || 0}
            icon={People}
            color="warning"
            subtitle="1,500 RWF per active member"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Level 3 Members"
            value={referralData?.stats.level3Count || 0}
            icon={People}
            color="info"
            subtitle="1,000 RWF per active member"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
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
            subtitle={`${referralData?.stats.level1Count || 0} × 4,000 RWF`}
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: 3
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom textAlign="center">
            🏆 Multi-Level Referral System Explained
          </Typography>
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={4} textAlign="center">
              <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h3" fontWeight="bold">💰</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>Level 1</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">4,000 RWF</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Per person you directly refer</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h3" fontWeight="bold">💸</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>Level 2</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">1,500 RWF</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Per person your referrals refer</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h3" fontWeight="bold">💵</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>Level 3</Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">1,000 RWF</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Per person their referrals refer</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Referral Link
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography 
              variant="body2" 
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                p: 2, 
                borderRadius: 1,
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {referralInfo?.referralLink?.replace(/([^:]\/)\/+/g, "$1")}
            </Typography>
            <Tooltip title="Copy link">
              <IconButton onClick={copyReferralLink} color="primary">
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Earnings Generated</TableCell>
              <TableCell align="right">Joined Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referralData?.referrals.map((referral) => (
              <TableRow key={referral._id}>
                <TableCell>{referral.fullName}</TableCell>
                <TableCell align="center">
                  {referral.isActive ? (
                    <Tooltip title="Active - Generating 4,000 RWF (Level 1)">
                      <CheckCircle color="success" />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  RWF {referral.isActive ? '4,000' : '0'}
                </TableCell>
                <TableCell align="right">
                  {new Date(referral.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {referralData?.referrals.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    You haven't referred anyone yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
