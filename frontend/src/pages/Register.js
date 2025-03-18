import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    countryCode: '+250', // Default to Rwanda
    mobileNumber: '',
    password: '',
    referralCode: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isReferralLocked, setIsReferralLocked] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const countryCodes = [
    { code: '+250', label: 'Rwanda (+250)' },
    { code: '+254', label: 'Kenya (+254)' },
    { code: '+256', label: 'Uganda (+256)' },
    { code: '+255', label: 'Tanzania (+255)' },
  ];

  // Autofill referral code from URL and lock it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
      setIsReferralLocked(true);
    }
  }, [location.search]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Phone number is required';
    } else if (!/^\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 9-digit phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrors({ ...errors, [name]: '' }); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');
    try {
      const fullPhone = `${formData.countryCode}${formData.mobileNumber}`;
      await register({
        fullName: formData.fullName,
        mobileNumber: fullPhone,
        password: formData.password,
        referralCode: formData.referralCode || undefined,
      });
      navigate('/activate'); // Redirect to activation page
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': { transform: 'scale(1.02)' },
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Sign Up
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Join Prime Pessa in a few simple steps!
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={2} mb={2}>
            <FormControl fullWidth sx={{ maxWidth: '30%' }}>
              <InputLabel>Country</InputLabel>
              <Select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                label="Country"
              >
                {countryCodes.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Phone Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber || 'Enter 9 digits (e.g., 791786228)'}
              margin="normal"
              variant="outlined"
              inputProps={{ maxLength: 9 }}
            />
          </Box>

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Referral Code (Optional)"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleChange}
            disabled={isReferralLocked}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText={isReferralLocked ? 'Provided via referral link' : ''}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/terms" target="_blank" underline="hover">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" underline="hover">
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mb: 2 }}
          />
          {errors.acceptTerms && (
            <FormHelperText error sx={{ ml: 4 }}>
              {errors.acceptTerms}
            </FormHelperText>
          )}

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
