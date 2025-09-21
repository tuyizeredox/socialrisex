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
  PhotoCamera,
  SupportAgent,
  Share,
  ArrowForwardIos,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import worldwideLogo from '../../assets/worldwide.png';

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
        { text: 'Photo Share', icon: <PhotoCamera />, path: '/app/photo-share' },
        { text: 'Withdraw', icon: <AccountBalance />, path: '/app/withdraw' },
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
        background: mode === 'dark' 
          ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
          : 'linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: mode === 'dark' 
          ? 'inset 0 0 20px rgba(0,0,0,0.3), 0 0 30px rgba(103, 126, 234, 0.1)'
          : 'inset 0 0 20px rgba(255,255,255,0.2), 0 0 30px rgba(103, 126, 234, 0.2)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: mode === 'dark'
            ? 'radial-gradient(circle at 50% 50%, rgba(103, 126, 234, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 1,
        }
      }}
    >
      {/* Header Section */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between', mb: 1, px: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={worldwideLogo} 
              alt="Worldwide Earn" 
              style={{ width: 40, height: 40, marginRight: 10, borderRadius: '8px' }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: mode === 'dark'
                  ? 'linear-gradient(45deg, #667eea, #764ba2)'
                  : 'linear-gradient(45deg, #ffffff, #f8fafc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: mode === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Worldwide Earn
            </Typography>
          </Box>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ 
              display: { sm: 'none' }, 
              color: mode === 'dark' ? '#667eea' : 'white',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ 
          mb: 2, 
          bgcolor: mode === 'dark' 
            ? 'rgba(102, 126, 234, 0.3)' 
            : 'rgba(255, 255, 255, 0.3)',
          height: 1,
          boxShadow: mode === 'dark' 
            ? '0 1px 2px rgba(102, 126, 234, 0.2)' 
            : '0 1px 2px rgba(255, 255, 255, 0.5)'
        }} />
      </Box>

      {/* Navigation Section */}
      <Box sx={{ position: 'relative', zIndex: 2, flex: 1 }}>
        <List sx={{ py: 0 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavClick(item.path)}
              sx={{
                my: 1,
                borderRadius: 2,
                backgroundColor: location.pathname === item.path 
                  ? mode === 'dark' 
                    ? 'rgba(102, 126, 234, 0.8)' 
                    : 'rgba(255, 255, 255, 0.2)'
                  : 'transparent',
                color: location.pathname === item.path 
                  ? 'white' 
                  : mode === 'dark' ? '#e1e5e9' : '#ffffff',
                backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                boxShadow: location.pathname === item.path 
                  ? mode === 'dark' 
                    ? '0 4px 8px rgba(102, 126, 234, 0.3)' 
                    : '0 4px 8px rgba(255, 255, 255, 0.3)'
                  : 'none',
                '&:hover': {
                  backgroundColor: mode === 'dark' 
                    ? 'rgba(102, 126, 234, 0.6)' 
                    : 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  transform: 'translateX(5px)',
                  transition: 'all 0.2s ease-in-out',
                  backdropFilter: 'blur(10px)',
                  boxShadow: mode === 'dark' 
                    ? '0 6px 12px rgba(102, 126, 234, 0.4)' 
                    : '0 6px 12px rgba(255, 255, 255, 0.4)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? 'white' 
                    : mode === 'dark' 
                      ? '#667eea' 
                      : '#ffffff',
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

      {/* Footer Section */}
      <Box sx={{ position: 'relative', zIndex: 2, mt: 'auto' }}>
        <Divider sx={{ 
          my: 2, 
          bgcolor: mode === 'dark' 
            ? 'rgba(102, 126, 234, 0.3)' 
            : 'rgba(255, 255, 255, 0.3)',
          height: 1,
          boxShadow: mode === 'dark' 
            ? '0 1px 2px rgba(102, 126, 234, 0.2)' 
            : '0 1px 2px rgba(255, 255, 255, 0.5)'
        }} />
        <Box textAlign="center" sx={{ 
          color: mode === 'dark' ? '#e1e5e9' : 'rgba(255, 255, 255, 0.9)', 
          py: 2 
        }}>
          <TrendingUp sx={{ 
            fontSize: 30, 
            color: mode === 'dark' ? '#667eea' : '#ffffff',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }} />
          <Typography variant="body2" sx={{ 
            mt: 1, 
            fontStyle: 'italic',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            "Earn Worldwide with Worldwide Earn!"
          </Typography>
          <Star sx={{ 
            fontSize: 30, 
            color: mode === 'dark' ? '#f093fb' : '#ffffff', 
            mt: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }} />
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
            background: mode === 'dark' 
              ? 'linear-gradient(45deg, #d32f2f, #f44336)'
              : 'linear-gradient(45deg, rgba(211, 47, 47, 0.9), rgba(244, 67, 54, 0.9))',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: mode === 'dark' 
              ? '0 4px 8px rgba(211, 47, 47, 0.3)'
              : '0 4px 8px rgba(255, 255, 255, 0.3)',
            '&:hover': {
              background: mode === 'dark'
                ? 'linear-gradient(45deg, #b71c1c, #d32f2f)'
                : 'linear-gradient(45deg, rgba(183, 28, 28, 0.9), rgba(211, 47, 47, 0.9))',
              transform: 'scale(1.02)',
              boxShadow: mode === 'dark' 
                ? '0 6px 12px rgba(211, 47, 47, 0.4)'
                : '0 6px 12px rgba(255, 255, 255, 0.4)',
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
              src={worldwideLogo} 
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
