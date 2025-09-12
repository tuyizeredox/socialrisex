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
  Divider,
  Tooltip,
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
  TrendingUp,
  Favorite,
  Wallet,
  SupportAgent,
  Share,
  ArrowForwardIos,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/app') {
      navigate('/app/dashboard', { replace: true });
    }
    setLoading(false);
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={40} color="primary" />
      </Box>
    );
  }

  const menuItems = user
    ? [
        { text: 'Dashboard', icon: <Dashboard />, path: '/app/dashboard' },
        { text: 'Videos', icon: <VideoLibrary />, path: '/app/videos' },
        { text: 'Team', icon: <People />, path: '/app/referrals' },
        { text: 'Wallet', icon: <Wallet />, path: '/app/wallet' },
        { text: 'Withdraw', icon: <AccountBalance />, path: '/app/withdraw' },
        { text: 'Refer & Earn', icon: <Share />, path: '/app/refer' },
        { text: 'Support', icon: <SupportAgent />, path: '/app/support' },
      ]
    : [];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false); // Auto-close on mobile
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        bgcolor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
      }}
    >
      <Box>
        <Toolbar sx={{ justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/worldwide.png" 
              alt="Worldwide Earn" 
              style={{ width: 40, height: 40, marginRight: 10, borderRadius: '8px' }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Worldwide Earn
            </Typography>
          </Box>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' }, color: 'primary.main' }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ my: 2, bgcolor: mode === 'dark' ? '#333' : '#e0e0e0' }} />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavClick(item.path)}
              sx={{
                my: 1,
                borderRadius: 2,
                backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                color: location.pathname === item.path ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  transform: 'translateX(5px)',
                  transition: 'all 0.2s ease-in-out',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'primary.main',
                  minWidth: '40px',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ fontWeight: location.pathname === item.path ? 700 : 500 }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <Divider sx={{ my: 2, bgcolor: mode === 'dark' ? '#333' : '#e0e0e0' }} />
        <Box textAlign="center" sx={{ color: 'text.secondary', py: 2 }}>
          <TrendingUp sx={{ fontSize: 30, color: 'primary.main' }} />
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            "Earn Worldwide with Worldwide Earn!"
          </Typography>
          <Star sx={{ fontSize: 30, color: 'secondary.main', mt: 1 }} />
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.2,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #d32f2f, #f44336)',
            '&:hover': {
              background: 'linear-gradient(45deg, #b71c1c, #d32f2f)',
              transform: 'scale(1.02)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: mode === 'dark' ? '#121212' : '#f5f7fa' }}>
      <AppBar
        position="fixed"
        sx={{
          background: mode === 'dark' ? '#1e1e1e' : 'linear-gradient(45deg, #1976d2, #42a5f5)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {user && (
            <Tooltip title="Open Menu" placement="right">
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 2,
                  display: { sm: 'none' },
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <MenuIcon />
                <ArrowForwardIos sx={{ fontSize: 14, ml: 1, opacity: mobileOpen ? 0 : 1 }} />
              </IconButton>
            </Tooltip>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/worldwide.png" 
              alt="Worldwide Earn" 
              style={{ width: 32, height: 32, marginRight: 12, borderRadius: '6px' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Worldwide Earn
            </Typography>
          </Box>
          <IconButton
            onClick={toggleTheme}
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {user && (
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                bgcolor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                borderRight: 'none',
                boxShadow: '2px 0 15px rgba(0,0,0,0.1)',
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                bgcolor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
                borderRight: 'none',
                boxShadow: '2px 0 15px rgba(0,0,0,0.1)',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: '100vh',
          bgcolor: mode === 'dark' ? '#121212' : '#f5f7fa',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
