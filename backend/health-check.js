// Simple health check script for Render deployment
console.log('Health check endpoint ready');

// Export the app for potential use in testing
import('./server.js').catch(err => {
  console.error('Failed to import server:', err);
  process.exit(1);
});