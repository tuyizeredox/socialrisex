import { useState } from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar 
        isAdmin 
        onMenuClick={handleDrawerToggle}
      />
      <Sidebar 
        isAdmin 
        mobileOpen={mobileOpen} 
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 