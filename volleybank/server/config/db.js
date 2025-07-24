const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Create database tables if they don't exist
const createTables = async () => {
  try {
    const client = await pool.connect();
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('admin', 'player')) DEFAULT 'player',
        team VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Matches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        winning_team VARCHAR(50) NOT NULL,
        stake_amount DECIMAL(10,2) NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Match players table
    await client.query(`
      CREATE TABLE IF NOT EXISTS match_players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        player_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50),
        smashes INTEGER DEFAULT 0,
        spikes INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(match_id, player_id)
      )
    `);
    
    // Earnings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS earnings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID REFERENCES users(id) ON DELETE CASCADE,
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        amount_earned DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id, match_id)
      )
    `);
    
    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_earnings_player ON earnings(player_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id)');
    
    console.log('✅ Database tables created/verified successfully');
    client.release();
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
};

// Initialize database
const initializeDatabase = async () => {
  await testConnection();
  await createTables();
};

module.exports = {
  pool,
  initializeDatabase,
  testConnection,
  createTables
}; 