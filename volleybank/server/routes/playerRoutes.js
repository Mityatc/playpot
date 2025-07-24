const express = require('express');
const UserModel = require('../models/userModel');
const MatchModel = require('../models/matchModel');
const { authenticateToken, requirePlayerAccess } = require('../middleware/auth');

const router = express.Router();

// Get player details
router.get('/:id', authenticateToken, requirePlayerAccess, async (req, res, next) => {
  try {
    const { id } = req.params;

    const player = await UserModel.findById(id);
    if (!player) {
      return res.status(404).json({
        status: 'error',
        message: 'Player not found'
      });
    }

    // Get player statistics
    const stats = await UserModel.getUserStats(id);

    res.status(200).json({
      status: 'success',
      data: {
        player,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get player statistics
router.get('/:id/stats', authenticateToken, requirePlayerAccess, async (req, res, next) => {
  try {
    const { id } = req.params;

    const player = await UserModel.findById(id);
    if (!player) {
      return res.status(404).json({
        status: 'error',
        message: 'Player not found'
      });
    }

    const stats = await UserModel.getUserStats(id);

    res.status(200).json({
      status: 'success',
      data: {
        playerId: id,
        playerName: player.name,
        team: player.team,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get player earnings
router.get('/:id/earnings', authenticateToken, requirePlayerAccess, async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const player = await UserModel.findById(id);
    if (!player) {
      return res.status(404).json({
        status: 'error',
        message: 'Player not found'
      });
    }

    // Get match history with earnings
    const matchHistory = await MatchModel.getPlayerMatches(id, page, limit);

    // Calculate total earnings
    const totalEarnings = matchHistory.matches.reduce((sum, match) => {
      return sum + (parseFloat(match.amount_earned) || 0);
    }, 0);

    const winningMatches = matchHistory.matches.filter(match => match.is_winner);

    res.status(200).json({
      status: 'success',
      data: {
        player: {
          id: player.id,
          name: player.name,
          team: player.team
        },
        earnings: {
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          winningMatches: winningMatches.length,
          totalMatches: matchHistory.matches.length,
          winRate: matchHistory.matches.length > 0 
            ? parseFloat(((winningMatches.length / matchHistory.matches.length) * 100).toFixed(2))
            : 0
        },
        matchHistory: matchHistory.matches,
        pagination: matchHistory.pagination
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 