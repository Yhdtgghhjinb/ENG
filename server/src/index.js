require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const resourcesRouter = require('./routes/resources');
const vtuRouter      = require('./routes/vtu');
const adminRouter    = require('./routes/admin');
const subjectsRouter = require('./routes/subjects');
const examsRouter = require('./routes/exams');
const discussionsRouter = require('./routes/discussions');
const notificationsRouter = require('./routes/notifications');
const resourceRequestsRouter = require('./routes/resourceRequests');
const gamificationRouter = require('./routes/gamification');
const errorHandler   = require('./middleware/errorHandler');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/eng-resource-platform';

// Support both CLIENT_ORIGIN and CORS_ORIGIN env variables
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim());

connectDB(MONGODB_URI);

// CORS configuration to support multiple origins
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use('/api/resources', resourcesRouter);
app.use('/api/vtu',       vtuRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/subjects',  subjectsRouter);
app.use('/api/exams', examsRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/resource-requests', resourceRequestsRouter);
app.use('/api/gamification', gamificationRouter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
