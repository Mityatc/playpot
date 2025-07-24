-- VolleyBank Supabase Database Schema
-- Global Volleyball Management Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table (Multi-tenant support)
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL, -- volleyclub-mumbai, sports-center-delhi
    description TEXT,
    country VARCHAR(50) DEFAULT 'India',
    city VARCHAR(50),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    settings JSONB DEFAULT '{
        "currency": "INR",
        "default_stake": 300,
        "timezone": "Asia/Kolkata",
        "language": "en"
    }'::jsonb,
    subscription_plan VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (Enhanced with Supabase Auth integration)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('admin', 'player', 'manager')) DEFAULT 'player',
    team VARCHAR(50),
    avatar_url TEXT,
    settings JSONB DEFAULT '{
        "notifications": true,
        "theme": "light",
        "language": "en"
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table (Enhanced for real-world usage)
CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) DEFAULT 'Volleyball Match',
    description TEXT,
    match_date DATE NOT NULL,
    match_time TIME,
    location VARCHAR(200),
    winning_team VARCHAR(50) NOT NULL,
    stake_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'completed',
    match_type VARCHAR(30) DEFAULT 'regular', -- regular, tournament, championship
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match players table (Enhanced stats tracking)
CREATE TABLE match_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) DEFAULT 'Player',
    position VARCHAR(30), -- setter, spiker, libero, etc.
    smashes INTEGER DEFAULT 0,
    spikes INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    serves INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    points_scored INTEGER DEFAULT 0,
    performance_rating DECIMAL(3,1), -- 1.0 to 10.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- Earnings table (Enhanced financial tracking)
CREATE TABLE earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    amount_earned DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    earning_type VARCHAR(20) DEFAULT 'match_win', -- match_win, bonus, penalty
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(30), -- cash, upi, bank_transfer
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, match_id, earning_type)
);

-- Tournaments table (For organized competitions)
CREATE TABLE tournaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    max_teams INTEGER DEFAULT 8,
    rules JSONB,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table (Real-time updates)
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info', -- info, success, warning, error, match, earning
    data JSONB, -- Additional data like match_id, amount, etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table (Enhanced team management)
CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    captain_id UUID REFERENCES users(id),
    description TEXT,
    stats JSONB DEFAULT '{
        "matches_played": 0,
        "matches_won": 0,
        "total_earnings": 0
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Create indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_matches_organization ON matches(organization_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_match_players_match ON match_players(match_id);
CREATE INDEX idx_match_players_player ON match_players(player_id);
CREATE INDEX idx_earnings_player ON earnings(player_id);
CREATE INDEX idx_earnings_match ON earnings(match_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for Users
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- RLS Policies for Matches
CREATE POLICY "Users can view matches in their organization" ON matches
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can create matches" ON matches
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- RLS Policies for Match Players
CREATE POLICY "Users can view match players in their organization" ON match_players
    FOR SELECT USING (match_id IN (
        SELECT id FROM matches WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- RLS Policies for Earnings
CREATE POLICY "Users can view their own earnings" ON earnings
    FOR SELECT USING (
        player_id = auth.uid() OR 
        match_id IN (
            SELECT id FROM matches WHERE organization_id IN (
                SELECT organization_id FROM users 
                WHERE id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate match statistics
CREATE OR REPLACE FUNCTION calculate_match_earnings(match_uuid UUID)
RETURNS TABLE(player_id UUID, amount DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.player_id,
        (m.stake_amount / COUNT(*) OVER (PARTITION BY m.winning_team))::DECIMAL(10,2) as amount
    FROM match_players mp
    JOIN matches m ON mp.match_id = m.id
    JOIN users u ON mp.player_id = u.id
    WHERE m.id = match_uuid AND u.team = m.winning_team;
END;
$$ LANGUAGE plpgsql;

-- Sample data for demo organization
INSERT INTO organizations (name, slug, description, city, contact_email) VALUES
('Mumbai Volleyball Club', 'mumbai-volleyball', 'Premier volleyball club in Mumbai', 'Mumbai', 'admin@mumbaivolleyball.com');

-- Sample teams
INSERT INTO teams (organization_id, name, color, description) VALUES
((SELECT id FROM organizations WHERE slug = 'mumbai-volleyball'), 'Team Warriors', '#EF4444', 'The red warriors'),
((SELECT id FROM organizations WHERE slug = 'mumbai-volleyball'), 'Team Eagles', '#3B82F6', 'Soaring high like eagles'),
((SELECT id FROM organizations WHERE slug = 'mumbai-volleyball'), 'Team Lions', '#10B981', 'Fierce and strong');

-- Create views for easy data access
CREATE VIEW player_stats AS
SELECT 
    u.id,
    u.name,
    u.team,
    u.organization_id,
    COUNT(mp.match_id) as matches_played,
    SUM(mp.smashes) as total_smashes,
    SUM(mp.spikes) as total_spikes,
    SUM(mp.saves) as total_saves,
    SUM(mp.points_scored) as total_points,
    COALESCE(SUM(e.amount_earned), 0) as total_earnings,
    COUNT(CASE WHEN m.winning_team = u.team THEN 1 END) as matches_won
FROM users u
LEFT JOIN match_players mp ON u.id = mp.player_id
LEFT JOIN earnings e ON u.id = e.player_id
LEFT JOIN matches m ON mp.match_id = m.id
WHERE u.role = 'player'
GROUP BY u.id, u.name, u.team, u.organization_id;

CREATE VIEW team_leaderboard AS
SELECT 
    t.name as team_name,
    t.organization_id,
    COUNT(DISTINCT m.id) as matches_played,
    COUNT(CASE WHEN m.winning_team = t.name THEN 1 END) as matches_won,
    ROUND(
        COUNT(CASE WHEN m.winning_team = t.name THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT m.id), 0) * 100, 2
    ) as win_percentage,
    COALESCE(SUM(e.amount_earned), 0) as total_earnings
FROM teams t
LEFT JOIN matches m ON t.organization_id = m.organization_id
LEFT JOIN match_players mp ON m.id = mp.match_id
LEFT JOIN users u ON mp.player_id = u.id AND u.team = t.name
LEFT JOIN earnings e ON mp.player_id = e.player_id AND mp.match_id = e.match_id
GROUP BY t.id, t.name, t.organization_id
ORDER BY win_percentage DESC, total_earnings DESC; 