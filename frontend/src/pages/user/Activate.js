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
      code: '*182*8*1*000564*8000#',
      recipient: 'N AND M SHOP LTD',
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
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
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
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            borderRadius: { xs: 3, sm: 4 },
            p: { xs: 3, sm: 4 },
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
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                mx: 'auto',
                mb: 2,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Schedule sx={{ fontSize: { xs: 30, sm: 40 } }} />
            </Avatar>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              gutterBottom
              sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
            >
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: 3, sm: 4 },
          p: { xs: 3, sm: 4 },
          mb: { xs: 2, sm: 4 },
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
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              mx: 'auto',
              mb: 2,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Lock sx={{ fontSize: { xs: 30, sm: 40 } }} />
          </Avatar>
          <Typography 
            variant="h3" 
            fontWeight={800} 
            gutterBottom
            sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
          >
            🌟 Activate Your Account
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9, 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Join thousands earning with Worldwide Earn!
          </Typography>
          <Chip
            label="One-time activation fee: 8,000 RWF"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              px: 2,
              py: 1
            }}
          />
        </Box>
      </Box>

      {/* Mobile-First Step Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* STEP 1: Payment Instructions - Now prioritized */}
        <Grid item xs={12}>
          <Paper 
            elevation={8}
            sx={{ 
              p: { xs: 3, sm: 4 }, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF3C4 100%)',
              border: '3px solid #FFC107',
              boxShadow: '0 15px 40px rgba(255, 193, 7, 0.2)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  mb: 2, 
                  fontSize: { xs: '2.5rem', sm: '3rem' } 
                }}
              >
                💛
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight={800} 
                gutterBottom 
                sx={{ 
                  color: '#FF8F00',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                STEP 1: MTN MoMo Payment
              </Typography>
            </Box>

            {/* Payment Details Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#E3F2FD',
                border: '3px solid #2196F3',
                borderRadius: 3,
                mb: 3
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  gutterBottom 
                  sx={{ color: '#1976D2', textAlign: 'center' }}
                >
                  📱 Send Money To:
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight={800} 
                  sx={{ 
                    color: '#0D47A1', 
                    textAlign: 'center',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                  }}
                  gutterBottom
                >
                  N AND M SHOP LTD
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666', 
                    textAlign: 'center',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}
                >
                  (Use this exact recipient name!)
                </Typography>
              </CardContent>
            </Card>

            {/* USSD Code - Most Prominent */}
            <Box
              sx={{
                bgcolor: '#FFECB3',
                border: '4px solid #FF8F00',
                borderRadius: 3,
                p: { xs: 2, sm: 3 },
                mb: 3,
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(255, 143, 0, 0.3)'
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ color: '#E65100', mb: 2 }}>
                📞 Dial This Code:
              </Typography>
              <Box
                sx={{
                  fontFamily: 'monospace',
                  fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.6rem' },
                  fontWeight: 'bold',
                  color: '#E65100',
                  letterSpacing: 1,
                  bgcolor: 'white',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: '2px solid #FF8F00'
                }}
              >
                *182*8*1*000564*8000#
              </Box>
            </Box>
            
            {/* Quick Steps */}
            <Grid container spacing={2}>
              {[
                { step: '1', text: 'Dial the code above', icon: '📞' },
                { step: '2', text: 'Confirm: N AND M SHOP LTD', icon: '👤' },
                { step: '3', text: 'Amount: 8000 RWF', icon: '💰' },
                { step: '4', text: 'Enter your PIN', icon: '🔐' },
                { step: '5', text: 'Save Transaction ID from SMS', icon: '📱' }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#4CAF50', width: 32, height: 32, mr: 2 }}>
                          <Typography variant="caption" fontWeight="bold">
                            {item.step}
                          </Typography>
                        </Avatar>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                          {item.icon} {item.text}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* STEP 2: Transaction ID Input - Now more prominent */}
        <Grid item xs={12}>
          <Paper 
            elevation={12}
            sx={{ 
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(76, 175, 80, 0.4)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <AutoAwesome sx={{ fontSize: { xs: 40, sm: 56 }, mb: 2 }} />
              <Typography 
                variant="h4" 
                fontWeight={800} 
                gutterBottom
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
              >
                STEP 2: Enter Transaction ID
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Copy the transaction ID from your MTN MoMo SMS confirmation
              </Typography>
            </Box>

            {/* Enhanced Transaction ID Input */}
            <Box sx={{ maxWidth: { xs: '100%', sm: 500 }, mx: 'auto' }}>
              <Card sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#FFE082' }}>
                    💡 Transaction ID Examples:
                  </Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace', color: '#E8F5E8' }}>
                      • MP240315.1234.A56789
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace', color: '#E8F5E8' }}>
                      • MT240315.5678.B12345
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#E8F5E8' }}>
                      • MW240315.9012.C67890
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <TextField
                fullWidth
                label="Enter Transaction ID"
                placeholder="e.g., MP240101.1234.B12345"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 'bold',
                    height: { xs: 56, sm: 64 },
                    '& fieldset': { 
                      borderColor: 'rgba(255,255,255,0.4)',
                      borderWidth: 2
                    },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
                    '&.Mui-focused fieldset': { 
                      borderColor: 'white',
                      borderWidth: 3
                    }
                  },
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 600
                  },
                  '& .MuiInputBase-input': { 
                    color: 'white',
                    fontWeight: 'bold',
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.6)'
                    }
                  }
                }}
              />
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleTransactionSubmit}
                disabled={loading || !transactionId.trim()}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  borderRadius: 2,
                  height: { xs: 50, sm: 56 },
                  transition: 'all 0.3s ease',
                  '&:hover:not(:disabled)': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Submitting...
                  </Box>
                ) : (
                  <>
                    <CheckCircle sx={{ mr: 1 }} />
                    Submit for Instant Activation
                  </>
                )}
              </Button>
            </Box>

            {/* Benefits Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#E8F5E8' }}>
                ⚡ After Activation, You'll Get:
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {[
                  { icon: <TrendingUp />, text: 'Start Earning Immediately' },
                  { icon: <AccountBalanceWallet />, text: 'Full Access to Platform' },
                  { icon: <VerifiedUser />, text: 'Verified Account Status' }
                ].map((benefit, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'row', sm: 'column' },
                        alignItems: 'center',
                        textAlign: { xs: 'left', sm: 'center' },
                        bgcolor: 'rgba(255,255,255,0.1)',
                        p: 2,
                        borderRadius: 2,
                        height: '100%'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          width: 40, 
                          height: 40, 
                          mr: { xs: 2, sm: 0 },
                          mb: { xs: 0, sm: 1 }
                        }}
                      >
                        {benefit.icon}
                      </Avatar>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                      >
                        {benefit.text}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Help Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: 3 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                💬 Need Help?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • <strong>Can't find your transaction ID?</strong> Check your SMS messages after payment
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • <strong>Payment failed?</strong> Make sure you have sufficient MoMo balance
              </Typography>
              <Typography variant="body2">
                • <strong>Still having issues?</strong> Contact our 24/7 support team
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