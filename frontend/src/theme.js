import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({

  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#818cf8' : '#4f46e5',
      light: mode === 'dark' ? '#a5b4fc' : '#6366f1',
      dark: mode === 'dark' ? '#6366f1' : '#3730a3',
      contrastText: '#ffffff'
    },
    secondary: {
      main: mode === 'dark' ? '#fb7185' : '#e11d48',
      light: mode === 'dark' ? '#fda4af' : '#fb7185',
      dark: mode === 'dark' ? '#e11d48' : '#be123c',
      contrastText: '#ffffff'
    },
    lime: {
      main: '#a3e635',
      light: '#bef264',
      dark: '#84cc16',
      contrastText: '#000000'
    },
    // Enhanced gamification colors
    gamification: {
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#d97706',
      diamond: '#38bdf8',
      emerald: '#34d399',
      ruby: '#f43f5e',
      experience: '#818cf8',
      achievement: '#fb923c',
      streak: '#4ade80',
      bonus: '#f472b6'
    },
    success: {
      main: mode === 'dark' ? '#34d399' : '#10b981',
      light: mode === 'dark' ? '#6ee7b7' : '#34d399',
      dark: mode === 'dark' ? '#10b981' : '#059669',
      contrastText: '#ffffff'
    },
    warning: {
      main: mode === 'dark' ? '#fbbf24' : '#f59e0b',
      light: mode === 'dark' ? '#fcd34d' : '#fbbf24',
      dark: mode === 'dark' ? '#f59e0b' : '#d97706',
      contrastText: '#ffffff'
    },
    info: {
      main: mode === 'dark' ? '#60a5fa' : '#3b82f6',
      light: mode === 'dark' ? '#93c5fd' : '#60a5fa',
      dark: mode === 'dark' ? '#3b82f6' : '#2563eb',
      contrastText: '#ffffff'
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      gradient: mode === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%)',
      dashboard: mode === 'dark'
        ? 'linear-gradient(to right, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(to right, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
      secondary: mode === 'dark' ? '#94a3b8' : '#475569'
    },
    divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.08)'
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
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'dark' ? '#0f172a' : '#f8fafc',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? '#334155' : '#cbd5e1',
            borderRadius: '10px',
            '&:hover': {
              background: mode === 'dark' ? '#475569' : '#94a3b8',
            },
          },
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
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              : '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.1)'
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
          borderRadius: 20,
          border: mode === 'dark' 
            ? '1px solid rgba(148, 163, 184, 0.1)' 
            : '1px solid rgba(15, 23, 42, 0.05)',
          boxShadow: mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
          '@media (max-width: 600px)': {
            borderRadius: 16,
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'dark'
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderColor: mode === 'dark' 
              ? 'rgba(129, 140, 248, 0.5)' 
              : 'rgba(79, 70, 229, 0.2)',
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
              background: 'linear-gradient(90deg, #6366f1, #ec4899, #8b5cf6)',
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
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(148, 163, 184, 0.1)'
            : '1px solid rgba(15, 23, 42, 0.05)',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          boxShadow: 'none'
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