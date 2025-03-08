import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cache from 'memory-cache'; // In-memory caching
import apiRoutes from './routes/api.js'; // Route imports
import errorHandler from './middleware/error.js'; // Error handler
import corsOptions from './config/cors.js'; // CORS configuration

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, './.env') });

// Ensure MongoDB URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const app = express();

// Optimized MongoDB Connection with Retry Logic
const connectDB = async () => {
  let retryAttempts = 5;
  let delay = 3000; // Delay in ms (3 seconds)
  
  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      if (retryAttempts > 0) {
        console.error(`MongoDB connection failed. Retrying in ${delay / 1000} seconds...`);
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
app.use(cors(corsOptions)); // Handle CORS
app.use(express.json()); // Parse JSON bodies

// Logger middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Catch-all route to serve the frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// API Routes
app.use('/api', apiRoutes);

// Caching for API GET requests (cached for 5 minutes)
app.use((req, res, next) => {
  const key = `__express__${req.originalUrl}` || req.url;
  const cachedBody = cache.get(key);

  if (cachedBody && req.method === 'GET') {
    return res.send(cachedBody);
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      if (req.method === 'GET') {
        cache.put(key, body, 300000); // Cache for 5 minutes
      }
      res.sendResponse(body);
    };
    next();
  }
});

// Response caching for static content (1 hour cache)
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  }
  next();
});

// Error handling middleware
app.use(errorHandler);

// CORS and other headers handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://socialrisex.vercel.app');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
