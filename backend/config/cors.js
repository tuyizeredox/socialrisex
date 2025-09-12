import cors from 'cors';

const corsOptions = {
  origin: 'https://primepessa.vercel.app', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Cache-Control',
    'X-Requested-With',
  ],
};

app.use(cors(corsOptions)); // Correctly apply CORS middleware
app.options('*', cors(corsOptions)); // Handle preflight requests globally
