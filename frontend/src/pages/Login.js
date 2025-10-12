import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Paper,
  CircularProgress,
  Backdrop,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Chip,
  Fade,
  Slide,
  Divider,
  Avatar,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Lock, 
  Login as LoginIcon,
  TrendingUp,
  Security,
  Star,
  CheckCircle,
  Email,
  AutoAwesome,
  RocketLaunch,
  Diamond,
  FlashOn
} from '@mui/icons-material';
import api from '../utils/api';
import worldwideLogo from '../assets/worldwide.png';

export default function Login() {
  const [formData, setFormData] = useState({
    fullName: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      if (!formData.fullName.trim() || !formData.password.trim()) {
        throw new Error('Please fill in all fields');
      }
      // Trim whitespace from credentials
      const response = await login(formData.fullName.trim(), formData.password.trim());
      
      if (!response || !response.token) {
        throw new Error('Login failed - Invalid response from server');
      }

      // Get user details
      const userResponse = await api.get('/auth/me');
      
      if (userResponse.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' }
        }
      }}
    >
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `particleFloat ${Math.random() * 10 + 10}s linear infinite`,
            '@keyframes particleFloat': {
              '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: 0 },
              '10%': { opacity: 1 },
              '90%': { opacity: 1 },
              '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: 0 }
            }
          }}
        />
      ))}

      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(8px)'
        }}
        open={loading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: theme.palette.primary.main,
              mb: 2,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' }
              }
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Signing you in...
          </Typography>
        </Box>
      </Backdrop>
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            py: 4
          }}
        >
          <Fade in={mounted} timeout={1000}>
            <Card
              elevation={0}
              sx={{
                width: '100%',
                background: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 32px 64px rgba(0,0,0,0.4)'
                    : '0 32px 64px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c)',
                  backgroundSize: '300% 100%',
                  animation: 'gradientShift 3s ease infinite',
                  '@keyframes gradientShift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                  }
                }
              }}
            >
              <CardContent sx={{ p: 6 }}>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      mb: 3,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        right: -10,
                        bottom: -10,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: '50%',
                        opacity: 0.2,
                        animation: 'pulse 2s ease-in-out infinite',
                      }
                    }}
                  >
                    <Avatar
                      src={worldwideLogo}
                      alt="Worldwide Earn"
                      sx={{
                        width: 100,
                        height: 100,
                        border: `3px solid ${theme.palette.primary.main}`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                        position: 'relative',
                        zIndex: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }
                      }}
                    />
                  </Box>
                  
                  <Typography
                    component="h1"
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      letterSpacing: '-0.02em',
                      animation: 'fadeInUp 0.8s ease-out 0.2s both',
                      '@keyframes fadeInUp': {
                        '0%': { opacity: 0, transform: 'translateY(30px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    Welcome Back
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 400,
                      mb: 3,
                      animation: 'fadeInUp 0.8s ease-out 0.4s both',
                    }}
                  >
                    Sign in to continue your journey
                  </Typography>

                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
                    {[Diamond, RocketLaunch, FlashOn].map((Icon, index) => (
                      <Chip
                        key={index}
                        icon={<Icon sx={{ fontSize: 18 }} />}
                        label={['Premium', 'Fast', 'Secure'][index]}
                        size="small"
                        sx={{
                          background: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          animation: `fadeInUp 0.8s ease-out ${0.6 + index * 0.2}s both`,
                          '& .MuiChip-icon': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
          
                {error && (
                  <Slide direction="down" in={!!error} timeout={500}>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        background: alpha(theme.palette.error.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        '& .MuiAlert-icon': {
                          color: theme.palette.error.main,
                        },
                        animation: 'shake 0.5s ease-in-out',
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '25%': { transform: 'translateX(-5px)' },
                          '75%': { transform: 'translateX(5px)' }
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </Slide>
                )}

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    '& .MuiTextField-root': {
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: alpha(theme.palette.background.paper, 0.5),
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          }
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          }
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        '&.Mui-focused': {
                          color: theme.palette.primary.main,
                        }
                      }
                    }
                  }}
                >
                  <TextField
                    required
                    fullWidth
                    id="fullName"
                    label="Username"
                    name="fullName"
                    autoComplete="username"
                    autoFocus
                    value={formData.fullName}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      animation: 'fadeInUp 0.8s ease-out 0.6s both',
                    }}
                  />
                  
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      animation: 'fadeInUp 0.8s ease-out 0.8s both',
                    }}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={!loading && <LoginIcon />}
                    sx={{
                      mt: 4,
                      mb: 3,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: 'fadeInUp 0.8s ease-out 1s both',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.4)}`,
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                      '&:active': {
                        transform: 'translateY(-2px)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s',
                      },
                      '&:hover::before': {
                        left: '100%',
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress
                          size={24}
                          sx={{
                            position: 'absolute',
                            left: '50%',
                            marginLeft: '-12px',
                            color: 'white'
                          }}
                        />
                        <span style={{ visibility: 'hidden' }}>Signing In...</span>
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  <Box
                    sx={{
                      textAlign: 'center',
                      animation: 'fadeInUp 0.8s ease-out 1.2s both',
                      '& a': {
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          color: theme.palette.secondary.main,
                          textShadow: `0 0 8px ${alpha(theme.palette.secondary.main, 0.5)}`,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          width: 0,
                          height: '2px',
                          bottom: -2,
                          left: '50%',
                          background: theme.palette.secondary.main,
                          transition: 'all 0.3s ease',
                        },
                        '&:hover::after': {
                          width: '100%',
                          left: 0,
                        }
                      }
                    }}
                  >
                    <Link component={RouterLink} to="/register" variant="body1">
                      Don't have an account? <strong>Sign Up</strong>
                    </Link>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}
 
