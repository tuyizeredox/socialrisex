import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import { 
  Dashboard, 
  VideoLibrary, 
  People, 
  AccountBalance, 
  AdminPanelSettings, 
  Menu,
  Receipt
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

const drawerWidth = 240;

export default function Sidebar({ isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const userMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/app/dashboard' },
    { text: 'Videos', icon: <VideoLibrary />, path: '/app/videos' },
    { text: 'Team', icon: <People />, path: '/app/referrals' },
    { text: 'Withdraw', icon: <AccountBalance />, path: '/app/withdraw' }
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Videos', icon: <VideoLibrary />, path: '/admin/videos' },
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
          },
        }}
      >
        <Box sx={{ overflow: 'auto', textAlign: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            SocialRise X
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Elevate your influence
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
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            "Your success starts here!"
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
