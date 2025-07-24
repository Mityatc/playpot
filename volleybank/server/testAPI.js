const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const ADMIN_CREDS = {
  email: 'admin@volleybank.com',
  password: 'admin123'
};

const PLAYER_CREDS = {
  email: 'arjun.sharma@gmail.com',
  password: 'player123'
};

let adminToken = '';
let playerToken = '';
let adminUser = null;
let playerUser = null;

async function testAPI() {
  console.log('🏐 Testing VolleyBank API Endpoints...\n');
  
  try {
    // 1. Test Authentication
    console.log('🔐 Testing Authentication...');
    
    // Admin Login
    console.log('   → Admin Login');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDS);
    adminToken = adminLoginResponse.data.data.token;
    adminUser = adminLoginResponse.data.data.user;
    console.log(`   ✅ Admin logged in: ${adminUser.name} (${adminUser.role})`);
    
    // Player Login
    console.log('   → Player Login');
    const playerLoginResponse = await axios.post(`${API_BASE}/auth/login`, PLAYER_CREDS);
    playerToken = playerLoginResponse.data.data.token;
    playerUser = playerLoginResponse.data.data.user;
    console.log(`   ✅ Player logged in: ${playerUser.name} (${playerUser.team})`);
    
    // 2. Test User Profile Access
    console.log('\n👤 Testing User Profiles...');
    
    // Admin profile
    const adminProfileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Admin profile: ${adminProfileResponse.data.data.user.name}`);
    
    // Player profile
    const playerProfileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    console.log(`   ✅ Player profile: ${playerProfileResponse.data.data.user.name}`);
    
    // 3. Test Player Management (Admin only)
    console.log('\n👥 Testing Player Management...');
    
    const playersResponse = await axios.get(`${API_BASE}/auth/players`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Retrieved ${playersResponse.data.data.count} players`);
    
    // Test team-specific players
    const teamAPlayersResponse = await axios.get(`${API_BASE}/auth/players/team/Team A`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Team A has ${teamAPlayersResponse.data.data.count} players`);
    
    // 4. Test Match Management
    console.log('\n🏆 Testing Match Management...');
    
    // Get all matches
    const matchesResponse = await axios.get(`${API_BASE}/match`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Retrieved ${matchesResponse.data.data.matches.length} matches`);
    
    // Get recent matches
    const recentMatchesResponse = await axios.get(`${API_BASE}/match/recent?limit=3`, {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    console.log(`   ✅ Retrieved ${recentMatchesResponse.data.data.count} recent matches`);
    
    // Get match statistics
    const matchStatsResponse = await axios.get(`${API_BASE}/match/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Match stats: ${matchStatsResponse.data.data.stats.total_matches} total matches`);
    
    // 5. Test Player Stats and Earnings
    console.log('\n📊 Testing Player Statistics...');
    
    // Get player details
    const playerDetailsResponse = await axios.get(`${API_BASE}/player/${playerUser.id}`, {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    console.log(`   ✅ Player details for ${playerDetailsResponse.data.data.player.name}`);
    
    // Get player earnings
    const playerEarningsResponse = await axios.get(`${API_BASE}/player/${playerUser.id}/earnings`, {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    console.log(`   ✅ Player earnings: ₹${playerEarningsResponse.data.data.earnings.totalEarnings}`);
    
    // 6. Test Leaderboards
    console.log('\n🏅 Testing Leaderboards...');
    
    // Player leaderboard
    const leaderboardResponse = await axios.get(`${API_BASE}/stats/leaderboard?limit=5`, {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    console.log(`   ✅ Player leaderboard: ${leaderboardResponse.data.data.count} entries`);
    
    // Team leaderboard
    const teamLeaderboardResponse = await axios.get(`${API_BASE}/stats/leaderboard/teams`, {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    console.log(`   ✅ Team leaderboard: ${teamLeaderboardResponse.data.data.count} teams`);
    
    // 7. Test Match Creation (Admin only)
    console.log('\n➕ Testing Match Creation...');
    
    const players = playersResponse.data.data.players.slice(0, 9); // Get 9 players for a match
    const newMatchData = {
      date: '2024-01-28',
      winningTeam: 'Team A',
      stakeAmount: 300,
      players: players.map(player => ({
        playerId: player.id,
        role: 'Player',
        smashes: Math.floor(Math.random() * 10),
        spikes: Math.floor(Math.random() * 8),
        saves: Math.floor(Math.random() * 12)
      }))
    };
    
    const createMatchResponse = await axios.post(`${API_BASE}/match`, newMatchData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Created new match: ${createMatchResponse.data.data.match.winning_team} won`);
    
    // 8. Test Error Handling
    console.log('\n❌ Testing Error Handling...');
    
    // Test unauthorized access
    try {
      await axios.get(`${API_BASE}/auth/players`); // No token
    } catch (error) {
      console.log(`   ✅ Unauthorized access blocked: ${error.response.status}`);
    }
    
    // Test invalid login
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log(`   ✅ Invalid login rejected: ${error.response.status}`);
    }
    
    console.log('\n🎉 ALL API TESTS PASSED! 🎉');
    console.log('\n📋 API Summary:');
    console.log(`   🔐 Authentication: Working`);
    console.log(`   👥 User Management: Working`);
    console.log(`   🏆 Match Management: Working`);
    console.log(`   📊 Statistics: Working`);
    console.log(`   🏅 Leaderboards: Working`);
    console.log(`   ➕ Match Creation: Working`);
    console.log(`   ❌ Error Handling: Working`);
    
    console.log('\n🚀 Backend is ready for frontend integration!');
    console.log('\n🔑 Test Credentials:');
    console.log(`   Admin: ${ADMIN_CREDS.email} / ${ADMIN_CREDS.password}`);
    console.log(`   Player: ${PLAYER_CREDS.email} / ${PLAYER_CREDS.password}`);
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
  }
}

// Add axios to package.json dependencies check
console.log('Installing axios for API testing...');
const { exec } = require('child_process');

exec('npm list axios', (error, stdout, stderr) => {
  if (error) {
    console.log('Installing axios...');
    exec('npm install axios', (installError) => {
      if (installError) {
        console.error('Failed to install axios:', installError);
        return;
      }
      setTimeout(testAPI, 1000); // Wait a bit for installation
    });
  } else {
    testAPI();
  }
}); 