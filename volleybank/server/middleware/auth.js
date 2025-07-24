const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, email, role, team FROM users WHERE id = $1',
      [decoded.userId]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User not found.'
      });
    }

    // Add user to request object
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required.'
    });
  }

  next();
};

// Middleware to check if user can access player data (admin or own data)
const requirePlayerAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.'
    });
  }

  const requestedPlayerId = req.params.id || req.params.playerId;
  
  // Admin can access any player data, players can only access their own
  if (req.user.role === 'admin' || req.user.id === requestedPlayerId) {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only view your own data.'
    });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePlayerAccess,
  generateToken
}; 