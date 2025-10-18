import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({

  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#6366f1' : '#4f46e5',
      light: mode === 'dark' ? '#818cf8' : '#6366f1',
      dark: mode === 'dark' ? '#4f46e5' : '#4338ca',
      contrastText: '#ffffff'
    },
    secondary: {
      main: mode === 'dark' ? '#ec4899' : '#db2777',
      light: mode === 'dark' ? '#f472b6' : '#ec4899',
      dark: mode === 'dark' ? '#db2777' : '#be185d',
      contrastText: '#ffffff'
    },
    // Enhanced gamification colors
    gamification: {
      gold: '#FFD700',
      silver: '#C0C0C0',
      bronze: '#CD7F32',
      diamond: '#B9F2FF',
      emerald: '#50C878',
      ruby: '#E0115F',
      experience: '#9C27B0',
      achievement: '#FF6F00',
      streak: '#4CAF50',
      bonus: '#FF9800'
    },
    success: {
      main: mode === 'dark' ? '#10b981' : '#059669',
      light: mode === 'dark' ? '#34d399' : '#10b981',
      dark: mode === 'dark' ? '#059669' : '#047857',
      contrastText: '#ffffff'
    },
    warning: {
      main: mode === 'dark' ? '#f59e0b' : '#d97706',
      light: mode === 'dark' ? '#fbbf24' : '#f59e0b',
      dark: mode === 'dark' ? '#d97706' : '#b45309',
      contrastText: '#ffffff'
    },
    info: {
      main: mode === 'dark' ? '#0ea5e9' : '#0284c7',
      light: mode === 'dark' ? '#38bdf8' : '#0ea5e9',
      dark: mode === 'dark' ? '#0284c7' : '#0369a1',
      contrastText: '#ffffff'
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      gradient: mode === 'dark'
        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
      dashboard: mode === 'dark'
        ? 'linear-gradient(to right, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(to right, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)'
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
      secondary: mode === 'dark' ? '#94a3b8' : '#475569'
    },
    divider: mode === 'dark' ? 'rgba(241, 245, 249, 0.12)' : 'rgba(15, 23, 42, 0.12)'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01562em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em'
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.0075em'
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px',
          '@media (max-width: 600px)': {
            fontSize: '14px',
          }
        },
        body: {
          fontSize: '1rem',
          lineHeight: 1.6,
          overflowX: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '*': {
          boxSizing: 'border-box',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          minHeight: '48px',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '@media (max-width: 600px)': {
            padding: '10px 16px',
            minHeight: '44px',
            fontSize: '0.875rem',
          },
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'dark' 
              ? '0 4px 12px rgba(99, 102, 241, 0.4)'
              : '0 4px 12px rgba(79, 70, 229, 0.2)'
          },
          '&.logout-button': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#ffffff',
            backdropFilter: 'blur(8px)',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(220, 38, 38, 0.5)',
            fontWeight: 600,
            letterSpacing: '0.5px',
            padding: '10px 20px',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark'
                ? '0 8px 16px rgba(239, 68, 68, 0.4)'
                : '0 8px 16px rgba(220, 38, 38, 0.3)',
              filter: 'brightness(110%)'
            },
            '&:active': {
              transform: 'translateY(0)',
              filter: 'brightness(90%)'
            }
          }
        },
        contained: {
          boxShadow: mode === 'dark'
            ? '0 2px 6px rgba(0, 0, 0, 0.3)'
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 6px 12px rgba(0, 0, 0, 0.4)'
              : '0 6px 12px rgba(0, 0, 0, 0.15)'
          }
        },
        outlined: {
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
          '&:hover': {
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        },
        text: {
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          '@media (max-width: 600px)': {
            borderRadius: 12,
            boxShadow: mode === 'dark'
              ? '0 4px 16px rgba(0,0,0,0.2)'
              : '0 2px 12px rgba(0,0,0,0.06)',
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: mode === 'dark'
              ? '0 16px 48px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.12)'
          },
          '&.gamification-card': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FFD700, #FF6F00, #4CAF50, #2196F3, #9C27B0)',
              zIndex: 1
            }
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.2s ease-in-out'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'linear-gradient(45deg, #1e293b 30%, #0f172a 90%)'
            : 'linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)',
          boxShadow: mode === 'dark'
            ? '0 4px 8px rgba(0,0,0,0.4)'
            : '0 4px 8px rgba(79,70,229,0.2)'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          color: mode === 'dark' ? '#f1f5f9' : '#0f172a',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            filter: mode === 'dark' ? 'brightness(1.2)' : 'brightness(0.8)'
          }
        }
      }
    }
  }
});

export default getTheme('light');