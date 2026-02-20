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
    primary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    secondary: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    lime: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)'
  };

  return (
    <Card
      sx={{
        background: colorMap[color] || colorMap.primary,
        color: 'white',
        borderRadius: 5,
        border: 'none',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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