const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Update player stats schema
const updateStatsSchema = Joi.object({
  smashes: Joi.number().integer().min(0).optional(),
  spikes: Joi.number().integer().min(0).optional(),
  saves: Joi.number().integer().min(0).optional(),
  matchId: Joi.string().required().messages({
    'any.required': 'Match ID is required'
  })
});

// Update player stats for a specific match
router.post('/:playerId', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { playerId } = req.params;

    // Validate input
    const { error, value } = updateStatsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }

    const { smashes, spikes, saves, matchId } = value;

    const client = await pool.connect();

    // Check if player and match exist and player is in the match
    const checkQuery = `
      SELECT mp.*, u.name as player_name
      FROM match_players mp
      JOIN users u ON mp.player_id = u.id
      WHERE mp.player_id = $1 AND mp.match_id = $2
    `;

    const checkResult = await client.query(checkQuery, [playerId, matchId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        status: 'error',
        message: 'Player not found in this match'
      });
    }

    // Update stats
    const updateQuery = `
      UPDATE match_players 
      SET 
        smashes = COALESCE($3, smashes),
        spikes = COALESCE($4, spikes),
        saves = COALESCE($5, saves)
      WHERE player_id = $1 AND match_id = $2
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [
      playerId, matchId, smashes, spikes, saves
    ]);

    client.release();

    res.status(200).json({
      status: 'success',
      message: 'Player stats updated successfully',
      data: {
        updatedStats: updateResult.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orderBy = req.query.orderBy || 'total_earnings'; // total_earnings, total_points, win_rate
    
    const client = await pool.connect();

    let orderClause = '';
    switch (orderBy) {
      case 'total_points':
        orderClause = 'total_points DESC';
        break;
      case 'win_rate':
        orderClause = 'win_rate DESC, total_matches DESC';
        break;
      case 'total_earnings':
      default:
        orderClause = 'total_earnings DESC';
        break;
    }

    const query = `
      SELECT 
        u.id,
        u.name,
        u.team,
        COUNT(DISTINCT mp.match_id) as total_matches,
        SUM(CASE 
          WHEN m.winning_team = u.team THEN 1 
          ELSE 0 
        END) as wins,
        CASE 
          WHEN COUNT(DISTINCT mp.match_id) > 0 
          THEN ROUND((SUM(CASE WHEN m.winning_team = u.team THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT mp.match_id)), 2)
          ELSE 0 
        END as win_rate,
        COALESCE(SUM(mp.smashes), 0) as total_smashes,
        COALESCE(SUM(mp.spikes), 0) as total_spikes,
        COALESCE(SUM(mp.saves), 0) as total_saves,
        COALESCE(SUM(mp.smashes + mp.spikes + mp.saves), 0) as total_points,
        COALESCE(SUM(e.amount_earned), 0) as total_earnings
      FROM users u
      LEFT JOIN match_players mp ON u.id = mp.player_id
      LEFT JOIN matches m ON mp.match_id = m.id
      LEFT JOIN earnings e ON u.id = e.player_id
      WHERE u.role = 'player'
      GROUP BY u.id, u.name, u.team
      HAVING COUNT(DISTINCT mp.match_id) > 0
      ORDER BY ${orderClause}
      LIMIT $1
    `;

    const result = await client.query(query, [limit]);

    client.release();

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard: result.rows,
        orderBy,
        count: result.rows.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get team leaderboard
router.get('/leaderboard/teams', authenticateToken, async (req, res, next) => {
  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        u.team,
        COUNT(DISTINCT m.id) as total_matches,
        SUM(CASE WHEN m.winning_team = u.team THEN 1 ELSE 0 END) as wins,
        COUNT(DISTINCT m.id) - SUM(CASE WHEN m.winning_team = u.team THEN 1 ELSE 0 END) as losses,
        CASE 
          WHEN COUNT(DISTINCT m.id) > 0 
          THEN ROUND((SUM(CASE WHEN m.winning_team = u.team THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT m.id)), 2)
          ELSE 0 
        END as win_rate,
        COALESCE(SUM(CASE WHEN m.winning_team = u.team THEN m.stake_amount ELSE 0 END), 0) as total_earnings,
        COUNT(DISTINCT u.id) as player_count
      FROM users u
      LEFT JOIN match_players mp ON u.id = mp.player_id
      LEFT JOIN matches m ON mp.match_id = m.id
      WHERE u.role = 'player' AND u.team IS NOT NULL
      GROUP BY u.team
      HAVING COUNT(DISTINCT m.id) > 0
      ORDER BY win_rate DESC, total_earnings DESC
    `;

    const result = await client.query(query);

    client.release();

    res.status(200).json({
      status: 'success',
      data: {
        teamLeaderboard: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get performance statistics for specific time period
router.get('/performance', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate, team } = req.query;
    
    const client = await pool.connect();

    let whereClause = "WHERE u.role = 'player'";
    const queryParams = [];
    let paramCount = 0;

    if (startDate) {
      paramCount++;
      whereClause += ` AND m.date >= $${paramCount}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereClause += ` AND m.date <= $${paramCount}`;
      queryParams.push(endDate);
    }

    if (team) {
      paramCount++;
      whereClause += ` AND u.team = $${paramCount}`;
      queryParams.push(team);
    }

    const query = `
      SELECT 
        u.id,
        u.name,
        u.team,
        COUNT(DISTINCT mp.match_id) as matches_played,
        COALESCE(SUM(mp.smashes), 0) as smashes,
        COALESCE(SUM(mp.spikes), 0) as spikes,
        COALESCE(SUM(mp.saves), 0) as saves,
        COALESCE(SUM(e.amount_earned), 0) as earnings,
        CASE 
          WHEN COUNT(DISTINCT mp.match_id) > 0 
          THEN ROUND((COALESCE(SUM(mp.smashes + mp.spikes + mp.saves), 0) * 1.0 / COUNT(DISTINCT mp.match_id)), 2)
          ELSE 0 
        END as avg_points_per_match
      FROM users u
      LEFT JOIN match_players mp ON u.id = mp.player_id
      LEFT JOIN matches m ON mp.match_id = m.id
      LEFT JOIN earnings e ON u.id = e.player_id AND mp.match_id = e.match_id
      ${whereClause}
      GROUP BY u.id, u.name, u.team
      ORDER BY matches_played DESC, avg_points_per_match DESC
    `;

    const result = await client.query(query, queryParams);

    client.release();

    res.status(200).json({
      status: 'success',
      data: {
        performance: result.rows,
        filters: { startDate, endDate, team },
        count: result.rows.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 