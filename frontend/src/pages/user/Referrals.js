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
      <PageHeader 
        title="Your Team" 
        subtitle="Manage your referrals and earnings"
      />

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Team Members"
            value={referralData?.stats.total || 0}
            icon={People}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Members"
            value={referralData?.stats.active || 0}
            icon={PersonAdd}
            color="success"
            subtitle="2,800 RWF per active member"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
     <StatCard
  title="Team Earnings"
  value={`RWF ${((referralData?.stats?.active ?? 0) * 2800).toLocaleString()}`}
  subtitle={`${(referralData?.stats?.active ?? 0).toLocaleString()} active × 2,800 RWF`}
  icon={MonetizationOn}
  color="info"
/>

        </Grid>
      </Grid>

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
                    <Tooltip title="Active - Generating 2,800 RWF">
                      <CheckCircle color="success" />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  RWF {referral.isActive ? '2,800' : '0'}
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
