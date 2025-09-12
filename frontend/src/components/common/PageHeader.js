import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

export default function PageHeader({ title, breadcrumbs = [], action }) {
  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {action}
      </Box>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={crumb.path}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              underline="hover"
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
} 