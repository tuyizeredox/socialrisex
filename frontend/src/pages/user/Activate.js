import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Divider,
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
  Phone,
  WhatsApp,
  CheckCircle,
  ArrowForward,
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
          To activate your account, you need to pay a one-time activation fee of 5,000 RWF
        </Alert>

        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Payment sx={{ color: 'inherit' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Amount: 5,000 RWF"
                  secondary="Amafaranga y'ishyirwa mu bikorwa: 5,000 RWF"
                  secondaryTypographyProps={{ color: 'inherit' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone sx={{ color: 'inherit' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="MTN MoMo Pay Code: 348807"
                  secondary="Izina: CLEMENTINE"
                  secondaryTypographyProps={{ color: 'inherit' }}
                />
              </ListItem>
            </List>
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
                <ListItemText primary="2. Enter MoMo Pay Code: 348807" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="3. Enter amount: 5,000 RWF" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="4. Confirm payment with your PIN" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="5. Take a screenshot of the payment confirmation message" />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Mu Kinyarwanda:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="1. Kanda *182*8*1# kuri telefoni yawe" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="2. Andika kode ya MoMo Pay: 348807" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="3. Andika amafaranga: 5,000 RWF" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="4. Emeza kwishyura ukoresheje PIN yawe" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary="5. Fata ifoto y'ubutumwa bwemeza ko wishyuye" />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Box bgcolor="grey.100" p={3} borderRadius={1} mb={4}>
          <Typography variant="h6" gutterBottom>
            After Payment / Nyuma yo Kwishyura
          </Typography>
          <Typography variant="body1" paragraph>
            Send the payment screenshot to our support team via WhatsApp:
          </Typography>
          <Button
            variant="contained"
            startIcon={<WhatsApp />}
            href="https://wa.me/250791786228"
            target="_blank"
            sx={{ mb: 2 }}
          >
            WhatsApp: 0791786228
          </Button>
          <Typography variant="body2" color="text.secondary">
            Ohereza ifoto y'ubutumwa bwemeza ko wishyuye kuri WhatsApp: 0791786228
          </Typography>
        </Box>

        <Alert severity="success">
          <Typography variant="body1">
            Your account will be activated within 24 hours after payment verification.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Konti yawe izakora mu masaha 24 nyuma yo kugenzura ko wishyuye.
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