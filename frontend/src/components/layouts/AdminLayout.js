import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
} from "@mui/material";
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
  Payment,  // This is the import for Payment
  TrendingUp,
  Favorite,
  EmojiEvents,
  CloudUpload,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import worldwideLogo from '../../assets/worldwide.png';

const drawerWidth = 260;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/app") {
      navigate("/app/dashboard", { replace: true });
    }
    setLoading(false);
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Videos', icon: <VideoLibrary />, path: '/admin/videos' },
    { text: 'Photo Upload', icon: <CloudUpload />, path: '/admin/photos' },
    { text: 'Transactions', icon: <AccountBalance />, path: '/admin/transactions' },
    { text: 'Multilevel Earnings', icon: <TrendingUp />, path: '/admin/multilevel-earnings' },
    { text: 'Bonus Management', icon: <Star />, path: '/admin/bonus' },
    { text: 'Withdrawals', icon: <Payment />, path: '/admin/withdrawals' },
    { text: 'Leaderboard', icon: <EmojiEvents />, path: '/admin/leaderboard' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawer = (
    <Box 
      sx={{ 
        height: "100%", 
        p: 2,
        background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={worldwideLogo} 
            alt="Worldwide Earn" 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '8px',
              marginRight: 8
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
            Worldwide Earn
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ display: { sm: "none" } }}>
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <Divider sx={{ my: 2 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname.startsWith(item.path)}
            sx={{
              my: 1,
              borderRadius: 3,
              backgroundColor: location.pathname.startsWith(item.path) ? "primary.light" : "transparent",
              border: location.pathname.startsWith(item.path) ? '2px solid' : '2px solid transparent',
              borderColor: location.pathname.startsWith(item.path) ? "primary.main" : "transparent",
              transition: 'all 0.3s ease',
              "&:hover": { 
                backgroundColor: "primary.main", 
                color: "white",
                transform: 'translateX(8px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname.startsWith(item.path) ? "primary.dark" : "text.secondary",
              transition: 'all 0.3s ease'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                fontWeight: location.pathname.startsWith(item.path) ? 700 : 600,
                '& .MuiListItemText-primary': {
                  fontSize: '0.95rem'
                }
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box 
        textAlign="center" 
        sx={{ 
          color: "text.secondary",
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: 3,
          p: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <img 
          src={worldwideLogo} 
          alt="Worldwide Earn" 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%',
            marginBottom: 8
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, fontStyle: 'italic' }}>
          "Earn Worldwide with Worldwide Earn!"
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
          <TrendingUp sx={{ fontSize: 20, color: 'primary.main', mr: 0.5 }} />
          <Favorite sx={{ fontSize: 20, color: 'secondary.main', ml: 0.5 }} />
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Button
        fullWidth
        variant="contained"
        color="error"
        startIcon={<Logout />}
        onClick={handleLogout}
        sx={{ 
          mt: 2,
          borderRadius: 3,
          fontWeight: 600,
          py: 1.2,
          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        Logout
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          backdropFilter: 'blur(10px)'
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
                display: { sm: "none" },
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src={worldwideLogo} 
              alt="Worldwide Earn" 
              style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '8px',
                marginRight: 12
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
              Worldwide Earn Admin
            </Typography>
          </Box>
          <IconButton 
            onClick={toggleTheme}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
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
              display: { xs: "block", sm: "none" }, 
              "& .MuiDrawer-paper": { 
                width: drawerWidth,
                borderRight: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              } 
            }}
          >
            {drawer}
          </Drawer>
          <Drawer 
            variant="permanent" 
            sx={{ 
              display: { xs: "none", sm: "block" }, 
              "& .MuiDrawer-paper": { 
                width: drawerWidth,
                borderRight: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              } 
            }} 
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
