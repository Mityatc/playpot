const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function quickSeed() {
  console.log('🏐 Starting quick database seeding...');
  
  const client = await pool.connect();
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await client.query('DELETE FROM earnings');
    await client.query('DELETE FROM match_players');
    await client.query('DELETE FROM matches');
    await client.query('DELETE FROM users');
    console.log('✅ Data cleared');
    
    // Create admin
    console.log('👨‍💼 Creating admin...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminId = uuidv4();
    
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role, team)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [adminId, 'Rajesh Kumar (Admin)', 'admin@volleybank.com', adminPassword, 'admin', null]);
    console.log('✅ Admin created');
    
    // Create some players
    console.log('🏐 Creating players...');
    const playerPassword = await bcrypt.hash('player123', 12);
    
    const players = [
      { name: 'Arjun Sharma', email: 'arjun.sharma@gmail.com', team: 'Team A' },
      { name: 'Priya Patel', email: 'priya.patel@gmail.com', team: 'Team A' },
      { name: 'Rohan Kapoor', email: 'rohan.kapoor@gmail.com', team: 'Team B' },
      { name: 'Ishita Jain', email: 'ishita.jain@gmail.com', team: 'Team B' },
      { name: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', team: 'Team C' },
      { name: 'Diya Bansal', email: 'diya.bansal@gmail.com', team: 'Team C' }
    ];
    
    for (const player of players) {
      const playerId = uuidv4();
      await client.query(`
        INSERT INTO users (id, name, email, password_hash, role, team)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [playerId, player.name, player.email, playerPassword, 'player', player.team]);
      console.log(`✅ Created player: ${player.name}`);
    }
    
    console.log('\n🎉 Quick seeding completed!');
    console.log('👥 Created 6 players + 1 admin');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@volleybank.com / admin123');
    console.log('Player: arjun.sharma@gmail.com / player123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

quickSeed(); 