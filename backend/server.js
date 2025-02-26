import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
// Route imports
import apiRoutes from './routes/api.js';

// Middleware imports
import errorHandler from './middleware/error.js';
import corsOptions from './config/cors.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars with absolute path
dotenv.config({ path: path.join(__dirname, './.env') });

// Verify MongoDB URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const app = express();

// Connect to MongoDB with error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Call connect function
connectDB();

// Middleware
// Move CORS middleware to the top, before other middleware
app.use(cors(corsOptions));
app.use(express.json());

// Remove the custom CORS middleware that was added before

// Logger middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiRoutes); // Keep existing API routes

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  // Fix ESM __filename and __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Rest of your server code
  const app = express();
  
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Error handling middleware
app.use(errorHandler);

// Handle unhandled routes
// Add this before your routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://socialrisex.vercel.app');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control'
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Add compression middleware
import cache from 'memory-cache';

// Remove the stray 'i' character that was causing the error

// Add compression middleware
app.use(compression());

// Add caching middleware
app.use((req, res, next) => {
  const key = `__express__${req.originalUrl}` || req.url;
  const cachedBody = cache.get(key);

  if (cachedBody && req.method === 'GET') {
    return res.send(cachedBody);
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      if (req.method === 'GET') {
        cache.put(key, body, 60000); // Cache for 1 minute
      }
      res.sendResponse(body);
    };
    next();
  }
});

// Add response caching
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  }
  next();
});

// Enable keep-alive connections
app.use((req, res, next) => {
  res.set('Connection', 'keep-alive');
  next();
});
