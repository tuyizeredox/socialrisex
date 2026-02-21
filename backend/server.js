import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import apiRoutes from './routes/api.js'; // Route imports
import errorHandler from './middleware/error.js'; // Error handler

// Import models to sync indexes
import User from './models/User.js';
import WatchedVideo from './models/WatchedVideo.js';
import PhotoShare from './models/PhotoShare.js';
import Video from './models/Video.js';
import Photo from './models/Photo.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, './.env') });

// Ensure NODE_ENV is set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Ensure MongoDB URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DB') || key.includes('URI')));
  process.exit(1);
} else {
  console.log('MONGODB_URI environment variable is set');
}

const app = express();

// Ensure indexes exist (creates missing indexes without recreating existing ones)
const ensureIndexes = async () => {
  try {
    console.log('Ensuring database indexes exist...');
    const models = [User, WatchedVideo, PhotoShare, Video, Photo];
    
    for (const model of models) {
      // createIndexes() only creates missing indexes, doesn't drop existing ones
      await model.createIndexes();
      console.log(`✓ Ensured indexes for ${model.modelName}`);
    }
    
    console.log('✓ All indexes verified');
  } catch (error) {
    console.error('Warning: Index verification had issues:', error.message);
    // Continue anyway - indexes might already exist
  }
};

// Optimized MongoDB Connection with Retry Logic
const connectDB = async () => {
  console.log('Starting MongoDB connection...');
  
  let retryAttempts = 5;
  let delay = 3000; // Delay in ms (3 seconds)

  const connect = async () => {
    try {
      console.log('Attempting to connect to MongoDB...');
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity,
        maxPoolSize: 10, // Maintain up to 10 socket connections
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Ensure indexes exist (only creates missing indexes on first run or when models change)
      // createIndexes() is fast and idempotent - it won't recreate existing indexes
      await ensureIndexes();
    } catch (error) {
      console.error('MongoDB connection error details:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      
      if (retryAttempts > 0) {
        console.error(`MongoDB connection failed. Retrying in ${delay / 1000} seconds... (${retryAttempts} attempts left)`);
        retryAttempts--;
        setTimeout(connect, delay);
      } else {
        console.error('MongoDB connection failed after multiple attempts:', error.message);
        process.exit(1);
      }
    }
  };
  connect();
};

connectDB();

// Middleware Setup
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://pesaboost.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL || 'https://pesaboost.onrender.com'], // Allow both local and production origins
  credentials: true, // Allow cookies or credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed HTTP methods
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Cache-Control',
    'X-Requested-With',
  ], // Allowed headers
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'], // Exposed headers
  preflightContinue: false,
  optionsSuccessStatus: 200, // Response status for preflight
};

app.use(cors(corsOptions)); // Apply CORS middleware
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(express.json()); // Parse JSON bodies

// Logger middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // In production, log basic info
  app.use(morgan('combined'));
}

// Add compression middleware (exclude images/videos from compression)
app.use(
  compression({
    filter: (req, res) => {
      const contentType = res.getHeader('Content-Type') || '';
      return !/image|video/.test(contentType); // Don't compress images/videos
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// Disable caching for API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Catch-all route to serve the frontend in production (must be last)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Only serve index.html for non-API and non-uploads routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    } else {
      res.status(404).json({ message: 'Resource not found' });
    }
  });
}

// Response caching for static content (1 hour cache)
app.use((req, res, next) => {
  // Only apply to GET requests that are NOT API or uploads
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  }
  next();
});

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server with a startup timeout
const PORT = process.env.PORT || 5000;

// Set a timeout for server startup to detect hanging connections
const startupTimeout = setTimeout(() => {
  console.error('Server startup timeout - possible database connection issue');
  process.exit(1);
}, 30000); // 30 second timeout

const server = app.listen(PORT, '0.0.0.0', () => {
  clearTimeout(startupTimeout);
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Add error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
  clearTimeout(startupTimeout);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  clearTimeout(startupTimeout);
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  clearTimeout(startupTimeout);
  server.close(() => {
    console.log('Process terminated');
  });
});
