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
  Dashboard,
  VideoLibrary,
  People,
  AccountBalance,
  Logout,
  Brightness4,
  Brightness7
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

  // Add early return for loading state
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
      <Toolbar />
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
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover': {
                transform: 'translateX(4px)',
                borderColor: theme => alpha(theme.palette.primary.main, 0.5),
                background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                '&::before': {
                  opacity: 1,
                },
              },
              '&.Mui-selected': {
                '&:hover': {
                  background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.primary.main, 0.08)})`,
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: location.pathname.startsWith(item.path) ? 'primary.main' : 'text.secondary',
                transition: 'color 0.3s ease-in-out',
                zIndex: 1,
                '& svg': {
                  fontSize: '1.3rem',
                  transition: 'transform 0.2s ease',
                },
                '&:hover svg': {
                  transform: 'scale(1.1)',
                }
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                zIndex: 1,
                '& .MuiListItemText-primary': {
                  fontSize: '0.95rem',
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 500,
                  color: location.pathname.startsWith(item.path) ? 'primary.main' : 'text.primary',
                  transition: 'all 0.3s ease-in-out',
                  letterSpacing: '0.3px'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: theme => `linear-gradient(${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.default, 0.9)}), ${theme.palette.background.gradient}`,
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Toolbar>
          {user && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: 'none' },
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 0.5,
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            SocialRise X
          </Typography>
          <IconButton
            onClick={toggleTheme}
            sx={{
              mr: 2,
              color: muiTheme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: `rotate(${mode === 'dark' ? '180deg' : '0deg'})`,
              '&:hover': {
                transform: `rotate(${mode === 'dark' ? '360deg' : '180deg'})`,
                color: 'primary.main'
              }
            }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Fade in={true}>
            {user ? (
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <Logout sx={{ mr: 1 }} /> Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  px: 3,
                  py: 1,
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid',
                  borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  textTransform: 'none',
                  boxShadow: theme => theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme => theme.palette.mode === 'dark' 
                      ? `0 6px 16px ${theme.palette.primary.main}40`
                      : `0 6px 16px ${theme.palette.primary.main}30`,
                    filter: 'brightness(110%)'
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    filter: 'brightness(90%)'
                  }
                }}
              >
                Login
              </Button>
            )}
          </Fade>
        </Toolbar>
      </AppBar>

      {user && (
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;