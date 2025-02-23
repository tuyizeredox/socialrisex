import cors from 'cors';

const corsOptions = {
  origin: 'https://socialrisex.onrender.com',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  preflightContinue: false
};

export default corsOptions;
