# Sequence Diagrams - API Interaction Flows
## PlayPot - System Communication Patterns

**Document Version:** 1.0  
**Date:** January 2025  
**Created by:** Development Team

---

## 1. Overview

This document presents Sequence Diagrams for PlayPot's API interactions between the React frontend, Supabase services, and PostgreSQL database. These diagrams show the temporal flow of messages and data exchange patterns.

---

## 2. Core API Interaction Sequences

### 2.1 User Authentication Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant RC as React Component
    participant AH as AuthHook
    participant SC as Supabase Client
    participant SA as Supabase Auth
    participant PG as PostgreSQL
    
    Note over U,PG: User Login Flow
    
    U->>RC: Enter email/password
    RC->>AH: signIn(email, password)
    AH->>SC: auth.signInWithPassword()
    SC->>SA: Authenticate credentials
    SA->>PG: Verify user record
    PG-->>SA: User data
    SA-->>SC: Auth session + user
    SC-->>AH: { user, session, error }
    AH-->>RC: Update auth state
    RC-->>U: Redirect to dashboard
    
    Note over U,PG: Auto Session Refresh
    
    SC->>SA: Session expires
    SA->>SC: Trigger refresh
    SC->>AH: onAuthStateChange
    AH->>RC: Update auth state
    
    Note over U,PG: User Logout Flow
    
    U->>RC: Click logout
    RC->>AH: signOut()
    AH->>SC: auth.signOut()
    SC->>SA: Invalidate session
    SA-->>SC: Success
    SC-->>AH: Session cleared
    AH-->>RC: Clear user state
    RC-->>U: Redirect to login
```

### 2.2 Match Creation Sequence

```mermaid
sequenceDiagram
    participant A as Admin
    participant MC as MatchComponent
    participant MH as useMatches Hook
    participant MS as MatchService
    participant SC as Supabase Client
    participant PG as PostgreSQL
    
    Note over A,PG: Load Teams for Match Creation
    
    A->>MC: Navigate to create match
    MC->>MH: Load available teams
    MH->>MS: getActiveTeams()
    MS->>SC: from('teams').select().eq('active', true)
    SC->>PG: SELECT * FROM teams WHERE active = true
    PG-->>SC: Team records
    SC-->>MS: Teams data
    MS-->>MH: Formatted teams
    MH-->>MC: Update teams state
    MC-->>A: Show team selection
    
    Note over A,PG: Create Match Process
    
    A->>MC: Fill form & submit
    MC->>MH: createMatch(formData)
    MH->>MS: create(matchData)
    
    Note over MS,PG: Database Transaction
    
    MS->>SC: Begin transaction
    SC->>PG: BEGIN TRANSACTION
    
    MS->>SC: Insert match record
    SC->>PG: INSERT INTO matches (...)
    PG-->>SC: Match ID
    
    MS->>SC: Insert match_teams records
    SC->>PG: INSERT INTO match_teams (...)
    PG-->>SC: Success
    
    MS->>SC: Commit transaction
    SC->>PG: COMMIT
    PG-->>SC: Transaction committed
    
    SC-->>MS: Match created
    MS-->>MH: Success response
    MH-->>MC: Update matches state
    MC-->>A: Show success message
    
    Note over A,PG: Error Handling
    
    alt Database Error
        PG-->>SC: Error response
        SC->>PG: ROLLBACK
        SC-->>MS: Error details
        MS-->>MH: Error response
        MH-->>MC: Error state
        MC-->>A: Show error message
    end
```

### 2.3 Match Result Recording and Financial Distribution

```mermaid
sequenceDiagram
    participant A as Admin
    participant MC as MatchComponent
    participant MH as useMatches Hook
    participant MS as MatchService
    participant FS as FinancialService
    participant SC as Supabase Client
    participant PG as PostgreSQL
    participant NS as NotificationService
    
    Note over A,PG: Record Match Result
    
    A->>MC: Select winning team
    MC->>MH: recordResult(matchId, winningTeamId)
    MH->>MS: recordMatchResult(matchId, winningTeamId)
    
    Note over MS,PG: Complex Transaction
    
    MS->>SC: Begin transaction
    SC->>PG: BEGIN TRANSACTION
    
    MS->>SC: Update match record
    SC->>PG: UPDATE matches SET winning_team_id=?, status='completed'
    PG-->>SC: Match updated
    
    MS->>FS: distributeStakes(matchId)
    
    Note over FS,PG: Financial Distribution Logic
    
    FS->>SC: Get match details
    SC->>PG: SELECT total_pot FROM matches WHERE id=?
    PG-->>SC: Total pot amount
    
    FS->>SC: Get winning team players
    SC->>PG: SELECT * FROM players WHERE team_id=? AND active=true
    PG-->>SC: Player list
    
    FS->>SC: Calculate earnings per player
    Note over FS: earnings = total_pot / player_count
    
    loop For each winning player
        FS->>SC: Update player earnings
        SC->>PG: UPDATE players SET total_earnings = total_earnings + ?
        PG-->>SC: Player updated
        
        FS->>SC: Create transaction record
        SC->>PG: INSERT INTO transactions (player_id, amount, type, ...)
        PG-->>SC: Transaction logged
    end
    
    MS->>SC: Commit transaction
    SC->>PG: COMMIT
    PG-->>SC: All changes committed
    
    SC-->>FS: Distribution successful
    FS-->>MS: Success
    MS-->>MH: Success response
    MH-->>MC: Update match state
    MC-->>A: Show success message
    
    Note over A,PG: Send Notifications
    
    MS->>NS: sendEarningsNotification(players)
    NS->>SC: Real-time channel publish
    SC-->>NS: Notifications sent
    
    Note over A,PG: Error Rollback
    
    alt Distribution Error
        PG-->>SC: Error in transaction
        SC->>PG: ROLLBACK
        SC-->>FS: Error response
        FS-->>MS: Distribution failed
        MS-->>MH: Error response
        MH-->>MC: Error state
        MC-->>A: Show error + retry option
    end
```

### 2.4 Player Statistics Entry Sequence

```mermaid
sequenceDiagram
    participant A as Admin
    participant SC as StatsComponent
    participant SH as useStats Hook
    participant SS as StatsService
    participant MS as MatchService
    participant SUP as Supabase Client
    participant PG as PostgreSQL
    
    Note over A,PG: Load Match Players
    
    A->>SC: Select match for stats entry
    SC->>SH: loadMatchPlayers(matchId)
    SH->>MS: getMatchParticipants(matchId)
    
    MS->>SUP: Complex query for players
    SUP->>PG: SELECT p.*, t.name as team_name FROM players p JOIN...
    PG-->>SUP: Player data with teams
    SUP-->>MS: Formatted player list
    MS-->>SH: Players data
    SH-->>SC: Update players state
    SC-->>A: Show stats entry form
    
    Note over A,PG: Enter Statistics
    
    A->>SC: Fill stats for all players
    SC->>SH: submitStats(matchId, playerStats)
    SH->>SS: createPlayerStats(statsData)
    
    Note over SS,PG: Validation & Transaction
    
    SS->>SUP: Validate MVP selection
    SUP->>PG: SELECT COUNT(*) FROM player_stats WHERE match_id=? AND is_mvp=true
    PG-->>SUP: MVP count
    
    alt MVP validation fails
        SUP-->>SS: Error: Multiple MVPs
        SS-->>SH: Validation error
        SH-->>SC: Show error
        SC-->>A: Highlight MVP conflict
    else MVP validation passes
        SS->>SUP: Begin transaction
        SUP->>PG: BEGIN TRANSACTION
        
        loop For each player's stats
            SS->>SUP: Insert player stats
            SUP->>PG: INSERT INTO player_stats (match_id, player_id, ...)
            PG-->>SUP: Stats inserted
            
            SS->>SUP: Update player aggregates
            SUP->>PG: UPDATE players SET total_matches = total_matches + 1, ...
            PG-->>SUP: Player updated
        end
        
        SS->>SUP: Commit transaction
        SUP->>PG: COMMIT
        PG-->>SUP: Transaction committed
        
        SUP-->>SS: All stats saved
        SS-->>SH: Success response
        SH-->>SC: Update stats state
        SC-->>A: Show success message
    end
```

### 2.5 Real-time Data Subscription Sequence

```mermaid
sequenceDiagram
    participant C1 as Client 1 (Admin)
    participant C2 as Client 2 (Mobile)
    participant SC1 as Supabase Client 1
    participant SC2 as Supabase Client 2
    participant RT as Supabase Realtime
    participant PG as PostgreSQL
    
    Note over C1,PG: Setup Subscriptions
    
    C1->>SC1: Subscribe to matches table
    SC1->>RT: channel('matches').on('UPDATE')
    RT-->>SC1: Subscription active
    
    C2->>SC2: Subscribe to player_stats table
    SC2->>RT: channel('player_stats').on('INSERT')
    RT-->>SC2: Subscription active
    
    Note over C1,PG: Data Change Event
    
    C1->>SC1: Record match result
    SC1->>PG: UPDATE matches SET winning_team_id=...
    PG->>RT: Trigger change notification
    
    Note over C1,PG: Real-time Propagation
    
    RT->>SC1: Match update event
    RT->>SC2: Match update event
    
    SC1->>C1: onUpdate callback
    SC2->>C2: onUpdate callback
    
    C1->>C1: Update local state
    C2->>C2: Update local state
    
    Note over C1,PG: UI Re-rendering
    
    C1->>C1: Re-render match list
    C2->>C2: Update mobile dashboard
    
    Note over C1,PG: Connection Handling
    
    alt Connection Lost
        RT->>SC2: Connection dropped
        SC2->>C2: Handle disconnection
        C2->>C2: Show offline indicator
        
        RT->>SC2: Connection restored
        SC2->>C2: Sync missed updates
        C2->>C2: Remove offline indicator
    end
```

### 2.6 Leaderboard Generation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant LC as LeaderboardComponent
    participant SH as useStats Hook
    participant SS as StatsService
    participant CS as CacheService
    participant SC as Supabase Client
    participant PG as PostgreSQL
    
    Note over U,PG: Load Leaderboard
    
    U->>LC: Select leaderboard type
    LC->>SH: getLeaderboard(type, filters)
    SH->>SS: fetchLeaderboard(type, filters)
    
    Note over SS,PG: Check Cache First
    
    SS->>CS: getCachedLeaderboard(key)
    
    alt Cache Hit
        CS-->>SS: Cached data
        SS-->>SH: Return cached results
        SH-->>LC: Update leaderboard state
        LC-->>U: Display results
    else Cache Miss
        SS->>SC: Execute complex query
        
        Note over SC,PG: Complex Aggregation Query
        
        SC->>PG: SELECT p.*, t.name, SUM(ps.smashes) as total_smashes...
        Note over PG: FROM players p JOIN teams t ON... GROUP BY... ORDER BY...
        PG-->>SC: Aggregated results
        
        SC-->>SS: Raw query results
        SS->>SS: Format and rank data
        SS->>CS: cacheLeaderboard(key, data)
        SS-->>SH: Formatted leaderboard
        SH-->>LC: Update state
        LC-->>U: Display results
    end
    
    Note over U,PG: Filter Changes
    
    U->>LC: Change filters
    LC->>SH: getLeaderboard(type, newFilters)
    SH->>SS: fetchLeaderboard(type, newFilters)
    
    Note over SS: New cache key generated
    
    SS->>CS: getCachedLeaderboard(newKey)
    CS-->>SS: Cache miss (different filters)
    SS->>SC: Execute filtered query
    SC->>PG: SELECT ... WHERE match_date BETWEEN...
    PG-->>SC: Filtered results
    SC-->>SS: Query results
    SS-->>SH: Updated leaderboard
    SH-->>LC: Update state
    LC-->>U: Show filtered results
```

### 2.7 Error Handling and Retry Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant H as Hook
    participant S as Service
    participant SC as Supabase Client
    participant PG as PostgreSQL
    
    Note over U,PG: Operation with Error
    
    U->>C: Trigger action
    C->>H: performAction()
    H->>S: apiCall()
    S->>SC: Database operation
    SC->>PG: SQL query
    
    Note over PG: Network/DB Error
    PG-->>SC: Connection timeout
    SC-->>S: Error response
    S->>S: Log error details
    S->>S: Determine retry strategy
    
    alt Retryable Error
        S->>S: Wait with exponential backoff
        S->>SC: Retry operation
        SC->>PG: Retry SQL query
        
        alt Retry Success
            PG-->>SC: Success response
            SC-->>S: Success data
            S-->>H: Success result
            H-->>C: Update state
            C-->>U: Show success
        else Retry Failed
            PG-->>SC: Still failing
            SC-->>S: Error response
            S-->>H: Final error
            H-->>C: Error state
            C-->>U: Show error + manual retry
        end
    else Non-retryable Error
        S-->>H: Immediate error
        H-->>C: Error state
        C-->>U: Show error message
    end
    
    Note over U,PG: Manual Retry
    
    U->>C: Click retry button
    C->>H: retryAction()
    H->>S: apiCall() [fresh attempt]
    S->>SC: Database operation
    SC->>PG: SQL query
    PG-->>SC: Success response
    SC-->>S: Success data
    S-->>H: Success result
    H-->>C: Update state
    C-->>U: Success feedback
```

### 2.8 Mobile-Optimized API Sequence

```mermaid
sequenceDiagram
    participant M as Mobile User
    participant MC as Mobile Component
    participant MH as Mobile Hook
    participant CS as CacheService
    participant SC as Supabase Client
    participant PG as PostgreSQL
    
    Note over M,PG: Mobile App Launch
    
    M->>MC: App opens
    MC->>MH: Initialize data
    MH->>CS: getCachedData()
    CS-->>MH: Cached dashboard data
    MH-->>MC: Show cached content
    MC-->>M: Instant UI (cached)
    
    Note over M,PG: Background Sync
    
    MH->>SC: Sync latest data
    SC->>PG: SELECT ... WHERE updated_at > last_sync
    PG-->>SC: New/updated records
    SC-->>MH: Delta updates
    MH->>CS: updateCache(deltaData)
    MH-->>MC: Update UI incrementally
    MC-->>M: Fresh data (seamless)
    
    Note over M,PG: Offline Capability
    
    M->>MC: User action (offline)
    MC->>MH: queueAction(action)
    MH->>CS: storeOfflineAction(action)
    MH-->>MC: Optimistic UI update
    MC-->>M: Immediate feedback
    
    Note over M,PG: Connection Restored
    
    MH->>SC: Connection detected
    MH->>CS: getQueuedActions()
    CS-->>MH: Offline actions
    
    loop For each queued action
        MH->>SC: Execute action
        SC->>PG: Database operation
        PG-->>SC: Success/error
        SC-->>MH: Result
        
        alt Success
            MH->>CS: removeFromQueue(action)
            MH-->>MC: Confirm action
        else Error
            MH->>CS: markActionFailed(action)
            MH-->>MC: Show conflict resolution
        end
    end
```

---

## 3. Security and Authorization Sequences

### 3.1 Row Level Security (RLS) Enforcement

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant SC as Supabase Client
    participant RLS as Row Level Security
    participant PG as PostgreSQL
    
    Note over U,PG: Authenticated Request
    
    U->>C: Request team data
    C->>SC: from('teams').select()
    SC->>RLS: Check user permissions
    RLS->>PG: Get user context (auth.uid())
    PG-->>RLS: User ID confirmed
    
    RLS->>PG: Apply RLS policy
    Note over PG: WHERE created_by = auth.uid() OR team_visibility = 'public'
    PG-->>RLS: Filtered results
    RLS-->>SC: Authorized data only
    SC-->>C: Safe data
    C-->>U: Display allowed data
    
    Note over U,PG: Unauthorized Attempt
    
    U->>C: Try to modify other user's team
    C->>SC: update('teams').eq('id', teamId)
    SC->>RLS: Check update permissions
    RLS->>PG: Verify ownership
    PG-->>RLS: User not owner
    RLS-->>SC: Permission denied
    SC-->>C: Error: Unauthorized
    C-->>U: Show permission error
```

### 3.2 API Rate Limiting Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant RL as Rate Limiter
    participant SC as Supabase Client
    participant PG as PostgreSQL
    
    Note over U,PG: Normal Request
    
    U->>C: API request
    C->>RL: Check rate limit
    RL->>RL: Increment request counter
    RL-->>C: Request allowed
    C->>SC: Proceed with request
    SC->>PG: Database operation
    PG-->>SC: Response
    SC-->>C: Data
    C-->>U: Success
    
    Note over U,PG: Rate Limit Exceeded
    
    U->>C: Rapid API requests
    C->>RL: Check rate limit
    RL->>RL: Counter exceeds limit
    RL-->>C: Rate limit exceeded
    C-->>U: Show rate limit message
    C->>C: Queue request for later
    
    Note over U,PG: Rate Limit Reset
    
    RL->>RL: Time window resets
    C->>RL: Retry queued request
    RL-->>C: Request allowed
    C->>SC: Execute queued request
    SC->>PG: Database operation
    PG-->>SC: Response
    SC-->>C: Data
    C-->>U: Delayed success
```

---

## 4. Performance Optimization Sequences

### 4.1 Data Prefetching Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant PF as Prefetcher
    participant CS as CacheService
    participant SC as Supabase Client
    participant PG as PostgreSQL
    
    Note over U,PG: Predictive Loading
    
    U->>C: View teams page
    C->>PF: prefetchRelatedData()
    
    par Prefetch Players
        PF->>SC: Prefetch players for visible teams
        SC->>PG: SELECT players WHERE team_id IN (...)
        PG-->>SC: Players data
        SC-->>PF: Players loaded
        PF->>CS: cachePlayersData()
    and Prefetch Match History
        PF->>SC: Prefetch recent matches
        SC->>PG: SELECT matches WHERE teams participated
        PG-->>SC: Matches data
        SC-->>PF: Matches loaded
        PF->>CS: cacheMatchesData()
    end
    
    Note over U,PG: Instant Navigation
    
    U->>C: Navigate to players page
    C->>CS: getCachedPlayers()
    CS-->>C: Instant data
    C-->>U: No loading spinner needed
```

### 4.2 Batch Operations Sequence

```mermaid
sequenceDiagram
    participant A as Admin
    participant C as Component
    participant BM as BatchManager
    participant SC as Supabase Client
    participant PG as PostgreSQL
    
    Note over A,PG: Multiple Stats Entry
    
    A->>C: Enter stats for 10 players
    C->>BM: batchCreateStats(playerStats[])
    BM->>BM: Validate all stats
    BM->>BM: Group by operation type
    
    BM->>SC: Begin transaction
    SC->>PG: BEGIN TRANSACTION
    
    BM->>SC: Batch insert player_stats
    SC->>PG: INSERT INTO player_stats VALUES (...), (...), (...)
    PG-->>SC: Batch insert complete
    
    BM->>SC: Batch update player aggregates
    SC->>PG: UPDATE players SET total_matches = total_matches + 1 WHERE id IN (...)
    PG-->>SC: Batch update complete
    
    BM->>SC: Commit transaction
    SC->>PG: COMMIT
    PG-->>SC: Transaction committed
    
    SC-->>BM: All operations successful
    BM-->>C: Batch operation complete
    C-->>A: Show bulk success message
```

---

## 5. Integration Testing Sequences

### 5.1 End-to-End Test Sequence

```mermaid
sequenceDiagram
    participant T as Test Suite
    participant API as Test API Client
    participant SC as Supabase Client
    participant PG as Test Database
    
    Note over T,PG: Test Setup
    
    T->>API: Setup test data
    API->>SC: Create test teams
    SC->>PG: INSERT test teams
    PG-->>SC: Teams created
    
    API->>SC: Create test players
    SC->>PG: INSERT test players
    PG-->>SC: Players created
    
    Note over T,PG: Test Execution
    
    T->>API: Create match with test teams
    API->>SC: POST /api/matches
    SC->>PG: INSERT match + match_teams
    PG-->>SC: Match created
    SC-->>API: Match ID
    API-->>T: Test assertion passed
    
    T->>API: Record match result
    API->>SC: PUT /api/matches/:id/result
    SC->>PG: UPDATE match + distribute stakes
    PG-->>SC: Result recorded
    SC-->>API: Success
    API-->>T: Financial test passed
    
    Note over T,PG: Test Cleanup
    
    T->>API: Cleanup test data
    API->>SC: DELETE test records
    SC->>PG: DELETE FROM ... WHERE test_marker = true
    PG-->>SC: Cleanup complete
    SC-->>API: Clean database
    API-->>T: Test environment reset
```

---

## 6. Monitoring and Logging Sequences

### 6.1 Performance Monitoring Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant PM as Performance Monitor
    participant LS as Logging Service
    participant AS as Analytics Service
    
    Note over U,AS: Performance Tracking
    
    U->>C: User action
    C->>PM: startTimer('action_name')
    PM->>PM: Record start time
    
    C->>C: Execute action
    Note over C: API calls, rendering, etc.
    
    C->>PM: endTimer('action_name')
    PM->>PM: Calculate duration
    PM->>LS: logPerformance(action, duration)
    LS->>AS: sendMetrics(performanceData)
    
    AS->>AS: Analyze performance trends
    
    alt Performance Degradation
        AS->>LS: Alert: Slow performance detected
        LS->>PM: Trigger performance investigation
        PM->>C: Enable detailed profiling
    end
```

---

**Sequence Diagrams Status:** ✅ Complete  
**Next Step:** Data Flow Diagram for system overview  
**API Patterns:** Ready for implementation 