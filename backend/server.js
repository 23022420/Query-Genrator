const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const queryRoutes = require('./src/routes/query');
const historyRoutes = require('./src/routes/history');
const savedRoutes = require('./src/routes/saved');
const userRoutes = require('./src/routes/user');
const adminRoutes = require('./src/routes/admin');
const schemaRoutes = require('./src/routes/schema');

const app = express();
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dnsServers = process.env.DNS_SERVERS
  ? process.env.DNS_SERVERS.split(',').map(server => server.trim()).filter(Boolean)
  : [];

if (dnsServers.length) {
  dns.setServers(dnsServers);
}

// Security middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'AI rate limit exceeded. Please wait before sending more queries.' }
});

app.use('/api/', limiter);
app.use('/api/query/', aiLimiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schema', schemaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// DB + Server
if (!mongoUri) {
  console.error('❌ MongoDB connection error: Set MONGODB_URI in backend/.env');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('querySrv')) {
      console.error('   Check your DNS/network connection, Atlas cluster hostname, or use the non-SRV MongoDB connection string.');
    }
    process.exit(1);
  });
