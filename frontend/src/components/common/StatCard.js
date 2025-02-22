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
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Icon
              sx={{
                fontSize: 40,
                color: `${color}.main`,
                opacity: 0.7
              }}
            />
          )}
        </Box>
        {trend !== undefined && (
          <Box mt={2}>
            <Typography
              variant="body2"
              color={trend >= 0 ? 'success.main' : 'error.main'}
              component="span"
            >
              {trend > 0 ? '+' : ''}{trend}% {trendLabel}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 