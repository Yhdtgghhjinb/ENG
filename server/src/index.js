require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const resourcesRouter = require('./routes/resources');
const vtuRouter      = require('./routes/vtu');
const adminRouter    = require('./routes/admin');
const subjectsRouter = require('./routes/subjects');
const errorHandler   = require('./middleware/errorHandler');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/eng-resource-platform';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

connectDB(MONGODB_URI);

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use('/api/resources', resourcesRouter);
app.use('/api/vtu',       vtuRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/subjects',  subjectsRouter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
