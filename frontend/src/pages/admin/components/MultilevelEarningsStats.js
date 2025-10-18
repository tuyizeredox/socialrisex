import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  People,
  MonetizationOn,
  Star,
  AccountBalance
} from '@mui/icons-material';

export default function MultilevelEarningsStats({ stats, isMobile }) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <People />,
      color: 'primary',
      bgColor: 'primary.light'
    },
    {
      title: 'Total Earnings',
      value: `${(stats.totalEarnings || 0).toLocaleString()} RWF`,
      icon: <MonetizationOn />,
      color: 'success',
      bgColor: 'success.light'
    },
    {
      title: 'Level 1 Earnings',
      value: `${(stats.totalLevel1Earnings || 0).toLocaleString()} RWF`,
      icon: <TrendingUp />,
      color: 'info',
      bgColor: 'info.light'
    },
    {
      title: 'Level 2 Earnings',
      value: `${(stats.totalLevel2Earnings || 0).toLocaleString()} RWF`,
      icon: <AccountBalance />,
      color: 'warning',
      bgColor: 'warning.light'
    },
    {
      title: 'Level 3 Earnings',
      value: `${(stats.totalLevel3Earnings || 0).toLocaleString()} RWF`,
      icon: <Star />,
      color: 'secondary',
      bgColor: 'secondary.light'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Main Stats Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ 
              bgcolor: stat.bgColor, 
              color: `${stat.color}.contrastText`, 
              height: '100%' 
            }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexDirection: { xs: 'row', sm: 'row' },
                  gap: { xs: 1.5, sm: 0 }
                }}>
                  <Avatar sx={{ 
                    bgcolor: `${stat.color}.main`, 
                    mr: { xs: 1.5, sm: 2 },
                    fontSize: { xs: 28, sm: 32, md: 40 }
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant={isMobile ? 'h6' : 'h5'} 
                      fontWeight={700} 
                      sx={{ lineHeight: 1.2 }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Average Earnings
              </Typography>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {Math.round(stats.avgEarnings || 0).toLocaleString()} RWF
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per user with multilevel earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Highest Earnings
              </Typography>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {Math.round(stats.maxEarnings || 0).toLocaleString()} RWF
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top earner in the system
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Earners */}
      {stats.topEarners && stats.topEarners.length > 0 && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              🏆 Top Earners
            </Typography>
            <List dense>
              {stats.topEarners.slice(0, 5).map((earner, index) => (
                <ListItem key={earner._id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={earner.user?.fullName || 'Unknown User'}
                    secondary={earner.user?.email || 'No email'}
                  />
                  <Chip
                    label={`${earner.totalEarnings.toLocaleString()} RWF`}
                    color="success"
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
