const UserModel = require('../models/userModel');
const { generateToken } = require('../middleware/auth');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('admin', 'player').default('player'),
  team: Joi.string().min(2).max(30).when('role', {
    is: 'player',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.min': 'Team name must be at least 2 characters long',
    'string.max': 'Team name cannot exceed 30 characters',
    'any.required': 'Team is required for players'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

class AuthController {
  // Register new user
  static async register(req, res, next) {
    try {
      // Validate input
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { name, email, password, role, team } = value;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'Email address already registered'
        });
      }

      // Create new user
      const newUser = await UserModel.create({
        name,
        email,
        password,
        role,
        team
      });

      // Generate JWT token
      const token = generateToken(newUser.id);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            team: newUser.team
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req, res, next) {
    try {
      // Validate input
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { email, password } = value;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            team: user.team
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getMe(req, res, next) {
    try {
      const userId = req.user.id;

      // Get user details with stats
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Get user statistics
      const stats = await UserModel.getUserStats(userId);

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            team: user.team,
            createdAt: user.created_at
          },
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, team } = req.body;

      // Basic validation
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          status: 'error',
          message: 'Name must be at least 2 characters long'
        });
      }

      if (req.user.role === 'player' && (!team || team.trim().length < 2)) {
        return res.status(400).json({
          status: 'error',
          message: 'Team is required for players'
        });
      }

      // Update user profile
      const updatedUser = await UserModel.updateProfile(userId, {
        name: name.trim(),
        team: team ? team.trim() : null
      });

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must be at least 6 characters long'
        });
      }

      // Get user with password hash
      const user = await UserModel.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await UserModel.verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await UserModel.changePassword(userId, newPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all players (admin only)
  static async getAllPlayers(req, res, next) {
    try {
      const players = await UserModel.getAllPlayers();

      res.status(200).json({
        status: 'success',
        data: {
          players,
          count: players.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get players by team
  static async getPlayersByTeam(req, res, next) {
    try {
      const { team } = req.params;

      if (!team) {
        return res.status(400).json({
          status: 'error',
          message: 'Team parameter is required'
        });
      }

      const players = await UserModel.getPlayersByTeam(team);

      res.status(200).json({
        status: 'success',
        data: {
          players,
          team,
          count: players.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController; 