import { Component } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Error } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isLoading: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = async () => {
    this.setState({ isLoading: true });
    try {
      // Clear any cached data or states that might be causing the error
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      // Wait a brief moment before reloading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.location.reload();
    } catch (err) {
      console.error('Reset failed:', err);
      this.setState({ isLoading: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          textAlign="center"
          p={3}
          sx={{
            background: theme => theme.palette.background.default,
            color: theme => theme.palette.text.primary
          }}
        >
          <Error color="error" sx={{ fontSize: 80, mb: 3 }} />
          <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: 500 }}>
            {this.state.error?.message || 'An unexpected error occurred. Please try reloading the page.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            disabled={this.state.isLoading}
            sx={{
              minWidth: 200,
              py: 1.5,
              position: 'relative'
            }}
          >
            {this.state.isLoading ? (
              <>
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    marginLeft: '-12px'
                  }}
                />
                <span style={{ opacity: 0 }}>Reload Page</span>
              </>
            ) : (
              'Reload Page'
            )}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;