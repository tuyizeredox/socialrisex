import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  VideoLibrary,
  Payment,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Videos', icon: <VideoLibrary />, path: '/admin/videos' },
    { text: 'Withdrawals', icon: <Payment />, path: '/admin/withdrawals' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Admin Panel
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SocialRise X Admin
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
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
              px: 2.5,
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
            <Logout sx={{ mr: 1 }} /> Logout
          </Button>
        </Toolbar>
      </AppBar>

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