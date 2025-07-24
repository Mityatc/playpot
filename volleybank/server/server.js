const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./config/db');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const playerRoutes = require('./routes/playerRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// CORS configuration - Fixed for frontend connection
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'VolleyBank API is running! 🏐💰',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leaderboard', statsRoutes); // Leaderboard is part of stats

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection and create tables
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`
🏐 VolleyBank Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server:        http://localhost:${PORT}
📖 Health Check:  http://localhost:${PORT}/health
🗄️  Database:     Connected to PostgreSQL
🛡️  Security:     Helmet & Rate Limiting enabled
🌐 CORS:          ${process.env.CLIENT_URL || 'http://localhost:3000'}
📦 Environment:   ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 API Endpoints:
   POST   /api/auth/register      - User registration
   POST   /api/auth/login         - User login
   GET    /api/auth/me            - Get current user

   POST   /api/match              - Create new match
   GET    /api/match              - Get all matches
   GET    /api/match/:id          - Get specific match

   GET    /api/player/:id         - Get player details
   GET    /api/player/:id/stats   - Get player statistics
   GET    /api/player/:id/earnings - Get player earnings

   POST   /api/stats/:playerId    - Update player stats
   GET    /api/leaderboard        - Get leaderboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app; 