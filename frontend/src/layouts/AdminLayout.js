import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
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
          mt: { xs: 6, sm: 7, md: 8 },
          minHeight: 'calc(100vh - 64px)',
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto',
          overflowX: 'auto',
          paddingBottom: 2,
          ...(isMobile && {
            marginLeft: 0,
            width: '100vw',
            minHeight: 'calc(100vh - 56px)',
            mt: 7
          })
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 