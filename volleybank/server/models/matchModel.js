const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class MatchModel {
  // Create a new match
  static async create(matchData) {
    const { date, winningTeam, stakeAmount, createdBy, players } = matchData;
    
    try {
      const client = await pool.connect();
      
      // Start transaction
      await client.query('BEGIN');
      
      // Create match record
      const matchQuery = `
        INSERT INTO matches (id, date, winning_team, stake_amount, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const matchId = uuidv4();
      const matchResult = await client.query(matchQuery, [
        matchId, date, winningTeam, stakeAmount, createdBy
      ]);
      
      const match = matchResult.rows[0];
      
      // Add players to match_players table
      if (players && players.length > 0) {
        for (const player of players) {
          const playerQuery = `
            INSERT INTO match_players (match_id, player_id, role, smashes, spikes, saves)
            VALUES ($1, $2, $3, $4, $5, $6)
          `;
          
          await client.query(playerQuery, [
            matchId,
            player.playerId,
            player.role || 'Player',
            player.smashes || 0,
            player.spikes || 0,
            player.saves || 0
          ]);
        }
        
        // Calculate and distribute earnings to winning team players
        await this.calculateEarnings(client, matchId, winningTeam, stakeAmount, players);
      }
      
      // Commit transaction
      await client.query('COMMIT');
      client.release();
      
      // Return match with players
      return await this.findById(matchId);
    } catch (error) {
      // Rollback on error
      const client = await pool.connect();
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  }

  // Calculate and distribute earnings
  static async calculateEarnings(client, matchId, winningTeam, stakeAmount, players) {
    try {
      // Get winning team players from the match
      const winningPlayersQuery = `
        SELECT mp.player_id, u.team
        FROM match_players mp
        JOIN users u ON mp.player_id = u.id
        WHERE mp.match_id = $1 AND u.team = $2
      `;
      
      const winningPlayersResult = await client.query(winningPlayersQuery, [matchId, winningTeam]);
      const winningPlayers = winningPlayersResult.rows;
      
      if (winningPlayers.length === 0) {
        throw new Error('No players found for winning team');
      }
      
      // Calculate earnings per player
      const earningsPerPlayer = parseFloat(stakeAmount) / winningPlayers.length;
      
      // Insert earnings for each winning player
      for (const player of winningPlayers) {
        const earningsQuery = `
          INSERT INTO earnings (player_id, match_id, amount_earned)
          VALUES ($1, $2, $3)
        `;
        
        await client.query(earningsQuery, [
          player.player_id,
          matchId,
          earningsPerPlayer.toFixed(2)
        ]);
      }
      
      return earningsPerPlayer;
    } catch (error) {
      throw error;
    }
  }

  // Find match by ID with all details
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      // Get match details
      const matchQuery = `
        SELECT m.*, u.name as created_by_name
        FROM matches m
        LEFT JOIN users u ON m.created_by = u.id
        WHERE m.id = $1
      `;
      
      const matchResult = await client.query(matchQuery, [id]);
      
      if (matchResult.rows.length === 0) {
        client.release();
        return null;
      }
      
      const match = matchResult.rows[0];
      
      // Get match players with details
      const playersQuery = `
        SELECT 
          mp.*,
          u.name as player_name,
          u.team as player_team,
          u.email as player_email,
          e.amount_earned
        FROM match_players mp
        JOIN users u ON mp.player_id = u.id
        LEFT JOIN earnings e ON mp.player_id = e.player_id AND mp.match_id = e.match_id
        WHERE mp.match_id = $1
        ORDER BY u.name
      `;
      
      const playersResult = await client.query(playersQuery, [id]);
      
      client.release();
      
      return {
        ...match,
        players: playersResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all matches with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const client = await pool.connect();
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      const queryParams = [];
      let paramCount = 0;
      
      // Build filters
      if (filters.team) {
        paramCount++;
        whereClause += ` AND m.winning_team = $${paramCount}`;
        queryParams.push(filters.team);
      }
      
      if (filters.dateFrom) {
        paramCount++;
        whereClause += ` AND m.date >= $${paramCount}`;
        queryParams.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        paramCount++;
        whereClause += ` AND m.date <= $${paramCount}`;
        queryParams.push(filters.dateTo);
      }
      
      // Get matches with creator details
      const matchesQuery = `
        SELECT 
          m.*,
          u.name as created_by_name,
          COUNT(mp.player_id) as player_count,
          SUM(CASE WHEN u2.team = m.winning_team THEN 1 ELSE 0 END) as winning_players_count
        FROM matches m
        LEFT JOIN users u ON m.created_by = u.id
        LEFT JOIN match_players mp ON m.id = mp.match_id
        LEFT JOIN users u2 ON mp.player_id = u2.id
        WHERE 1=1 ${whereClause}
        GROUP BY m.id, u.name
        ORDER BY m.date DESC, m.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      queryParams.push(limit, offset);
      
      const matchesResult = await client.query(matchesQuery, queryParams);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT m.id) as total
        FROM matches m
        WHERE 1=1 ${whereClause}
      `;
      
      const countResult = await client.query(countQuery, queryParams.slice(0, paramCount));
      const totalMatches = parseInt(countResult.rows[0].total);
      
      client.release();
      
      return {
        matches: matchesResult.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMatches / limit),
          totalMatches,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get recent matches
  static async getRecentMatches(limit = 5) {
    try {
      const client = await pool.connect();
      
      const query = `
        SELECT 
          m.*,
          u.name as created_by_name,
          COUNT(mp.player_id) as player_count
        FROM matches m
        LEFT JOIN users u ON m.created_by = u.id
        LEFT JOIN match_players mp ON m.id = mp.match_id
        GROUP BY m.id, u.name
        ORDER BY m.date DESC, m.created_at DESC
        LIMIT $1
      `;
      
      const result = await client.query(query, [limit]);
      
      client.release();
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get player's match history
  static async getPlayerMatches(playerId, page = 1, limit = 10) {
    try {
      const client = await pool.connect();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          m.*,
          mp.role,
          mp.smashes,
          mp.spikes,
          mp.saves,
          e.amount_earned,
          u.name as created_by_name,
          CASE WHEN u2.team = m.winning_team THEN true ELSE false END as is_winner
        FROM matches m
        JOIN match_players mp ON m.id = mp.match_id
        LEFT JOIN earnings e ON mp.player_id = e.player_id AND mp.match_id = e.match_id
        LEFT JOIN users u ON m.created_by = u.id
        LEFT JOIN users u2 ON mp.player_id = u2.id
        WHERE mp.player_id = $1
        ORDER BY m.date DESC, m.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await client.query(query, [playerId, limit, offset]);
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM match_players mp
        WHERE mp.player_id = $1
      `;
      
      const countResult = await client.query(countQuery, [playerId]);
      const totalMatches = parseInt(countResult.rows[0].total);
      
      client.release();
      
      return {
        matches: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMatches / limit),
          totalMatches,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update match details (admin only)
  static async update(id, updateData) {
    const { winningTeam, stakeAmount } = updateData;
    
    try {
      const client = await pool.connect();
      
      const query = `
        UPDATE matches 
        SET winning_team = $2, stake_amount = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await client.query(query, [id, winningTeam, stakeAmount]);
      
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete match (admin only)
  static async delete(id) {
    try {
      const client = await pool.connect();
      
      const query = 'DELETE FROM matches WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get match statistics
  static async getMatchStats() {
    try {
      const client = await pool.connect();
      
      const query = `
        SELECT 
          COUNT(*) as total_matches,
          SUM(stake_amount) as total_stakes,
          AVG(stake_amount) as average_stake,
          COUNT(DISTINCT winning_team) as unique_winning_teams,
          MAX(date) as latest_match_date,
          MIN(date) as first_match_date
        FROM matches
      `;
      
      const result = await client.query(query);
      
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MatchModel; 