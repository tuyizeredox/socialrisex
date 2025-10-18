import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../utils/api';

export default function BonusStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bonus-transactions/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching bonus stats:', err);
      setError('Failed to fetch bonus statistics');
      showNotification('Failed to fetch bonus statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'admin_bonus': return 'primary';
      case 'referral_bonus': return 'success';
      case 'special_promotion': return 'warning';
      default: return 'default';
    }
  };

  const formatType = (type) => {
    switch (type) {
      case 'admin_bonus': return 'Admin Bonus';
      case 'referral_bonus': return 'Referral Bonus';
      case 'special_promotion': return 'Special Promotion';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    RWF {(stats?.totalBonusGiven || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bonus Given
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stats?.totalBonusTransactions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats?.pendingBonusTransactions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Transactions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats?.recentBonuses?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recent Bonuses
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Bonus by Type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bonus Distribution by Type
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.bonusByType?.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Chip
                            label={formatType(item._id)}
                            color={getTypeColor(item._id)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            RWF {item.total.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.count}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bonuses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bonus Payments
              </Typography>
              {stats?.recentBonuses?.length > 0 ? (
                <List>
                  {stats.recentBonuses.map((bonus, index) => (
                    <Box key={bonus._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light' }}>
                            <StarIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="bold">
                                {bonus.user?.fullName || 'Unknown User'}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                RWF {bonus.amount?.toLocaleString() || '0'}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {bonus.description}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {new Date(bonus.addedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < stats.recentBonuses.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No recent bonuses found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Statistics */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bonus Statistics Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      RWF {(stats?.totalBonusGiven || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bonus Given
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {stats?.totalBonusTransactions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {stats?.pendingBonusTransactions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {stats?.bonusByType?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bonus Types
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
