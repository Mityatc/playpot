const { pool } = require('./config/db');

async function testData() {
  const client = await pool.connect();
  
  try {
    console.log('🏐 Testing VolleyBank Database...\n');
    
    // Check users
    const usersResult = await client.query('SELECT COUNT(*) as total, role FROM users GROUP BY role');
    console.log('👥 Users in database:');
    usersResult.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.total} users`);
    });
    
    // Check some player names
    const playersResult = await client.query('SELECT name, team FROM users WHERE role = $1 LIMIT 5', ['player']);
    console.log('\n🏐 Sample Players:');
    playersResult.rows.forEach(player => {
      console.log(`   ${player.name} (${player.team})`);
    });
    
    // Check matches
    const matchesResult = await client.query('SELECT COUNT(*) as total FROM matches');
    console.log(`\n🏆 Matches: ${matchesResult.rows[0].total} matches in database`);
    
    // Check earnings
    const earningsResult = await client.query(`
      SELECT 
        u.name, 
        u.team, 
        SUM(e.amount_earned) as total_earnings 
      FROM earnings e 
      JOIN users u ON e.player_id = u.id 
      GROUP BY u.id, u.name, u.team 
      ORDER BY total_earnings DESC 
      LIMIT 5
    `);
    
    console.log('\n💰 Top Earners:');
    earningsResult.rows.forEach(player => {
      console.log(`   ${player.name} (${player.team}): ₹${player.total_earnings}`);
    });
    
    // Check if admin exists
    const adminResult = await client.query('SELECT name, email FROM users WHERE role = $1', ['admin']);
    if (adminResult.rows.length > 0) {
      console.log(`\n👨‍💼 Admin Account: ${adminResult.rows[0].name} (${adminResult.rows[0].email})`);
    }
    
    console.log('\n✅ Database test completed successfully!');
    console.log('\n🔑 Test Login Credentials:');
    console.log('Admin: admin@volleybank.com / admin123');
    console.log('Player: arjun.sharma@gmail.com / player123');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

testData(); 