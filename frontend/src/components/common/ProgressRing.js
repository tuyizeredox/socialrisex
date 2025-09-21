import React from 'react';
import { Box, Typography } from '@mui/material';

const ProgressRing = ({
  progress = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#4CAF50',
  backgroundColor = 'rgba(255,255,255,0.2)',
  showPercentage = true,
  centerContent = null,
  animated = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / max) * circumference;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          style={{
            transition: animated ? 'stroke-dashoffset 0.5s ease-in-out' : 'none',
            filter: 'drop-shadow(0 0 6px rgba(76, 175, 80, 0.4))',
          }}
        />
      </svg>
      
      {/* Center Content */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {centerContent || (
          showPercentage && (
            <>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="white"
                sx={{ fontSize: size < 100 ? '0.9rem' : '1.2rem' }}
              >
                {Math.round((progress / max) * 100)}%
              </Typography>
              {size >= 100 && (
                <Typography
                  variant="caption"
                  color="white"
                  sx={{ opacity: 0.8, fontSize: '0.7rem' }}
                >
                  Complete
                </Typography>
              )}
            </>
          )
        )}
      </Box>
    </Box>
  );
};

export default ProgressRing;