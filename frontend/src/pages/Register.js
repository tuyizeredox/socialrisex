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
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Fade,
  Slide,
  Divider,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Email, 
  Phone, 
  Lock, 
  Flag, 
  CheckCircle,
  TrendingUp,
  People,
  Security,
  Star
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
// Logo is in public folder, referenced directly in JSX

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+250',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referrerName, setReferrerName] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const countryCodes = [
    { code: '+250', label: 'Rwanda (+250)', flag: '🇷🇼' },
    { code: '+254', label: 'Kenya (+254)', flag: '🇰🇪' },
    { code: '+256', label: 'Uganda (+256)', flag: '🇺🇬' },
    { code: '+255', label: 'Tanzania (+255)', flag: '🇹🇿' },
    { code: '+257', label: 'Burundi (+257)', flag: '🇧🇮' },
    { code: '+243', label: 'DR Congo (+243)', flag: '🇨🇩' },
    { code: '+236', label: 'Central African Republic (+236)', flag: '🇨🇫' },
    { code: '+235', label: 'Chad (+235)', flag: '🇹🇩' },
    { code: '+237', label: 'Cameroon (+237)', flag: '🇨🇲' },
    { code: '+241', label: 'Gabon (+241)', flag: '🇬🇦' },
    { code: '+242', label: 'Republic of Congo (+242)', flag: '🇨🇬' },
    { code: '+240', label: 'Equatorial Guinea (+240)', flag: '🇬🇶' },
    { code: '+239', label: 'São Tomé and Príncipe (+239)', flag: '🇸🇹' },
    { code: '+238', label: 'Cape Verde (+238)', flag: '🇨🇻' },
    { code: '+245', label: 'Guinea-Bissau (+245)', flag: '🇬🇼' },
    { code: '+220', label: 'Gambia (+220)', flag: '🇬🇲' },
    { code: '+221', label: 'Senegal (+221)', flag: '🇸🇳' },
    { code: '+222', label: 'Mauritania (+222)', flag: '🇲🇷' },
    { code: '+223', label: 'Mali (+223)', flag: '🇲🇱' },
    { code: '+224', label: 'Guinea (+224)', flag: '🇬🇳' },
    { code: '+225', label: 'Ivory Coast (+225)', flag: '🇨🇮' },
    { code: '+226', label: 'Burkina Faso (+226)', flag: '🇧🇫' },
    { code: '+227', label: 'Niger (+227)', flag: '🇳🇪' },
    { code: '+228', label: 'Togo (+228)', flag: '🇹🇬' },
    { code: '+229', label: 'Benin (+229)', flag: '🇧🇯' },
    { code: '+230', label: 'Mauritius (+230)', flag: '🇲🇺' },
    { code: '+231', label: 'Liberia (+231)', flag: '🇱🇷' },
    { code: '+232', label: 'Sierra Leone (+232)', flag: '🇸🇱' },
    { code: '+233', label: 'Ghana (+233)', flag: '🇬🇭' },
    { code: '+234', label: 'Nigeria (+234)', flag: '🇳🇬' },
    { code: '+249', label: 'Sudan (+249)', flag: '🇸🇩' },
    { code: '+251', label: 'Ethiopia (+251)', flag: '🇪🇹' },
    { code: '+252', label: 'Somalia (+252)', flag: '🇸🇴' },
    { code: '+253', label: 'Djibouti (+253)', flag: '🇩🇯' },
    { code: '+258', label: 'Mozambique (+258)', flag: '🇲🇿' },
    { code: '+260', label: 'Zambia (+260)', flag: '🇿🇲' },
    { code: '+261', label: 'Madagascar (+261)', flag: '🇲🇬' },
    { code: '+262', label: 'Réunion (+262)', flag: '🇷🇪' },
    { code: '+263', label: 'Zimbabwe (+263)', flag: '🇿🇼' },
    { code: '+264', label: 'Namibia (+264)', flag: '🇳🇦' },
    { code: '+265', label: 'Malawi (+265)', flag: '🇲🇼' },
    { code: '+266', label: 'Lesotho (+266)', flag: '🇱🇸' },
    { code: '+267', label: 'Botswana (+267)', flag: '🇧🇼' },
    { code: '+268', label: 'Swaziland (+268)', flag: '🇸🇿' },
    { code: '+269', label: 'Comoros (+269)', flag: '🇰🇲' },
    { code: '+290', label: 'Saint Helena (+290)', flag: '🇸🇭' },
    { code: '+291', label: 'Eritrea (+291)', flag: '🇪🇷' },
    { code: '+27', label: 'South Africa (+27)', flag: '🇿🇦' },
    { code: '+1', label: 'United States (+1)', flag: '🇺🇸' },
    { code: '+44', label: 'United Kingdom (+44)', flag: '🇬🇧' },
    { code: '+33', label: 'France (+33)', flag: '🇫🇷' },
    { code: '+49', label: 'Germany (+49)', flag: '🇩🇪' },
    { code: '+39', label: 'Italy (+39)', flag: '🇮🇹' },
    { code: '+34', label: 'Spain (+34)', flag: '🇪🇸' },
    { code: '+31', label: 'Netherlands (+31)', flag: '🇳🇱' },
    { code: '+32', label: 'Belgium (+32)', flag: '🇧🇪' },
    { code: '+41', label: 'Switzerland (+41)', flag: '🇨🇭' },
    { code: '+43', label: 'Austria (+43)', flag: '🇦🇹' },
    { code: '+45', label: 'Denmark (+45)', flag: '🇩🇰' },
    { code: '+46', label: 'Sweden (+46)', flag: '🇸🇪' },
    { code: '+47', label: 'Norway (+47)', flag: '🇳🇴' },
    { code: '+358', label: 'Finland (+358)', flag: '🇫🇮' },
    { code: '+86', label: 'China (+86)', flag: '🇨🇳' },
    { code: '+81', label: 'Japan (+81)', flag: '🇯🇵' },
    { code: '+82', label: 'South Korea (+82)', flag: '🇰🇷' },
    { code: '+91', label: 'India (+91)', flag: '🇮🇳' },
    { code: '+92', label: 'Pakistan (+92)', flag: '🇵🇰' },
    { code: '+93', label: 'Afghanistan (+93)', flag: '🇦🇫' },
    { code: '+94', label: 'Sri Lanka (+94)', flag: '🇱🇰' },
    { code: '+95', label: 'Myanmar (+95)', flag: '🇲🇲' },
    { code: '+880', label: 'Bangladesh (+880)', flag: '🇧🇩' },
    { code: '+977', label: 'Nepal (+977)', flag: '🇳🇵' },
    { code: '+975', label: 'Bhutan (+975)', flag: '🇧🇹' },
    { code: '+960', label: 'Maldives (+960)', flag: '🇲🇻' },
    { code: '+966', label: 'Saudi Arabia (+966)', flag: '🇸🇦' },
    { code: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
    { code: '+974', label: 'Qatar (+974)', flag: '🇶🇦' },
    { code: '+973', label: 'Bahrain (+973)', flag: '🇧🇭' },
    { code: '+965', label: 'Kuwait (+965)', flag: '🇰🇼' },
    { code: '+968', label: 'Oman (+968)', flag: '🇴🇲' },
    { code: '+962', label: 'Jordan (+962)', flag: '🇯🇴' },
    { code: '+961', label: 'Lebanon (+961)', flag: '🇱🇧' },
    { code: '+963', label: 'Syria (+963)', flag: '🇸🇾' },
    { code: '+964', label: 'Iraq (+964)', flag: '🇮🇶' },
    { code: '+98', label: 'Iran (+98)', flag: '🇮🇷' },
    { code: '+90', label: 'Turkey (+90)', flag: '🇹🇷' },
    { code: '+20', label: 'Egypt (+20)', flag: '🇪🇬' },
    { code: '+212', label: 'Morocco (+212)', flag: '🇲🇦' },
    { code: '+213', label: 'Algeria (+213)', flag: '🇩🇿' },
    { code: '+216', label: 'Tunisia (+216)', flag: '🇹🇳' },
    { code: '+218', label: 'Libya (+218)', flag: '🇱🇾' },
    { code: '+55', label: 'Brazil (+55)', flag: '🇧🇷' },
    { code: '+54', label: 'Argentina (+54)', flag: '🇦🇷' },
    { code: '+56', label: 'Chile (+56)', flag: '🇨🇱' },
    { code: '+57', label: 'Colombia (+57)', flag: '🇨🇴' },
    { code: '+51', label: 'Peru (+51)', flag: '🇵🇪' },
    { code: '+58', label: 'Venezuela (+58)', flag: '🇻🇪' },
    { code: '+52', label: 'Mexico (+52)', flag: '🇲🇽' },
    { code: '+1', label: 'Canada (+1)', flag: '🇨🇦' },
    { code: '+61', label: 'Australia (+61)', flag: '🇦🇺' },
    { code: '+64', label: 'New Zealand (+64)', flag: '🇳🇿' },
  ];

  const fetchReferrerName = async (referralCode) => {
    try {
      // Since we don't have a specific API to get referrer info by code,
      // we'll use the referral code as the display name
      // In a real-world scenario, you might want to add a backend endpoint for this
      setReferrerName(referralCode);
    } catch (error) {
      console.log('Could not fetch referrer name:', error);
      setReferrerName(referralCode);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
      setIsReferralLocked(true);
      fetchReferrerName(refCode);
    }
  }, [location.search]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    setErrors({ ...errors, [name]: '' });
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
        email: formData.email,
        mobileNumber: fullPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        referralCode: formData.referralCode || undefined,
      });
      navigate('/activate');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', gap: 4, alignItems: 'center' }}>
          {/* Left Side - Benefits */}
          <Slide direction="right" in={true} timeout={800}>
            <Card
              sx={{
                flex: 1,
                maxWidth: 400,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
                p: 3,
                color: 'white',
                display: { xs: 'none', md: 'block' },
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" mb={3} sx={{ textAlign: 'center' }}>
                  Why Join Us?
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp sx={{ fontSize: 32, color: '#4CAF50' }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">Earn Money</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Watch videos, share photos, and earn RWF
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Security sx={{ fontSize: 32, color: '#FF9800' }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">Secure Platform</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Your data is safe and secure
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Star sx={{ fontSize: 32, color: '#9C27B0' }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">Global Community</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Join users from around the world
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <People sx={{ fontSize: 32, color: '#2196F3' }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">Easy to Use</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Simple and intuitive platform
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>

          {/* Right Side - Registration Form */}
          <Fade in={true} timeout={1000}>
            <Paper
              sx={{
                flex: 1,
                maxWidth: 500,
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)' 
                },
              }}
            >
              <Box textAlign="center" mb={4}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    mb: 3,
                  }}
                >
                  <img 
                    src={process.env.PUBLIC_URL + '/logo.png'}
                    alt="Pesa Boost"
                    style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      border: '3px solid #667eea',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                        '100%': { transform: 'scale(1)', opacity: 1 },
                      },
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
                  </Box>
                </Box>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Join Pesa Boost
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                  Start earning worldwide today!
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<TrendingUp />} 
                    label="Earn Money" 
                    size="small" 
                    sx={{ bgcolor: '#E8F5E8', color: '#2E7D32' }} 
                  />
                  <Chip 
                    icon={<People />} 
                    label="Global Community" 
                    size="small" 
                    sx={{ bgcolor: '#E3F2FD', color: '#1565C0' }} 
                  />
                  <Chip 
                    icon={<Security />} 
                    label="Secure" 
                    size="small" 
                    sx={{ bgcolor: '#FFF3E0', color: '#E65100' }} 
                  />
                </Box>
              </Box>

        {serverError && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              bgcolor: '#ffebee',
              color: '#c62828',
              '& .MuiAlert-icon': { color: '#c62828' },
            }}
          >
            {serverError}
          </Alert>
        )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': { borderColor: '#667eea' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': { borderColor: '#667eea' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    },
                  }}
                />

                <Box display="flex" gap={2} mb={3}>
                  <FormControl fullWidth sx={{ maxWidth: '35%' }}>
                    <InputLabel sx={{ color: 'text.secondary' }}>Country</InputLabel>
                    <Select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      label="Country"
                      startAdornment={
                        <InputAdornment position="start">
                          <Flag sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 3,
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                      }}
                    >
                      {countryCodes.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: '18px' }}>{country.flag}</span>
                            {country.label}
                          </Box>
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
                    variant="outlined"
                    inputProps={{ maxLength: 9 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': { borderColor: '#667eea' },
                        '&.Mui-focused fieldset': { borderColor: '#667eea' },
                      },
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': { borderColor: '#667eea' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowConfirmPassword} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': { borderColor: '#667eea' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    },
                  }}
                />

                {/* Hidden referral field for background processing */}
                <input
                  type="hidden"
                  name="referralCode"
                  value={formData.referralCode}
                />

                {/* Show referrer info if present */}
                {referrerName && (
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                      border: '1px solid #2196F3',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
                    }}
                  >
                    <Person sx={{ color: '#1976D2' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#1976D2',
                        fontWeight: 'medium'
                      }}
                    >
                      Referred by: <strong>{referrerName}</strong>
                    </Typography>
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      sx={{ 
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                        color: '#667eea',
                        '&.Mui-checked': {
                          color: '#667eea',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I agree to the{' '}
                      <Link href="/terms" target="_blank" underline="hover" sx={{ color: '#667eea', fontWeight: 'medium' }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" target="_blank" underline="hover" sx={{ color: '#667eea', fontWeight: 'medium' }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 3 }}
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
                    py: 1.8,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.6)',
                    },
                    '&:disabled': {
                      background: 'rgba(102, 126, 234, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={24} color="inherit" />
                      <Typography>Creating Account...</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 20 }} />
                      Create Account
                    </Box>
                  )}
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    underline="hover"
                    sx={{ 
                      color: '#667eea', 
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#5a6fd8',
                      },
                    }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}
