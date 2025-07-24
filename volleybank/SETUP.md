# VolleyBank Setup Instructions 🏐💰

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn

## Quick Start

### 1. Database Setup
First, create a PostgreSQL database:
```sql
CREATE DATABASE volleybank;
CREATE USER volleybank_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE volleybank TO volleybank_user;
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://volleybank_user:your_password@localhost:5432/volleybank
# JWT_SECRET=your_super_secret_jwt_key

# Start the server
npm run dev
```

The backend will start on http://localhost:5000

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will start on http://localhost:3000

## Default Admin Account
Create an admin account by registering with:
- **Role**: Admin
- **Email**: admin@volleybank.com
- **Password**: password (or your choice)

## Features Available

### ✅ Completed Backend API
- **Authentication**: JWT-based auth with bcrypt password hashing
- **User Management**: Register, login, profile management
- **Match Management**: Create, list, update volleyball matches
- **Player Statistics**: Track smashes, spikes, saves for each player
- **Earnings Tracking**: Automatic stake distribution to winning teams
- **Leaderboards**: Player and team rankings by earnings and performance
- **Database**: PostgreSQL with proper relationships and constraints

### ✅ Completed Frontend
- **Authentication**: Login/register forms with role-based access
- **Admin Dashboard**: Match creation, player management, statistics
- **Player Dashboard**: Personal stats, earnings, match history
- **Leaderboards**: Player and team rankings
- **Match History**: Complete match records with filtering
- **Responsive Design**: Mobile-optimized for volleyball courts
- **Modern UI**: TailwindCSS with volleyball-themed styling

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/players` - Get all players (admin only)

### Matches
- `POST /api/match` - Create new match (admin only)
- `GET /api/match` - Get all matches
- `GET /api/match/:id` - Get specific match
- `GET /api/match/recent` - Get recent matches
- `GET /api/match/stats` - Get match statistics

### Players
- `GET /api/player/:id` - Get player details
- `GET /api/player/:id/stats` - Get player statistics
- `GET /api/player/:id/earnings` - Get player earnings

### Statistics
- `POST /api/stats/:playerId` - Update player stats (admin only)
- `GET /api/stats/leaderboard` - Get player leaderboard
- `GET /api/stats/leaderboard/teams` - Get team leaderboard

## Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with pg library
- **Authentication**: JWT + Bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: React.js with Vite
- **Routing**: React Router DOM
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Database Schema

### Tables
- **users**: Player and admin information
- **matches**: Volleyball match records
- **match_players**: Player participation in matches
- **earnings**: Financial distributions to players

### Key Features
- UUID primary keys for security
- Foreign key constraints for data integrity
- Indexes for performance optimization
- Automatic timestamp tracking

## Development Commands

### Backend
```bash
npm run dev       # Start development server with nodemon
npm start         # Start production server
npm test          # Run tests
```

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Deployment

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy automatically

### Frontend Deployment (Vercel/Netlify)
1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set build command: `npm run build`
4. Deploy automatically

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Port Conflicts**: Change ports in .env files if needed
3. **CORS Issues**: Verify CLIENT_URL in backend .env matches frontend URL
4. **Dependencies**: Run `npm install` in both server and client directories

### Environment Variables
Ensure all required environment variables are set:
- Backend: DATABASE_URL, JWT_SECRET, CLIENT_URL
- Frontend: VITE_API_URL (optional, defaults to localhost:5000)

## Next Steps

### Phase 5 - Production Enhancements
1. Real-time match updates with WebSockets
2. Match scheduling and notifications
3. Photo uploads for match results
4. Advanced analytics and reporting
5. Mobile app development
6. Payment integration for stakes

---

**Built with ❤️ for the volleyball community**

For support or questions, please check the API documentation or create an issue on GitHub. 