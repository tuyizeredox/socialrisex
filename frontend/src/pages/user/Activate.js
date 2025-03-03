import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Snackbar
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Lock
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activateAccount } from '../../services/auth.service';

export default function Activate() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  if (user?.isActive) {
    navigate('/app/dashboard');
    return null;
  }

  const handleActivationSubmit = async () => {
    try {
      await activateAccount();
      await refreshUser(); // Refresh user data to get updated activation status
      setSnackbar({
        open: true,
        message: 'Account activated successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to activate account',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box textAlign="center" mb={4}>
          <Lock color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Activate Your Account
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Complete your account activation to access all features
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          To activate your account, you need to pay a one-time activation fee of 7,000 RWF
        </Alert>

        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Typography variant="body1">
              Visit the <strong>Help Center</strong> to get the number to pay on.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom>
          Payment Instructions / Amabwiriza yo Kwishyura
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              In English:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="1. Dial *182*8*1# on your phone" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="2. Enter the MoMo Pay Code" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="3. Enter amount: 7,000 RWF" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="4. Confirm payment with your PIN" />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Alert severity="success">
          <Typography variant="body1">
            Your account will be activated automatically after payment verification.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Konti yawe izahita ikora nyuma yo kwemeza ko wishyuye.
          </Typography>
        </Alert>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}
