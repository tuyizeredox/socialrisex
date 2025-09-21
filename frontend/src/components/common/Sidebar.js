import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme
} from '@mui/material';
import { 
  Dashboard, 
  VideoLibrary, 
  People, 
  AccountBalance, 
  AdminPanelSettings, 
  Menu,
  Receipt,
  PhotoCamera,
  CloudUpload
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

const drawerWidth = 240;

export default function Sidebar({ isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const userMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/app/dashboard' },
    { text: 'Videos', icon: <VideoLibrary />, path: '/app/videos' },
    { text: 'Team', icon: <People />, path: '/app/referrals' },
    { text: 'Photo Share', icon: <PhotoCamera />, path: '/app/photo-share' },
    { text: 'Withdraw', icon: <AccountBalance />, path: '/app/withdraw' }
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Videos', icon: <VideoLibrary />, path: '/admin/videos' },
    { text: 'Photo Upload', icon: <CloudUpload />, path: '/admin/photos' },
    { text: 'Transaction Approvals', icon: <Receipt />, path: '/admin/transactions' },
    { text: 'Withdrawals', icon: <AccountBalance />, path: '/admin/withdrawals' }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        sx={{ display: { xs: 'block', sm: 'none' }, position: 'absolute', top: 10, left: 10 }}
      >
        <Menu />
      </IconButton>
      <Drawer
        variant={open ? "permanent" : "temporary"}
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            mt: 8,
            background: isAdmin 
              ? theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
                : 'linear-gradient(180deg, #4f46e5 0%, #6366f1 50%, #4f46e5 100%)'
              : theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #374151 0%, #1f2937 50%, #374151 100%)'
                : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
            color: isAdmin || theme.palette.mode === 'dark' ? 'white' : 'inherit',
            borderRight: `1px solid ${theme.palette.divider}`,
            '& .MuiListItemIcon-root': {
              color: isAdmin 
                ? theme.palette.mode === 'dark' ? '#818cf8' : '#c7d2fe'
                : theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b'
            },
            '& .MuiListItem-root.Mui-selected': {
              background: isAdmin
                ? theme.palette.mode === 'dark'
                  ? 'rgba(129, 140, 248, 0.15)'
                  : 'rgba(255, 255, 255, 0.15)'
                : theme.palette.mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(79, 70, 229, 0.08)',
              borderRadius: '0 25px 25px 0',
              margin: '4px 0',
              '&:hover': {
                background: isAdmin
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(129, 140, 248, 0.25)'
                    : 'rgba(255, 255, 255, 0.25)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'rgba(79, 70, 229, 0.12)',
              }
            },
            '& .MuiListItem-root:hover': {
              background: isAdmin
                ? theme.palette.mode === 'dark'
                  ? 'rgba(129, 140, 248, 0.1)'
                  : 'rgba(255, 255, 255, 0.1)'
                : theme.palette.mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.1)'
                  : 'rgba(79, 70, 229, 0.06)',
            }
          },
        }}
      >
        <Box sx={{ overflow: 'auto', textAlign: 'center', p: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold', 
              color: isAdmin || theme.palette.mode === 'dark' ? 'white' : 'primary.main',
              textShadow: isAdmin ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            SocialRise X
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: isAdmin || theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'text.secondary',
              textShadow: isAdmin ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {isAdmin ? 'Admin Control Panel' : 'Elevate your influence'}
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic', 
              color: isAdmin || theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.6)' 
                : 'text.secondary',
              textShadow: isAdmin ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {isAdmin ? '"Power to control and grow"' : '"Your success starts here!"'}
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
