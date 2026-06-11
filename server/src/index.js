require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const connectDB = require('./config/db');
const resourcesRouter = require('./routes/resources');
const vtuRouter      = require('./routes/vtu');
const adminRouter    = require('./routes/admin');
const subjectsRouter = require('./routes/subjects');
const examsRouter = require('./routes/exams');
const notificationsRouter = require('./routes/notifications');
const resourceRequestsRouter = require('./routes/resourceRequests');
const resultsRouter = require('./routes/results');
const aiRouter = require('./routes/ai');
const errorHandler   = require('./middleware/errorHandler');
const { syncVTUNotifications } = require('./services/vtuScraper');
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

// ============================================
// PERFORMANCE & SECURITY MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false,
}));

// Gzip compression for responses
app.use(compression({
  level: 6, // Balance between speed and compression
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Trust proxy (important for Railway/Heroku)
app.set('trust proxy', 1);

// Increase JSON payload limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Conditional logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); // More detailed logs in production
}

// Response time header - Fixed to set before response finishes
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    originalSend.call(this, data);
  };
  
  next();
});

// Cache control headers for static assets
app.use('/uploads', (req, res, next) => {
  // Cache uploaded files for 1 year
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// ============================================
// API ROUTES
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Add cache headers for frequently accessed routes
const cacheMiddleware = (duration) => (req, res, next) => {
  res.setHeader('Cache-Control', `public, max-age=${duration}`);
  next();
};

// Cache branches/schemes/semesters for 1 hour (they don't change often)
app.use('/api/vtu/branches', cacheMiddleware(3600));
app.use('/api/vtu/schemes', cacheMiddleware(3600));
app.use('/api/vtu/semesters', cacheMiddleware(3600));

app.use('/api/resources', resourcesRouter);
app.use('/api/vtu',       vtuRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/subjects',  subjectsRouter);
app.use('/api/exams', examsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/resource-requests', resourceRequestsRouter);
app.use('/api/results', resultsRouter);
app.use('/api/ai', aiRouter);

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS Origins: ${allowedOrigins.join(', ')}`);
  
  // Sync VTU notifications on startup (non-blocking, longer delay)
  setTimeout(() => {
    console.log('🔄 Initiating VTU notifications sync on startup...');
    syncVTUNotifications()
      .then(result => {
        console.log('✅ Startup VTU sync:', result.message);
      })
      .catch(err => {
        console.error('❌ Startup VTU sync failed:', err.message);
      });
  }, 10000); // Wait 10 seconds for Railway health check to pass first

  // Schedule periodic VTU sync every 6 hours
  const SYNC_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  setInterval(() => {
    console.log('🔄 Running scheduled VTU notifications sync...');
    syncVTUNotifications()
      .then(result => {
        console.log('✅ Scheduled VTU sync:', result.message);
      })
      .catch(err => {
        console.error('❌ Scheduled VTU sync failed:', err.message);
      });
  }, SYNC_INTERVAL);
  
  console.log(`⏰ VTU sync scheduled every 6 hours`);
  console.log(`🚀 Server is ready and healthy!`);
});
