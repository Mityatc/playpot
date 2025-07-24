const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (authentication required)
router.get('/me', authenticateToken, AuthController.getMe);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);

// Admin-only routes
router.get('/players', authenticateToken, requireAdmin, AuthController.getAllPlayers);
router.get('/players/team/:team', authenticateToken, requireAdmin, AuthController.getPlayersByTeam);

module.exports = router; 