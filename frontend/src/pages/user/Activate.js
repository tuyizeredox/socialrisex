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
  Snackbar,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Payment,
  Phone,
  WhatsApp,
  CheckCircle,
  ArrowForward,
  Lock,
  ContentCopy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activateAccount } from '../../services/auth.service';

export default function Activate() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [airtelOpen, setAirtelOpen] = useState(false);
  const [mtnOpen, setMtnOpen] = useState(false);

  if (user?.isActive) {
    navigate('/app/dashboard');
    return null;
  }

  const handleActivationSubmit = async () => {
    try {
      await activateAccount();
      await refreshUser();
      setSnackbar({
        open: true,
        message: 'Account activated successfully!',
        severity: 'success',
      });
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to activate account',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Number copied to clipboard!',
      severity: 'success',
    });
  };

  const paymentSteps = (provider, number) => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {provider} Payment Instructions / Amabwiriza yo Kwishyura na {provider}
      </Typography>
      <List dense>
        <ListItem>
          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
          <ListItemText
            primary="Dial the code / Kanda kode"
            secondary="Dial *182# and press call / Kanda *182# hanyuma ukande ubuto bwo guhamagara"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
          <ListItemText
            primary="Select payment option / Hitamo uburyo bwo kwishyura"
            secondary={
              provider === 'Airtel'
                ? "Choose 'Airtel Money' (usually option 1 or 2) / Hitamo 'Airtel Money' (ubushobodzi ni 1 cyangwa 2)"
                : "Choose 'MoMo Pay' (usually option 4) / Hitamo 'MoMo Pay' (ubushobodzi ni 4)"
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
          <ListItemText
            primary="Enter merchant code / Injiza kode y’umucuruzi"
            secondary={
              provider === 'Airtel'
                ? "Enter 348807 for STATISTICS CO LTD / Injiza 348807 kuri STATISTICS CO LTD"
                : "Enter 348807 for CLEMENTINE / Injiza 348807 kuri CLEMENTINE"
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
          <ListItemText
            primary="Enter amount / Injiza amafaranga"
            secondary="Type 7000 and press send / Andika 7000 hanyuma wohereze"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
          <ListItemText
            primary="Confirm payment / Emeza ko wishyuye"
            secondary={
              provider === 'Airtel'
                ? "Enter your Airtel Money PIN (4 digits) / Injiza PIN ya Airtel Money (imibare 4)"
                : "Enter your MTN MoMo PIN (4 digits) / Injiza PIN ya MTN MoMo (imibare 4)"
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
          <ListItemText
            primary="Wait for confirmation / Tegereza icyemezo"
            secondary="You’ll receive an SMS confirming the payment / Uzahabwa SMS yemeza ko wishyuye"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
          <ListItemText
            primary="Send proof of payment / Ohereza icyemezo cy’uko wishyuye"
            secondary="Send the SMS or transaction ID to WhatsApp (+250 791 786 228) / Ohereza SMS cyangwa ID y’ operation kuri WhatsApp (+250 791 786 228)"
          />
        </ListItem>
      </List>
      <Box display="flex" alignItems="center" mt={2}>
        <Typography variant="body1" mr={1}>
          Payment Number / Nimero yo kwishyurira: {number}
        </Typography>
        <IconButton onClick={() => copyToClipboard(number)} size="small">
          <ContentCopy />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary" mt={2}>
        Note: Ensure you have sufficient balance before starting / Menya neza ko ufite amafaranga ahagije mbere yo gutangira.
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box textAlign="center" mb={4}>
          <Lock color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Activate Your Account / Injiza Konti Yawe
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Complete your account activation to access all features / Uzuza ibyo usabwa kugirango ukore konti yawe
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          To activate your account, pay a one-time fee of 7,000 RWF / Kugirango ukore konti yawe, shyura amafaranga y’ubwa mbere 7,000 RWF
        </Alert>

        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => setAirtelOpen(!airtelOpen)}
              endIcon={<ArrowForward />}
            >
              Pay with Airtel
            </Button>
            <Collapse in={airtelOpen}>
              <Card sx={{ mt: 2, bgcolor: 'grey.100' }}>
                <CardContent>
                  {paymentSteps('Airtel', '0781234567')}
                </CardContent>
              </Card>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => setMtnOpen(!mtnOpen)}
              endIcon={<ArrowForward />}
            >
              Pay with MTN
            </Button>
            <Collapse in={mtnOpen}>
              <Card sx={{ mt: 2, bgcolor: 'grey.100' }}>
                <CardContent>
                  {paymentSteps('MTN', '0789876543')}
                </CardContent>
              </Card>
            </Collapse>
          </Grid>
        </Grid>

        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Details / Ibisobanuro byo Kwishyura
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><Payment sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText
                  primary="Amount: 7,000 RWF"
                  secondary="Amafaranga: 7,000 RWF"
                  secondaryTypographyProps={{ color: 'inherit' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Phone sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText
                  primary="Airtel Pay Code: *182*8*1*348807*7000# / MTN MoMo Pay Code: *182*8*1*348807*7000#"
                  secondary="Izina: STATISTICS CO LTD (Airtel) / CLEMENTINE (MTN)"
                  secondaryTypographyProps={{ color: 'inherit' }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Box bgcolor="grey.100" p={3} borderRadius={1} mb={4} textAlign="center">
          <Typography variant="h6" gutterBottom>
            Need Help? / Ukeneye Ubafasha?
          </Typography>
          <Button
            variant="contained"
            startIcon={<WhatsApp />}
            href="https://wa.me/250791786228"
            target="_blank"
            sx={{ mb: 2 }}
          >
            Contact Support / Vugisha Ubafasha
          </Button>
          <Typography variant="body2" color="text.secondary">
            Click above to contact support and submit payment confirmation / Kanda hejuru kugirango uvugishe ubafasha hanyuma wohereze icyemezo cy’uko wishyuye.
          </Typography>
        </Box>

        <Alert severity="success">
          <Typography variant="body1">
            Your account will be activated automatically after payment verification.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Konti yawe izahita ikora nyuma yo kugenzura ko wishyuye.
          </Typography>
        </Alert>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
