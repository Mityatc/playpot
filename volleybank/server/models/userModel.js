const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'player', team } = userData;
    
    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const client = await pool.connect();
      
      const query = `
        INSERT INTO users (id, name, email, password_hash, role, team)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, role, team, created_at
      `;
      
      const values = [uuidv4(), name, email, passwordHash, role, team];
      const result = await client.query(query, values);
      
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const client = await pool.connect();
      
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await client.query(query, [email]);
      
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const client = await pool.connect();
      
      const query = 'SELECT id, name, email, role, team, created_at FROM users WHERE id = $1';
      const result = await client.query(query, [id]);
      
      client.release();
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // Get all players (for admin)
  static async getAllPlayers() {
    try {
      const client = await pool.connect();
      
      const query = `
        SELECT id, name, email, team, created_at
        FROM users 
        WHERE role = 'player'
        ORDER BY name ASC
      `;
      
      const result = await client.query(query);
      
      client.release();
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get players by team
  static async getPlayersByTeam(team) {
    try {
      const client = await pool.connect();
      
      const query = `
        SELECT id, name, email, team, created_at
        FROM users 
        WHERE role = 'player' AND team = $1
        ORDER BY name ASC
      `;
      
      const result = await client.query(query, [team]);
      
      client.release();
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    const { name, team } = updateData;
    
    try {
      const client = await pool.connect();
      
      const query = `
        UPDATE users 
        SET name = $2, team = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, email, role, team, updated_at
      `;
      
      const result = await client.query(query, [id, name, team]);
      
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Change password
  static async changePassword(id, newPassword) {
    try {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      const client = await pool.connect();
      
      const query = `
        UPDATE users 
        SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;
      
      const result = await client.query(query, [id, passwordHash]);
      
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics (for player dashboard)
  static async getUserStats(userId) {
    try {
      const client = await pool.connect();
      
      // Get aggregated stats for the user
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT mp.match_id) as total_matches,
          COALESCE(SUM(mp.smashes), 0) as total_smashes,
          COALESCE(SUM(mp.spikes), 0) as total_spikes,
          COALESCE(SUM(mp.saves), 0) as total_saves,
          COALESCE(SUM(e.amount_earned), 0) as total_earnings
        FROM users u
        LEFT JOIN match_players mp ON u.id = mp.player_id
        LEFT JOIN earnings e ON u.id = e.player_id
        WHERE u.id = $1
        GROUP BY u.id
      `;
      
      const statsResult = await client.query(statsQuery, [userId]);
      
      client.release();
      return statsResult.rows[0] || {
        total_matches: 0,
        total_smashes: 0,
        total_spikes: 0,
        total_saves: 0,
        total_earnings: 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete user (admin only)
  static async deleteUser(id) {
    try {
      const client = await pool.connect();
      
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel; 