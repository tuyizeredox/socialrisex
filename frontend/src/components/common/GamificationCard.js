import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  Whatshot,
  Diamond,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const GamificationCard = ({
  title,
  value,
  subtitle,
  progress = null,
  progressMax = 100,
  level = null,
  badge = null,
  icon: IconComponent = Star,
  gradient = null,
  glowing = false,
  streakCount = null,
  achievements = [],
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const iconMap = {
    trophy: EmojiEvents,
    star: Star,
    trending: TrendingUp,
    fire: Whatshot,
    diamond: Diamond,
  };

  const ActualIcon = typeof IconComponent === 'string' ? iconMap[IconComponent] || Star : IconComponent;
  
  // Dynamic gradient based on theme mode
  const defaultGradient = isDark 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)';
    
  const cardGradient = gradient || defaultGradient;

  return (
    <Card
      className="gamification-card"
      sx={{
        background: isDark 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 70%, #f5576c 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'visible',
        borderRadius: { xs: 3, sm: 4 },
        transform: glowing ? 'scale(1.02)' : 'scale(1)',
        boxShadow: glowing 
          ? '0 0 30px rgba(255, 215, 0, 0.5), 0 8px 32px rgba(0,0,0,0.3)'
          : isDark 
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(102, 126, 234, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(15px)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.05)',
          boxShadow: isDark 
            ? '0 16px 48px rgba(0,0,0,0.5)'
            : '0 16px 48px rgba(102, 126, 234, 0.4)',
        },
        '&::before': glowing ? {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: 'conic-gradient(from 0deg, #FFD700, #FF6F00, #4CAF50, #2196F3, #9C27B0, #FFD700)',
          borderRadius: 'inherit',
          zIndex: -1,
          filter: 'blur(1px)',
        } : {},
        ...props.sx
      }}
      {...props}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
        {/* Achievement Badges */}
        {achievements.length > 0 && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
            {achievements.slice(0, 3).map((achievement, index) => (
              <Chip
                key={index}
                label={achievement}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,215,0,0.2)',
                  color: '#FFD700',
                  fontSize: '0.7rem',
                  height: 20,
                  border: '1px solid rgba(255,215,0,0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              />
            ))}
          </Box>
        )}

        {/* Level Badge */}
        {level && (
          <Box sx={{ position: 'absolute', top: -8, left: -8 }}>
            <Avatar
              sx={{
                bgcolor: '#FFD700',
                color: '#000',
                width: 32,
                height: 32,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {level}
            </Avatar>
          </Box>
        )}

        {/* Streak Indicator */}
        {streakCount && (
          <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
            <Chip
              icon={<Whatshot sx={{ fontSize: '16px !important', color: '#FF6F00' }} />}
              label={`${streakCount} day streak`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,111,0,0.2)',
                color: '#FF6F00',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                border: '1px solid rgba(255,111,0,0.3)',
                backdropFilter: 'blur(10px)',
              }}
            />
          </Box>
        )}

        <Box sx={{ textAlign: 'center', pt: level || streakCount ? 2 : 0 }}>
          {/* Main Icon */}
          <ActualIcon 
            sx={{ 
              fontSize: { xs: 40, sm: 56 },
              mb: 2,
              color: 'white',
              filter: glowing ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }} 
          />

          {/* Main Value */}
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.5rem' },
              mb: 1,
              color: isDark ? '#FFD700' : '#1A1A1A',
              textShadow: isDark 
                ? '0 2px 8px rgba(0,0,0,0.5)' 
                : '0 2px 8px rgba(255,255,255,0.8)',
              background: isDark 
                ? (glowing 
                  ? 'linear-gradient(45deg, #FFD700, #FFF, #FFD700)'
                  : 'linear-gradient(45deg, #FFD700, #FFEAA7)')
                : (glowing 
                  ? 'linear-gradient(45deg, #1A1A1A, #4A4A4A, #1A1A1A)'
                  : 'linear-gradient(45deg, #1A1A1A, #4A4A4A)'),
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: isDark 
                ? 'drop-shadow(0 0 8px rgba(255,215,0,0.3))'
                : 'drop-shadow(0 0 8px rgba(26,26,26,0.2))',
            }}
          >
            {value}
          </Typography>

          {/* Title */}
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              color: isDark ? '#FFFFFF' : '#2D2D2D',
              textShadow: isDark 
                ? '0 2px 4px rgba(0,0,0,0.6)' 
                : '0 2px 4px rgba(255,255,255,0.8)',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mb: subtitle || progress !== null ? 1 : 0,
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: isDark ? '#E0E0E0' : '#4A4A4A',
                textShadow: isDark 
                  ? '0 1px 3px rgba(0,0,0,0.5)' 
                  : '0 1px 3px rgba(255,255,255,0.6)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                mb: progress !== null ? 2 : 0,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Progress Bar */}
          {progress !== null && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ 
                  color: isDark ? '#F0F0F0' : '#3A3A3A', 
                  textShadow: isDark 
                    ? '0 1px 3px rgba(0,0,0,0.6)' 
                    : '0 1px 3px rgba(255,255,255,0.8)', 
                  fontWeight: 600 
                }}>
                  Progress
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: isDark ? '#FFD700' : '#1A1A1A', 
                  textShadow: isDark 
                    ? '0 1px 3px rgba(0,0,0,0.6)' 
                    : '0 1px 3px rgba(255,255,255,0.8)', 
                  fontWeight: 600 
                }}>
                  {Math.round((progress / progressMax) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(progress / progressMax) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #FFD700, #FFEAA7, #FFD700)',
                    boxShadow: '0 0 8px rgba(255,215,0,0.5)',
                  },
                }}
              />
              <Typography variant="caption" sx={{ 
                color: isDark ? '#E0E0E0' : '#4A4A4A', 
                textShadow: isDark 
                  ? '0 1px 3px rgba(0,0,0,0.6)' 
                  : '0 1px 3px rgba(255,255,255,0.6)', 
                fontWeight: 500, 
                mt: 0.5, 
                display: 'block' 
              }}>
                {progress} / {progressMax}
              </Typography>
            </Box>
          )}

          {/* Badge */}
          {badge && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={badge}
                sx={{
                  bgcolor: 'rgba(255,215,0,0.2)',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255,215,0,0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              />
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Animated Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          background: `url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FFD700" fill-opacity="0.3"%3E%3Cpath d="M30 30l-10-10 10-10 10 10-10 10zM10 10l10 10-10 10-10-10 10-10zM50 10l10 10-10 10-10-10 10-10zM10 50l10 10-10 10-10-10 10-10zM50 50l10 10-10 10-10-10 10-10z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }}
      />
    </Card>
  );
};

export default GamificationCard;