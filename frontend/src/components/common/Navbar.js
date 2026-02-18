import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ isAdmin, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: isAdmin ? 'warning.main' : 'primary.main'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: isMobile ? '1rem' : '1.25rem'
          }}
        >
          {isAdmin ? 'Admin Dashboard' : 'Pesa Boost'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isMobile && (
            <Typography variant="body2">
              {user?.fullName}
            </Typography>
          )}
          <Button
            onClick={handleLogout}
            size={isMobile ? 'small' : 'medium'}
            startIcon={<Logout />}
            sx={{
              background: theme => theme.palette.mode === 'dark'
                ? `linear-gradient(45deg, ${theme.palette.primary.dark}80, ${theme.palette.primary.main}90)`
                : `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}60)`,
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: theme => theme.palette.mode === 'dark' 
                ? `${theme.palette.primary.main}50`
                : theme.palette.divider,
              color: theme => theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.main,
              px: isMobile ? 1.5 : 2.5,
              py: 0.75,
              fontWeight: 500,
              letterSpacing: '0.5px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: theme => theme.palette.mode === 'dark'
                  ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                  : `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                transform: 'translateY(-2px)',
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? `0 4px 20px ${theme.palette.primary.main}40`
                  : `0 4px 15px ${theme.palette.primary.light}60`,
                borderColor: theme => theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : theme.palette.primary.light,
                color: theme => theme.palette.mode === 'dark'
                  ? theme.palette.common.white
                  : theme.palette.primary.dark
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: 'none'
              }
            }}
          >
            {isMobile ? '' : 'Logout'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}