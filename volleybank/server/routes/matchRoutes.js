const express = require('express');
const MatchController = require('../controllers/matchController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (with authentication)
router.get('/', authenticateToken, MatchController.getAllMatches);
router.get('/recent', authenticateToken, MatchController.getRecentMatches);
router.get('/stats', authenticateToken, MatchController.getMatchStats);
router.get('/team/:team/performance', authenticateToken, MatchController.getTeamPerformance);
router.get('/player/:playerId', authenticateToken, MatchController.getPlayerMatches);
router.get('/:id', authenticateToken, MatchController.getMatchById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, MatchController.createMatch);
router.put('/:id', authenticateToken, requireAdmin, MatchController.updateMatch);
router.delete('/:id', authenticateToken, requireAdmin, MatchController.deleteMatch);

module.exports = router; 