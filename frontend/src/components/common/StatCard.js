import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  trendLabel,
  subtitle
}) {
  const colorMap = {
    primary: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
    secondary: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
    success: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    warning: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
    info: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
    error: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'
  };

  return (
    <Card
      sx={{
        background: colorMap[color] || colorMap.primary,
        color: 'white',
        borderRadius: 3,
        boxShadow: 3,
        transition: 'transform 0.3s ease',
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: 5
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        {Icon && (
          <Icon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        )}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1, opacity: 0.9 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {subtitle}
          </Typography>
        )}
        {trend !== undefined && (
          <Box mt={2}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 'bold'
              }}
            >
              {trend > 0 ? '+' : ''}{trend}% {trendLabel}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 