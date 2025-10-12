import { Box, Typography, Breadcrumbs, Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

export default function PageHeader({ title, breadcrumbs = [], action, subtitle, icon: Icon }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box mb={isMobile ? 2 : 4}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={isMobile ? "flex-start" : "center"} 
        mb={1}
        flexDirection={isMobile ? "column" : "row"}
        gap={isMobile ? 1 : 0}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {Icon && <Icon color="primary" />}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Box>
        {action && (
          <Box sx={{ width: isMobile ? '100%' : 'auto' }}>
            {action}
          </Box>
        )}
      </Box>
      
      {subtitle && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: breadcrumbs.length > 0 ? 1 : 0 }}
        >
          {subtitle}
        </Typography>
      )}
      
      {breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />}
          sx={{ 
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'wrap'
            }
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={crumb.path}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              underline="hover"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
} 