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
  TrendingUp,
  Favorite,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const drawerWidth = 260;

const MainLayout = () => {
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

  const menuItems = user
    ? [
        { text: "Dashboard", icon: <Dashboard />, path: "/app" },
        { text: "Videos", icon: <VideoLibrary />, path: "/app/videos" },
        { text: "Team", icon: <People />, path: "/app/referrals" },
        { text: "Withdraw", icon: <AccountBalance />, path: "/app/withdraw" },
      ]
    : [];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawer = (
    <Box sx={{ height: "100%", p: 2 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>SocialRise X</Typography>
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
              borderRadius: 2,
              backgroundColor: location.pathname.startsWith(item.path) ? "primary.light" : "transparent",
              "&:hover": { backgroundColor: "primary.main", color: "white" },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname.startsWith(item.path) ? "primary.dark" : "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ fontWeight: 600 }} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box textAlign="center" sx={{ color: "text.secondary" }}>
        <TrendingUp fontSize="large" color="primary" />
        <Typography variant="body2" mt={1}>
          "Rise to success with SocialRise X!"
        </Typography>
        <Favorite fontSize="large" color="secondary" sx={{ mt: 1 }} />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Button
        fullWidth
        variant="contained"
        color="error"
        startIcon={<Logout />}
        onClick={handleLogout}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "background.paper", boxShadow: 1 }}>
        <Toolbar>
          {user && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: "primary.main" }}>SocialRise X</Typography>
          <IconButton onClick={toggleTheme}>
            {mode === "dark" ? <Brightness7 color="primary" /> : <Brightness4 color="secondary" />}
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
            sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
          <Drawer variant="permanent" sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth } }} open>
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

export default MainLayout;
