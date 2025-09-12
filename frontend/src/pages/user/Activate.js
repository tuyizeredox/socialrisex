import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Snackbar,
  TextField,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Payment,
  Phone,
  CheckCircle,
  Lock,
  Security,
  AutoAwesome,
  AccountBalanceWallet,
  VerifiedUser,
  TrendingUp,
  Schedule,
  HourglassEmpty,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitTransactionId, checkPendingActivation } from '../../services/auth.service';

export default function Activate() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check for pending transaction on component mount
  useEffect(() => {
    const checkActivationStatus = async () => {
      try {
        console.log('🔍 Checking pending activation status...');
        const response = await checkPendingActivation();
        console.log('✅ Pending activation response:', response);
        if (response.data?.hasPending) {
          console.log('📝 Found pending transaction:', response.data.transaction);
          setPendingTransaction(response.data.transaction);
        } else {
          console.log('❌ No pending activation found');
        }
      } catch (error) {
        console.error('❌ Failed to check pending activation:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    console.log('🚀 Activate component mounted. User:', user);
    if (user && !user.isActive) {
      console.log('👤 User exists and is not active, checking activation status');
      checkActivationStatus();
    } else {
      console.log('⚠️ User is either not loaded or already active');
      setCheckingStatus(false);
    }
  }, [user]);

  if (user?.isActive) {
    navigate('/app/dashboard');
    return null;
  }

  const steps = [
    'Choose Payment Method',
    'Make Payment',
    'Enter Transaction ID'
  ];

  const paymentMethods = [
    {
      name: 'MTN MoMo',
      code: '*182*8*1*348807*8000#',
      recipient: 'CLEMENTINE',
      color: '#FFC107',
      icon: '💛'
    }
  ];

  const handleTransactionSubmit = async () => {
    if (!transactionId.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter your transaction ID',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await submitTransactionId({ transactionId });
      setPendingTransaction({
        transactionId: response.data.transactionId,
        submittedAt: response.data.submittedAt,
        status: response.data.status,
        amount: 8000
      });
      setSnackbar({
        open: true,
        message: 'Transaction ID submitted successfully! Your account activation is pending admin approval.',
        severity: 'success',
      });
      setTransactionId(''); // Clear the input
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit transaction ID. Please check the format and try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading while checking transaction status
  if (checkingStatus) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh' 
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Show pending transaction status if user has already submitted
  if (pendingTransaction) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(255, 152, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Schedule sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              ⏳ Activation Pending
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Your transaction ID has been submitted for admin approval
            </Typography>
            <Chip
              label="Status: Pending Admin Approval"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                px: 2,
                py: 1
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#FFF3E0', 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 3 
                  }}
                >
                  <HourglassEmpty sx={{ fontSize: 50, color: '#FF9800' }} />
                </Avatar>
                
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#FF9800' }}>
                  Transaction Submitted Successfully!
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We have received your transaction ID and our admin team is reviewing it. 
                  You will be notified once your account is activated.
                </Typography>
              </Box>

              <Card 
                sx={{ 
                  bgcolor: '#FFF8E1', 
                  border: '2px solid #FFB74D',
                  borderRadius: 3,
                  mb: 3
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#F57C00' }}>
                    📄 Transaction Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Transaction ID:
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#E65100' }}>
                        {pendingTransaction.transactionId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Submitted At:
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#E65100' }}>
                        {new Date(pendingTransaction.submittedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Amount:
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#E65100' }}>
                        8,000 RWF
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip 
                        label="PENDING" 
                        color="warning"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  ⏰ What happens next?
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • Our admin team will verify your transaction with MTN MoMo<br/>
                  • You will receive an email notification once approved<br/>
                  • Your account will be automatically activated<br/>
                  • Processing time: Usually within 2-24 hours
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => window.location.reload()}
                  sx={{
                    borderColor: '#FF9800',
                    color: '#FF9800',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#F57C00',
                      bgcolor: 'rgba(255, 152, 0, 0.04)'
                    }
                  }}
                >
                  <AccessTime sx={{ mr: 1 }} />
                  Check Status Again
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
                📞 Need Help?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                If you have any questions about your transaction or activation status, please contact our support team.
              </Typography>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  💼 Support Available 24/7
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  We're here to help! Contact us if your activation takes longer than expected.
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Lock sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            🌟 Activate Your Account
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Join thousands earning with Worldwide Earn!
          </Typography>
          <Chip
            label="One-time activation fee: 8,000 RWF"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              px: 2,
              py: 1
            }}
          />
        </Box>
      </Box>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={4}>
        {/* Payment Methods */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Payment sx={{ mr: 2, color: 'primary.main' }} />
              Payment Method - MTN MoMo Only
            </Typography>
            
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              {paymentMethods.map((method, index) => (
                <Box key={method.name} sx={{ maxWidth: 400, width: '100%' }}>
                  <Card
                    sx={{
                      border: `3px solid ${method.color}`,
                      borderRadius: 3,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF3C4 100%)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 15px 40px ${method.color}55`
                      }
                    }}
                    onClick={() => setActiveStep(1)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <Typography variant="h2" sx={{ mb: 2 }}>{method.icon}</Typography>
                      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#FF8F00' }}>
                        {method.name}
                      </Typography>
                      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                        Pay to: <strong>{method.recipient}</strong>
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: '#FFECB3',
                          border: '2px solid #FF8F00',
                          p: 3,
                          borderRadius: 2,
                          fontFamily: 'monospace',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#E65100',
                          mt: 2,
                          letterSpacing: 1
                        }}
                      >
                        {method.code}
                      </Box>
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                        Dial the code above to make payment
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Transaction ID Input */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                borderRadius: 3,
                p: 4,
                color: 'white',
                textAlign: 'center'
              }}
            >
              <AutoAwesome sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Submit Transaction ID for Admin Approval
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                After making payment, enter your MTN MoMo transaction ID below. Our admin will verify and approve your account.
              </Typography>
              
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <TextField
                  fullWidth
                  label="Transaction ID"
                  placeholder="e.g., MP240101.1234.B12345"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Security sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleTransactionSubmit}
                  disabled={loading}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit for Admin Approval'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Benefits Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
              🎯 Why Activate?
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { icon: <TrendingUp />, text: 'Start earning immediately' },
                { icon: <AccountBalanceWallet />, text: 'Access to all earning features' },
                { icon: <VerifiedUser />, text: 'Secure & verified account' },
                { icon: <AutoAwesome />, text: 'Instant activation' }
              ].map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, mr: 2 }}>
                    {benefit.icon}
                  </Avatar>
                  <Typography variant="body2">{benefit.text}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              🔒 Secure Payment Processing
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Your payment is verified automatically through our secure system. No manual verification needed!
            </Typography>
          </Alert>
        </Grid>
      </Grid>

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