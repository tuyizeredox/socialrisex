import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Avatar,
  Chip,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  LocalFireDepartment,
  Diamond,
  WorkspacePremium,
  Group,
  Rocket,
  Bolt,
  PhotoCamera,
} from '@mui/icons-material';

const achievementConfig = {
  first_video: {
    icon: Star,
    color: '#FFD700',
    title: 'First Steps',
    description: 'Watched your first video',
    rarity: 'common'
  },
  streak_3: {
    icon: LocalFireDepartment,
    color: '#FF6F00',
    title: 'Getting Hot',
    description: '3-day watching streak',
    rarity: 'common'
  },
  streak_7: {
    icon: LocalFireDepartment,
    color: '#FF4500',
    title: 'Week Warrior',
    description: '7-day watching streak',
    rarity: 'rare'
  },
  referral_1: {
    icon: WorkspacePremium,
    color: '#4CAF50',
    title: 'Team Builder',
    description: 'Invited your first friend',
    rarity: 'common'
  },
  referral_10: {
    icon: Group,
    color: '#2196F3',
    title: 'Squad Leader',
    description: 'Built a team of 10',
    rarity: 'epic'
  },
  earnings_1000: {
    icon: Diamond,
    color: '#9C27B0',
    title: 'First Thousand',
    description: 'Earned 1,000 RWF',
    rarity: 'rare'
  },
  earnings_10000: {
    icon: Diamond,
    color: '#E91E63',
    title: 'High Roller',
    description: 'Earned 10,000 RWF',
    rarity: 'legendary'
  },
  level_up: {
    icon: Rocket,
    color: '#FF9800',
    title: 'Level Up!',
    description: 'Reached a new level',
    rarity: 'rare'
  },
  speed_demon: {
    icon: Bolt,
    color: '#FFEB3B',
    title: 'Speed Demon',
    description: 'Watched 10 videos in one day',
    rarity: 'epic'
  },
  first_photo: {
    icon: PhotoCamera,
    color: '#E91E63',
    title: 'Photo Starter',
    description: 'Shared your first photo',
    rarity: 'common'
  },
  photo_master: {
    icon: PhotoCamera,
    color: '#FF4081',
    title: 'Photo Master',
    description: 'Shared 10 photos',
    rarity: 'rare'
  },
};

const rarityColors = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF6F00',
};

const AchievementBadge = ({
  achievementId,
  size = 'medium',
  unlocked = false,
  showTitle = true,
  showTooltip = true,
  animated = true,
  onClick = null,
}) => {
  const achievement = achievementConfig[achievementId];
  
  if (!achievement) {
    return null;
  }

  const IconComponent = achievement.icon;
  const sizeMap = {
    small: { avatar: 32, icon: 16, titleSize: '0.75rem' },
    medium: { avatar: 48, icon: 24, titleSize: '0.875rem' },
    large: { avatar: 64, icon: 32, titleSize: '1rem' },
  };
  const sizing = sizeMap[size];

  const badgeContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'scale(1.05)',
        } : {},
      }}
      onClick={onClick}
    >
      <Avatar
        sx={{
          width: sizing.avatar,
          height: sizing.avatar,
          bgcolor: unlocked ? achievement.color : '#424242',
          color: 'white',
          border: `3px solid ${unlocked ? rarityColors[achievement.rarity] : '#616161'}`,
          boxShadow: unlocked 
            ? `0 0 20px ${achievement.color}40`
            : '0 0 10px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'visible',
          filter: unlocked ? 'none' : 'grayscale(100%)',
          animation: unlocked && animated ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': {
              boxShadow: `0 0 0 0 ${achievement.color}40`,
            },
            '70%': {
              boxShadow: `0 0 0 10px ${achievement.color}00`,
            },
            '100%': {
              boxShadow: `0 0 0 0 ${achievement.color}00`,
            },
          },
        }}
      >
        <IconComponent sx={{ fontSize: sizing.icon }} />
        
        {/* Rarity Border Effect */}
        {unlocked && (
          <Box
            sx={{
              position: 'absolute',
              top: -3,
              left: -3,
              right: -3,
              bottom: -3,
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${rarityColors[achievement.rarity]}, transparent, ${rarityColors[achievement.rarity]})`,
              animation: 'rotate 3s linear infinite',
              '@keyframes rotate': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />
        )}
        
        {/* Unlock Animation Sparkles */}
        {unlocked && animated && (
          <>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  bgcolor: '#FFD700',
                  borderRadius: '50%',
                  animation: `sparkle 1.5s ease-in-out infinite ${i * 0.5}s`,
                  '@keyframes sparkle': {
                    '0%, 100%': {
                      opacity: 0,
                      transform: 'scale(0) translate(0, 0)',
                    },
                    '50%': {
                      opacity: 1,
                      transform: `scale(1) translate(${15 + i * 10}px, ${-15 - i * 5}px)`,
                    },
                  },
                }}
              />
            ))}
          </>
        )}
      </Avatar>
      
      {showTitle && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{
              fontSize: sizing.titleSize,
              color: unlocked ? 'text.primary' : 'text.disabled',
              lineHeight: 1.2,
            }}
          >
            {achievement.title}
          </Typography>
          <Chip
            label={achievement.rarity.toUpperCase()}
            size="small"
            sx={{
              mt: 0.5,
              height: 16,
              fontSize: '0.6rem',
              bgcolor: unlocked ? rarityColors[achievement.rarity] : '#616161',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      )}
    </Box>
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {achievement.title}
            </Typography>
            <Typography variant="caption">
              {achievement.description}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
              Rarity: {achievement.rarity}
            </Typography>
            {!unlocked && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5, color: '#FF6F00' }}>
                🔒 Locked
              </Typography>
            )}
          </Box>
        }
        placement="top"
        arrow
      >
        {badgeContent}
      </Tooltip>
    );
  }

  return badgeContent;
};

export default AchievementBadge;