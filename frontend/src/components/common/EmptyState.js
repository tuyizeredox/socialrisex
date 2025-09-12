import { Box, Typography, Button } from '@mui/material';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  icon: Icon,
  action,
  actionText
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      textAlign="center"
    >
      {Icon && <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />}
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {description}
      </Typography>
      {action && (
        <Button variant="contained" onClick={action}>
          {actionText}
        </Button>
      )}
    </Box>
  );
} 