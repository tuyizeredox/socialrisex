import cors from 'cors';

const corsOptions = {
  origin: 'https://socialrisex.onrender.com',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  exposedHeaders: ['Access-Control-Allow-Origin']
};

export default corsOptions;
