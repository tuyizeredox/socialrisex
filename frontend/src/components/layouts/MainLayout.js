import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Fade,
  useTheme as useMuiTheme,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard,
  VideoLibrary,
  People,
  AccountBalance,
  Logout,
  Brightness4,
  Brightness7,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();

  useEffect(() => {
    if (location.pathname === '/app') {
      navigate('/app/dashboard', { replace: true });
    }
    setLoading(false);
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const menuItems = user ? [
    { text: 'Dashboard', icon: <Dashboard />, path: '/app' },
    { text: 'Videos', icon: <VideoLibrary />, path: '/app/videos' },
    { text: 'Team ', icon: <People />, path: '/app/referrals' },
    { text: 'Withdraw', icon: <AccountBalance />, path: '/app/withdraw' },
  ] : [];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box
      sx={{
        background: theme => `linear-gradient(${alpha(theme.palette.background.default, 0.97)}, ${alpha(theme.palette.background.default, 0.97)}), ${theme.palette.background.gradient}`,
        height: '100%',
        borderRight: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        <IconButton onClick={handleDrawerToggle} sx={{ marginLeft: 'auto', color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            component="button"
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname.startsWith(item.path)}
            sx={{
              my: 1.5,
              borderRadius: 2,
              padding: '12px 16px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: theme => location.pathname.startsWith(item.path)
                ? `${alpha(theme.palette.primary.main, 0.3)}`
                : 'transparent',
              background: theme => location.pathname.startsWith(item.path)
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.primary.main, 0.05)})`
                : 'transparent',
              '&:hover': {
                transform: 'translateX(4px)',
                borderColor: theme => alpha(theme.palette.primary.main, 0.5),
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Box display="flex" justifyContent="center" mt={4}>
        <Star sx={{ fontSize: 40, color: 'gold' }} />
        <TrendingUp sx={{ fontSize: 40, color: 'green' }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ background: theme => theme.palette.background.default }}>
        <Toolbar>
          {user && (
            <IconButton onClick={handleDrawerToggle} sx={{ display: { sm: 'none' } }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>SocialRise X</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        {drawer}
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' } }}>
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;
