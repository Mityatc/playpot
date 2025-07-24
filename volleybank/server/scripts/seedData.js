const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Sample Indian names for players
const indianPlayers = [
  // Team A players
  { name: 'Arjun Sharma', email: 'arjun.sharma@gmail.com', team: 'Team A' },
  { name: 'Priya Patel', email: 'priya.patel@gmail.com', team: 'Team A' },
  { name: 'Rahul Kumar', email: 'rahul.kumar@gmail.com', team: 'Team A' },
  { name: 'Sneha Gupta', email: 'sneha.gupta@gmail.com', team: 'Team A' },
  { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', team: 'Team A' },
  { name: 'Ananya Reddy', email: 'ananya.reddy@gmail.com', team: 'Team A' },
  
  // Team B players
  { name: 'Rohan Kapoor', email: 'rohan.kapoor@gmail.com', team: 'Team B' },
  { name: 'Ishita Jain', email: 'ishita.jain@gmail.com', team: 'Team B' },
  { name: 'Karthik Nair', email: 'karthik.nair@gmail.com', team: 'Team B' },
  { name: 'Meera Agarwal', email: 'meera.agarwal@gmail.com', team: 'Team B' },
  { name: 'Siddharth Chopra', email: 'siddharth.chopra@gmail.com', team: 'Team B' },
  { name: 'Kavya Iyer', email: 'kavya.iyer@gmail.com', team: 'Team B' },
  
  // Team C players
  { name: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', team: 'Team C' },
  { name: 'Diya Bansal', email: 'diya.bansal@gmail.com', team: 'Team C' },
  { name: 'Aryan Verma', email: 'aryan.verma@gmail.com', team: 'Team C' },
  { name: 'Pooja Malhotra', email: 'pooja.malhotra@gmail.com', team: 'Team C' },
  { name: 'Aditya Mishra', email: 'aditya.mishra@gmail.com', team: 'Team C' },
  { name: 'Riya Saxena', email: 'riya.saxena@gmail.com', team: 'Team C' }
];

// Sample matches data
const sampleMatches = [
  {
    date: '2024-01-21',
    winningTeam: 'Team A',
    stakeAmount: 300,
    players: [
      // Team A players (winners)
      { name: 'Arjun Sharma', smashes: 8, spikes: 6, saves: 4 },
      { name: 'Priya Patel', smashes: 5, spikes: 7, saves: 8 },
      { name: 'Rahul Kumar', smashes: 6, spikes: 4, saves: 6 },
      { name: 'Sneha Gupta', smashes: 4, spikes: 8, saves: 7 },
      { name: 'Vikram Singh', smashes: 7, spikes: 5, saves: 5 },
      { name: 'Ananya Reddy', smashes: 3, spikes: 6, saves: 9 },
      // Team B players
      { name: 'Rohan Kapoor', smashes: 5, spikes: 4, saves: 6 },
      { name: 'Ishita Jain', smashes: 4, spikes: 5, saves: 7 },
      { name: 'Karthik Nair', smashes: 6, spikes: 3, saves: 5 },
      // Team C players
      { name: 'Aarav Mehta', smashes: 3, spikes: 4, saves: 5 },
      { name: 'Diya Bansal', smashes: 2, spikes: 6, saves: 8 },
      { name: 'Aryan Verma', smashes: 4, spikes: 2, saves: 6 }
    ]
  },
  {
    date: '2024-01-14',
    winningTeam: 'Team B',
    stakeAmount: 300,
    players: [
      // Team A players
      { name: 'Arjun Sharma', smashes: 6, spikes: 4, saves: 5 },
      { name: 'Priya Patel', smashes: 3, spikes: 5, saves: 7 },
      { name: 'Rahul Kumar', smashes: 5, spikes: 3, saves: 4 },
      // Team B players (winners)
      { name: 'Rohan Kapoor', smashes: 9, spikes: 7, saves: 6 },
      { name: 'Ishita Jain', smashes: 6, spikes: 8, saves: 9 },
      { name: 'Karthik Nair', smashes: 8, spikes: 6, saves: 7 },
      { name: 'Meera Agarwal', smashes: 5, spikes: 9, saves: 8 },
      { name: 'Siddharth Chopra', smashes: 7, spikes: 5, saves: 6 },
      { name: 'Kavya Iyer', smashes: 4, spikes: 7, saves: 10 },
      // Team C players
      { name: 'Aarav Mehta', smashes: 4, spikes: 3, saves: 5 },
      { name: 'Diya Bansal', smashes: 3, spikes: 4, saves: 6 },
      { name: 'Aryan Verma', smashes: 5, spikes: 2, saves: 4 }
    ]
  },
  {
    date: '2024-01-07',
    winningTeam: 'Team C',
    stakeAmount: 300,
    players: [
      // Team A players
      { name: 'Arjun Sharma', smashes: 4, spikes: 5, saves: 6 },
      { name: 'Priya Patel', smashes: 3, spikes: 4, saves: 5 },
      { name: 'Rahul Kumar', smashes: 5, spikes: 3, saves: 4 },
      // Team B players
      { name: 'Rohan Kapoor', smashes: 5, spikes: 4, saves: 5 },
      { name: 'Ishita Jain', smashes: 3, spikes: 6, saves: 7 },
      { name: 'Karthik Nair', smashes: 4, spikes: 3, saves: 6 },
      // Team C players (winners)
      { name: 'Aarav Mehta', smashes: 8, spikes: 9, saves: 7 },
      { name: 'Diya Bansal', smashes: 7, spikes: 8, saves: 10 },
      { name: 'Aryan Verma', smashes: 9, spikes: 6, saves: 8 },
      { name: 'Pooja Malhotra', smashes: 6, spikes: 7, saves: 9 },
      { name: 'Aditya Mishra', smashes: 8, spikes: 5, saves: 7 },
      { name: 'Riya Saxena', smashes: 5, spikes: 8, saves: 11 }
    ]
  }
];

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🏐 Starting VolleyBank database seeding...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await client.query('DELETE FROM earnings');
    await client.query('DELETE FROM match_players');
    await client.query('DELETE FROM matches');
    await client.query('DELETE FROM users');
    
    // Create admin user
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminId = uuidv4();
    
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, role, team)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [adminId, 'Rajesh Kumar (Admin)', 'admin@volleybank.com', adminPassword, 'admin', null]);
    
    // Create player users
    console.log('🏐 Creating player users...');
    const playerIds = {};
    const playerPassword = await bcrypt.hash('player123', 12);
    
    for (const player of indianPlayers) {
      const playerId = uuidv4();
      playerIds[player.name] = playerId;
      
      await client.query(`
        INSERT INTO users (id, name, email, password_hash, role, team)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [playerId, player.name, player.email, playerPassword, 'player', player.team]);
    }
    
    console.log(`✅ Created ${indianPlayers.length} players and 1 admin`);
    
    // Create matches and related data
    console.log('🏆 Creating sample matches...');
    
    for (let i = 0; i < sampleMatches.length; i++) {
      const match = sampleMatches[i];
      const matchId = uuidv4();
      
      // Create match
      await client.query(`
        INSERT INTO matches (id, date, winning_team, stake_amount, created_by)
        VALUES ($1, $2, $3, $4, $5)
      `, [matchId, match.date, match.winningTeam, match.stakeAmount, adminId]);
      
      // Add players to match with stats
      for (const player of match.players) {
        const playerId = playerIds[player.name];
        if (playerId) {
          await client.query(`
            INSERT INTO match_players (match_id, player_id, role, smashes, spikes, saves)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [matchId, playerId, 'Player', player.smashes, player.spikes, player.saves]);
        }
      }
      
      // Calculate and add earnings for winning team
      const winningPlayers = match.players.filter(p => {
        const playerTeam = indianPlayers.find(ip => ip.name === p.name)?.team;
        return playerTeam === match.winningTeam;
      });
      
      const earningsPerPlayer = match.stakeAmount / winningPlayers.length;
      
      for (const player of winningPlayers) {
        const playerId = playerIds[player.name];
        if (playerId) {
          await client.query(`
            INSERT INTO earnings (player_id, match_id, amount_earned)
            VALUES ($1, $2, $3)
          `, [playerId, matchId, earningsPerPlayer.toFixed(2)]);
        }
      }
      
      console.log(`✅ Match ${i + 1}: ${match.winningTeam} won ₹${match.stakeAmount} (₹${earningsPerPlayer.toFixed(2)} per player)`);
    }
    
    // Display summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Players created: ${indianPlayers.length}`);
    console.log(`🏆 Matches created: ${sampleMatches.length}`);
    console.log(`💰 Total stakes distributed: ₹${sampleMatches.reduce((sum, m) => sum + m.stakeAmount, 0)}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@volleybank.com / admin123');
    console.log('Player Example: arjun.sharma@gmail.com / player123');
    console.log('(All players use password: player123)');
    
    console.log('\n🏐 Teams:');
    console.log('Team A: 6 players');
    console.log('Team B: 6 players');
    console.log('Team C: 6 players');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🏁 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase }; 