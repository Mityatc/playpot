// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    status: 'error',
    message: err.message || 'Internal Server Error'
  };

  let statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.code === '23505') {
    // PostgreSQL unique constraint error
    statusCode = 409;
    error.message = 'Duplicate entry. This record already exists.';
    
    if (err.constraint && err.constraint.includes('email')) {
      error.message = 'Email address already registered.';
    }
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key constraint error
    statusCode = 400;
    error.message = 'Referenced record does not exist.';
  }

  if (err.code === '22P02') {
    // PostgreSQL invalid input syntax
    statusCode = 400;
    error.message = 'Invalid input format.';
  }

  if (err.name === 'ValidationError') {
    // Joi validation error
    statusCode = 400;
    error.message = err.details[0].message;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error.message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error.message = 'Token expired.';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    error.message = 'Invalid ID format.';
  }

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = {
      originalError: err.message,
      code: err.code,
      constraint: err.constraint
    };
  }

  res.status(statusCode).json(error);
};

module.exports = errorHandler; 