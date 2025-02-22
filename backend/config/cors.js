import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'https://socialrisex.onrender.com/',
  credentials: true,
  optionsSuccessStatus: 200
};

export default corsOptions;
