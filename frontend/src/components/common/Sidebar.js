import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material';
import {
  Dashboard,
  VideoLibrary,
  People,
  AccountBalance,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function Sidebar({ isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

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
    { text: 'Withdrawals', icon: <AccountBalance />, path: '/admin/withdrawals' }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
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
      </Box>
    </Drawer>
  );
} 