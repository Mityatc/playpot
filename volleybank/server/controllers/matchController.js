const MatchModel = require('../models/matchModel');
const UserModel = require('../models/userModel');
const Joi = require('joi');

// Validation schemas
const createMatchSchema = Joi.object({
  date: Joi.date().iso().required().messages({
    'date.base': 'Date must be a valid date',
    'any.required': 'Match date is required'
  }),
  winningTeam: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Winning team name must be at least 2 characters',
    'string.max': 'Winning team name cannot exceed 50 characters',
    'any.required': 'Winning team is required'
  }),
  stakeAmount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Stake amount must be positive',
    'any.required': 'Stake amount is required'
  }),
  players: Joi.array().items(
    Joi.object({
      playerId: Joi.string().required(),
      role: Joi.string().max(50).default('Player'),
      smashes: Joi.number().integer().min(0).default(0),
      spikes: Joi.number().integer().min(0).default(0),
      saves: Joi.number().integer().min(0).default(0)
    })
  ).min(1).required().messages({
    'array.min': 'At least one player is required',
    'any.required': 'Players list is required'
  })
});

const updateMatchSchema = Joi.object({
  winningTeam: Joi.string().min(2).max(50).optional(),
  stakeAmount: Joi.number().positive().precision(2).optional()
});

class MatchController {
  // Create a new match
  static async createMatch(req, res, next) {
    try {
      // Validate input
      const { error, value } = createMatchSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { date, winningTeam, stakeAmount, players } = value;

      // Verify that all players exist and get their details
      const playerValidation = await Promise.all(
        players.map(async (player) => {
          const user = await UserModel.findById(player.playerId);
          if (!user) {
            throw new Error(`Player with ID ${player.playerId} not found`);
          }
          if (user.role !== 'player') {
            throw new Error(`User ${user.name} is not a player`);
          }
          return { ...player, playerDetails: user };
        })
      );

      // Check if winning team has players in the match
      const winningTeamPlayers = playerValidation.filter(
        p => p.playerDetails.team === winningTeam
      );

      if (winningTeamPlayers.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `No players from winning team "${winningTeam}" found in the match`
        });
      }

      // Create the match
      const matchData = {
        date,
        winningTeam,
        stakeAmount,
        createdBy: req.user.id,
        players
      };

      const newMatch = await MatchModel.create(matchData);

      res.status(201).json({
        status: 'success',
        message: 'Match created successfully',
        data: {
          match: newMatch,
          earnings: {
            totalAmount: stakeAmount,
            perPlayer: parseFloat(stakeAmount) / winningTeamPlayers.length,
            winningPlayersCount: winningTeamPlayers.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all matches with pagination and filters
  static async getAllMatches(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Build filters
      const filters = {};
      if (req.query.team) filters.team = req.query.team;
      if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
      if (req.query.dateTo) filters.dateTo = req.query.dateTo;

      const result = await MatchModel.findAll(page, limit, filters);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get specific match by ID
  static async getMatchById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Match ID is required'
        });
      }

      const match = await MatchModel.findById(id);

      if (!match) {
        return res.status(404).json({
          status: 'error',
          message: 'Match not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { match }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get recent matches
  static async getRecentMatches(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      const recentMatches = await MatchModel.getRecentMatches(limit);

      res.status(200).json({
        status: 'success',
        data: {
          matches: recentMatches,
          count: recentMatches.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get match statistics
  static async getMatchStats(req, res, next) {
    try {
      const stats = await MatchModel.getMatchStats();

      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update match (admin only)
  static async updateMatch(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Match ID is required'
        });
      }

      // Validate input
      const { error, value } = updateMatchSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      // Check if match exists
      const existingMatch = await MatchModel.findById(id);
      if (!existingMatch) {
        return res.status(404).json({
          status: 'error',
          message: 'Match not found'
        });
      }

      // Update the match
      const updatedMatch = await MatchModel.update(id, value);

      res.status(200).json({
        status: 'success',
        message: 'Match updated successfully',
        data: { match: updatedMatch }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete match (admin only)
  static async deleteMatch(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Match ID is required'
        });
      }

      // Check if match exists
      const existingMatch = await MatchModel.findById(id);
      if (!existingMatch) {
        return res.status(404).json({
          status: 'error',
          message: 'Match not found'
        });
      }

      // Delete the match
      await MatchModel.delete(id);

      res.status(200).json({
        status: 'success',
        message: 'Match deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get player's match history
  static async getPlayerMatches(req, res, next) {
    try {
      const { playerId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!playerId) {
        return res.status(400).json({
          status: 'error',
          message: 'Player ID is required'
        });
      }

      // Check if player exists
      const player = await UserModel.findById(playerId);
      if (!player) {
        return res.status(404).json({
          status: 'error',
          message: 'Player not found'
        });
      }

      const result = await MatchModel.getPlayerMatches(playerId, page, limit);

      res.status(200).json({
        status: 'success',
        data: {
          player: {
            id: player.id,
            name: player.name,
            team: player.team
          },
          ...result
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get team performance summary
  static async getTeamPerformance(req, res, next) {
    try {
      const { team } = req.params;

      if (!team) {
        return res.status(400).json({
          status: 'error',
          message: 'Team name is required'
        });
      }

      // This would typically be a separate model method, but for simplicity:
      const teamStats = await MatchModel.findAll(1, 1000, { team });

      const wins = teamStats.matches.filter(match => match.winning_team === team);
      const totalMatches = teamStats.matches.length;
      const winRate = totalMatches > 0 ? (wins.length / totalMatches) * 100 : 0;
      const totalEarnings = wins.reduce((sum, match) => sum + parseFloat(match.stake_amount), 0);

      res.status(200).json({
        status: 'success',
        data: {
          team,
          totalMatches,
          wins: wins.length,
          losses: totalMatches - wins.length,
          winRate: parseFloat(winRate.toFixed(2)),
          totalEarnings: parseFloat(totalEarnings.toFixed(2))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MatchController; 