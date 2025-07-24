# VolleyBank 🏐💰

A complete volleyball match stake & performance tracking web application for 3 local teams.

## 📝 Project Description

VolleyBank is a **match stake & performance tracker** designed for volleyball communities where:
- **Admins** record match wins and distribute stakes (money) among players
- **Players** can check their earnings, view match history, and track performance stats
- Supports authentication, player statistics, leaderboards, and earnings dashboard

## 🔧 Tech Stack

- **Frontend**: React.js with React Router & TailwindCSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with pg library
- **Authentication**: JWT + Bcrypt
- **API Testing**: Postman
- **Deployment**: Vercel (Frontend), Render/Railway (Backend + PostgreSQL)

## 🧱 Project Structure

```
/volleybank
├── /client (React app)
│   ├── /pages (Home, Login, PlayerDashboard, AdminDashboard)
│   ├── /components (Navbar, MatchForm, StatCard, EarningsTable)
│   ├── /services (API calls)
│   ├── App.jsx
│   └── index.js
└── /server (Express backend)
    ├── /routes (authRoutes.js, matchRoutes.js, statRoutes.js)
    ├── /controllers
    ├── /models (userModel.js, matchModel.js, statModel.js)
    ├── /middleware (auth.js, errorHandler.js)
    ├── /config (db.js)
    └── server.js
```

## 👤 User Roles

### Admin:
- ✅ Login via JWT authentication
- ✅ Add match results (winning team, stake amount)
- ✅ Assign team members who played
- ✅ Update performance stats (smashes, spikes, saves)
- ✅ View total collection & stats leaderboard

### Player:
- ✅ Login via JWT authentication
- ✅ View personal stats & earnings
- ✅ View match history
- ✅ View leaderboard rankings

## 📄 API Endpoints

| Feature         | Endpoint                  | Method | Description                    |
|-----------------|---------------------------|--------|--------------------------------|
| Register        | `/api/auth/register`      | POST   | User registration              |
| Login           | `/api/auth/login`         | POST   | User authentication            |
| Add Match       | `/api/match`              | POST   | Create new match record        |
| Get Matches     | `/api/match`              | GET    | Retrieve match list            |
| Add Stats       | `/api/stats/:playerId`    | POST   | Update player performance      |
| Get Player Data | `/api/player/:id`         | GET    | Retrieve player information    |
| Get Leaderboard | `/api/leaderboard`        | GET    | Retrieve rankings              |

## 🗄️ Database Schema

### Users Table
```sql
id (UUID PRIMARY KEY)
name (VARCHAR)
email (VARCHAR UNIQUE)
password_hash (VARCHAR)
role (ENUM: admin/player)
team (VARCHAR)
created_at (TIMESTAMP)
```

### Matches Table
```sql
id (UUID PRIMARY KEY)
date (DATE)
winning_team (VARCHAR)
stake_amount (DECIMAL)
created_at (TIMESTAMP)
```

### MatchPlayers Table
```sql
id (UUID PRIMARY KEY)
match_id (UUID FOREIGN KEY)
player_id (UUID FOREIGN KEY)
role (VARCHAR)
smashes (INTEGER)
spikes (INTEGER)
saves (INTEGER)
```

### Earnings Table
```sql
id (UUID PRIMARY KEY)
player_id (UUID FOREIGN KEY)
match_id (UUID FOREIGN KEY)
amount_earned (DECIMAL)
created_at (TIMESTAMP)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your database and JWT settings in .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Database Setup
```bash
# Create PostgreSQL database
createdb volleybank

# Run migrations
npm run migrate
```

## 🔧 Environment Variables

Create `.env` file in `/server`:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/volleybank
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## 💡 Sample Match Object

```json
{
  "matchId": "uuid",
  "winningTeam": "Team A",
  "stakeAmount": 300,
  "players": [
    {
      "name": "Mitya",
      "role": "Striker",
      "smashes": 5,
      "spikes": 3,
      "saves": 2
    }
  ],
  "date": "2025-01-23"
}
```

## 🎯 Development Guidelines

- ✅ Use proper error handling and input validation
- ✅ Use async/await + try/catch in all routes
- ✅ Environment variables for sensitive data
- ✅ Modular components and API calls
- ✅ TailwindCSS for all styling (no Material UI/Bootstrap)
- ✅ Comment complex logic and write clean code
- ✅ Follow RESTful API conventions

## 📊 Features

### Admin Dashboard
- Match creation form
- Player stats management
- Earnings distribution
- Performance tracking

### Player Dashboard
- Personal statistics view
- Earnings history
- Match participation record
- Leaderboard standings

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🧪 Testing

- API testing with Postman
- Unit tests for critical functions
- Integration tests for database operations
- Frontend component testing

---

**Built with ❤️ for the volleyball community** 