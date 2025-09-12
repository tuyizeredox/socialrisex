import { useState } from 'react';
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
  IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../utils/api'; // Update this line - change from '../api' to '../utils/api'

export default function Login() {
  const [formData, setFormData] = useState({
    fullName: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
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
    <Container maxWidth="sm">
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: theme => theme.palette.background.gradient,
          py: 8
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            width: '100%',
            background: theme => `${theme.palette.background.paper}dd`,
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img 
              src="/worldwide.png" 
              alt="Worldwide Earn" 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                marginBottom: 16,
                border: '3px solid',
                borderColor: 'primary.main',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}
            />
            <Typography
              component="h1"
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: theme =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome to Worldwide Earn
            </Typography>
          </Box>
          
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                animation: 'slideIn 0.5s ease-out',
                '@keyframes slideIn': {
                  from: { transform: 'translateY(-20px)', opacity: 0 },
                  to: { transform: 'translateY(0)', opacity: 1 }
                }
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              '& .MuiTextField-root': {
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)'
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                background: theme =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 6
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
                      marginLeft: '-12px'
                    }}
                  />
                  <span style={{ visibility: 'hidden' }}>Login</span>
                </>
              ) : (
                'Login'
              )}
            </Button>
            <Box
              sx={{
                textAlign: 'center',
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'secondary.main'
                  }
                }
              }}
            >
              <Link component={RouterLink} to="/register" variant="body1">
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
 
