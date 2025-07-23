# Activity Diagrams - Business Process Flows
## PlayPot - Key Volleyball Management Workflows

**Document Version:** 1.0  
**Date:** January 2025  
**Created by:** Development Team

---

## 1. Overview

This document presents Activity Diagrams for PlayPot's core business processes. These diagrams illustrate the step-by-step workflows for managing volleyball matches, teams, players, and financial distributions.

---

## 2. Core Business Processes

### 2.1 Match Creation and Management Process

```mermaid
flowchart TD
    A[Admin logs in] --> B[Navigate to Matches]
    B --> C[Click 'Create Match']
    C --> D[Fill match details form]
    D --> E{Form valid?}
    
    E -->|No| F[Show validation errors]
    F --> D
    
    E -->|Yes| G[Select participating teams]
    G --> H{Min 2 teams selected?}
    
    H -->|No| I[Show error: Need minimum 2 teams]
    I --> G
    
    H -->|Yes| J[Set stake amount per team]
    J --> K[Calculate total pot automatically]
    K --> L[Set match date and time]
    L --> M[Add optional location/notes]
    M --> N[Review match summary]
    N --> O{Confirm creation?}
    
    O -->|No| P[Cancel/Edit]
    P --> D
    
    O -->|Yes| Q[Save match to database]
    Q --> R[Generate match notifications]
    R --> S[Update team participation status]
    S --> T[Redirect to match details]
    T --> U[Match created successfully]
    
    %% Error handling
    Q --> V{Database error?}
    V -->|Yes| W[Show error message]
    W --> X[Log error for debugging]
    X --> D
    V -->|No| S
```

### 2.2 Match Result Recording Process

```mermaid
flowchart TD
    A[Admin selects completed match] --> B[Verify match is in progress/pending]
    B --> C{Match status valid?}
    
    C -->|No| D[Show error: Cannot modify completed match]
    D --> E[Return to matches list]
    
    C -->|Yes| F[Display participating teams]
    F --> G[Select winning team]
    G --> H{Winner selected?}
    
    H -->|No| I[Show validation: Winner required]
    I --> G
    
    H -->|Yes| J[Confirm match result]
    J --> K{Confirm selection?}
    
    K -->|No| L[Cancel selection]
    L --> G
    
    K -->|Yes| M[Update match status to 'completed']
    M --> N[Set winning team ID]
    N --> O[Trigger stake distribution process]
    
    %% Stake Distribution Sub-process
    O --> P[Get winning team players]
    P --> Q[Calculate earnings per player]
    Q --> R[Update player total earnings]
    R --> S[Create transaction records]
    S --> T[Log financial audit trail]
    T --> U[Send earning notifications]
    
    U --> V{Distribution successful?}
    V -->|No| W[Rollback changes]
    W --> X[Show error message]
    X --> Y[Alert admin for manual review]
    
    V -->|Yes| Z[Update match status]
    Z --> AA[Show success message]
    AA --> BB[Redirect to match details]
    BB --> CC[Match result recorded successfully]
```

### 2.3 Player Statistics Entry Process

```mermaid
flowchart TD
    A[Admin selects completed match] --> B[Check if result recorded]
    B --> C{Result recorded?}
    
    C -->|No| D[Show error: Record result first]
    D --> E[Redirect to result recording]
    
    C -->|Yes| F[Load participating players]
    F --> G[Display stats entry form]
    G --> H[For each player]
    
    H --> I[Enter smashes count]
    I --> J[Enter spikes count]
    J --> K[Enter assists count]
    K --> L[Enter blocks count]
    L --> M[Enter aces count]
    M --> N[Enter errors count]
    N --> O[Add optional notes]
    
    O --> P{Designate as MVP?}
    P -->|Yes| Q{MVP already selected?}
    Q -->|Yes| R[Show error: Only one MVP allowed]
    R --> P
    Q -->|No| S[Mark player as MVP]
    
    P -->|No| S
    S --> T{More players?}
    T -->|Yes| H
    
    T -->|No| U[Validate all stats]
    U --> V{Stats valid?}
    
    V -->|No| W[Show validation errors]
    W --> X[Highlight invalid fields]
    X --> I
    
    V -->|Yes| Y[Calculate match earnings per player]
    Y --> Z[Save all player stats]
    Z --> AA[Update player aggregate statistics]
    AA --> BB{Save successful?}
    
    BB -->|No| CC[Show error message]
    CC --> DD[Retain form data]
    DD --> I
    
    BB -->|Yes| EE[Show success message]
    EE --> FF[Update leaderboards]
    FF --> GG[Send performance notifications]
    GG --> HH[Redirect to match summary]
    HH --> II[Stats recorded successfully]
```

### 2.4 Team Creation and Management Process

```mermaid
flowchart TD
    A[Admin navigates to Teams] --> B[Click 'Add Team']
    B --> C[Open team creation form]
    C --> D[Enter team name]
    D --> E{Name already exists?}
    
    E -->|Yes| F[Show error: Team name must be unique]
    F --> D
    
    E -->|No| G[Enter team description optional]
    G --> H{Upload team logo?}
    
    H -->|Yes| I[Select image file]
    I --> J{File size/type valid?}
    J -->|No| K[Show error: Invalid file]
    K --> I
    J -->|Yes| L[Upload to storage]
    
    H -->|No| L
    L --> M[Preview team information]
    M --> N{Confirm creation?}
    
    N -->|No| O[Edit details]
    O --> D
    
    N -->|Yes| P[Save team to database]
    P --> Q{Save successful?}
    
    Q -->|No| R[Show error message]
    R --> S[Retry save operation]
    S --> P
    
    Q -->|Yes| T[Show success message]
    T --> U[Add to teams list]
    U --> V[Enable team for match participation]
    V --> W[Team created successfully]
    
    %% Team Management Actions
    W --> X{Additional actions?}
    X -->|Edit Team| Y[Load edit form]
    Y --> Z[Update team details]
    Z --> P
    
    X -->|Add Players| AA[Navigate to player management]
    AA --> BB[Add players to team]
    
    X -->|View Stats| CC[Show team performance]
    
    X -->|Deactivate| DD[Confirm deactivation]
    DD --> EE[Mark team as inactive]
    EE --> FF[Preserve historical data]
```

### 2.5 Player Transfer Process

```mermaid
flowchart TD
    A[Admin selects player] --> B[Click 'Transfer Player']
    B --> C[Load available teams]
    C --> D[Display current team info]
    D --> E[Select destination team]
    E --> F{Same team selected?}
    
    F -->|Yes| G[Show error: Cannot transfer to same team]
    G --> E
    
    F -->|No| H[Show transfer confirmation]
    H --> I[Display transfer impact]
    I --> J[Preserve player statistics]
    J --> K[Preserve earnings history]
    K --> L{Confirm transfer?}
    
    L -->|No| M[Cancel transfer]
    M --> N[Return to player list]
    
    L -->|Yes| O[Begin transfer transaction]
    O --> P[Update player team_id]
    P --> Q[Log transfer record]
    Q --> R[Update team rosters]
    R --> S[Recalculate team stats]
    S --> T[Send transfer notifications]
    
    T --> U{Transfer successful?}
    U -->|No| V[Rollback changes]
    V --> W[Show error message]
    W --> X[Alert admin for manual review]
    
    U -->|Yes| Y[Show success message]
    Y --> Z[Update player profile]
    Z --> AA[Refresh team rosters]
    AA --> BB[Player transferred successfully]
```

### 2.6 Financial Distribution Algorithm

```mermaid
flowchart TD
    A[Match result recorded] --> B[Get total pot amount]
    B --> C[Get winning team ID]
    C --> D[Query active players in winning team]
    D --> E{Players found?}
    
    E -->|No| F[Log error: No active players]
    F --> G[Alert admin for manual distribution]
    G --> H[Create manual distribution task]
    
    E -->|Yes| I[Count active players]
    I --> J[Calculate earnings per player]
    J --> K[earnings = total_pot / player_count]
    K --> L[Round to 2 decimal places]
    
    L --> M[For each winning player]
    M --> N[Create transaction record]
    N --> O[Update player total_earnings]
    O --> P[Log audit trail]
    P --> Q{More players?}
    
    Q -->|Yes| M
    Q -->|No| R[Verify total distribution]
    R --> S[sum_distributed == total_pot]
    S --> T{Amounts match?}
    
    T -->|No| U[Log discrepancy error]
    U --> V[Rollback all transactions]
    V --> W[Alert admin: Distribution failed]
    
    T -->|Yes| X[Commit all transactions]
    X --> Y[Update match financial status]
    Y --> Z[Send earning notifications]
    Z --> AA[Log successful distribution]
    AA --> BB[Distribution completed]
    
    %% Handle rounding discrepancies
    L --> CC{Rounding discrepancy?}
    CC -->|Yes| DD[Adjust last player earning]
    DD --> EE[Ensure total equals pot]
    EE --> M
    CC -->|No| M
```

### 2.7 Leaderboard Generation Process

```mermaid
flowchart TD
    A[User selects leaderboard type] --> B{Leaderboard type?}
    
    B -->|Earnings| C[Query players by total_earnings DESC]
    B -->|MVPs| D[Query players by total_mvps DESC]
    B -->|Smashes| E[Query player_stats SUM smashes]
    B -->|Spikes| F[Query player_stats SUM spikes]
    B -->|Assists| G[Query player_stats SUM assists]
    
    C --> H[Apply filters if any]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I{Date range filter?}
    I -->|Yes| J[Filter by match dates]
    I -->|No| K[Include all data]
    
    J --> K
    K --> L{Team filter?}
    L -->|Yes| M[Filter by team_id]
    L -->|No| N[Include all teams]
    
    M --> N
    N --> O[Execute optimized query]
    O --> P[Fetch player details]
    P --> Q[Fetch team information]
    Q --> R[Calculate rankings]
    R --> S[Handle tied rankings]
    
    S --> T[Format response data]
    T --> U[Cache results for performance]
    U --> V[Return leaderboard]
    V --> W[Display to user]
    
    %% Error handling
    O --> X{Query error?}
    X -->|Yes| Y[Log database error]
    Y --> Z[Show fallback message]
    Z --> AA[Use cached data if available]
    X -->|No| P
```

### 2.8 User Authentication Flow

```mermaid
flowchart TD
    A[User visits PlayPot] --> B{Already authenticated?}
    
    B -->|Yes| C[Check session validity]
    C --> D{Session valid?}
    D -->|Yes| E[Redirect to Dashboard]
    D -->|No| F[Clear invalid session]
    F --> G[Show login form]
    
    B -->|No| G
    G --> H[Enter email and password]
    H --> I[Submit login form]
    I --> J{Credentials valid?}
    
    J -->|No| K[Show error message]
    K --> L[Increment failed attempts]
    L --> M{Too many attempts?}
    M -->|Yes| N[Lock account temporarily]
    N --> O[Show lockout message]
    M -->|No| G
    
    J -->|Yes| P[Create user session]
    P --> Q[Set authentication tokens]
    Q --> R[Load user profile]
    R --> S[Check user role]
    S --> T{User role?}
    
    T -->|Admin| U[Load admin dashboard]
    T -->|Player| V[Load player dashboard]
    
    U --> W[Enable admin features]
    V --> X[Enable player features]
    
    W --> Y[Show navigation menu]
    X --> Y
    Y --> Z[Authentication completed]
    
    %% Logout flow
    Z --> AA{Logout requested?}
    AA -->|Yes| BB[Clear user session]
    BB --> CC[Clear authentication tokens]
    CC --> DD[Redirect to login]
    DD --> G
    
    %% Password reset
    K --> EE{Forgot password?}
    EE -->|Yes| FF[Enter email for reset]
    FF --> GG[Send reset email]
    GG --> HH[Show confirmation message]
    EE -->|No| G
```

---

## 3. Error Handling and Edge Cases

### 3.1 Database Connection Failures
```mermaid
flowchart TD
    A[User action triggers DB query] --> B[Attempt database connection]
    B --> C{Connection successful?}
    
    C -->|No| D[Log connection error]
    D --> E[Show user-friendly message]
    E --> F[Enable retry button]
    F --> G{Retry clicked?}
    G -->|Yes| B
    G -->|No| H[Use cached data if available]
    
    C -->|Yes| I[Execute query]
    I --> J{Query successful?}
    J -->|No| K[Log query error]
    K --> E
    J -->|Yes| L[Return results]
```

### 3.2 Concurrent User Actions
```mermaid
flowchart TD
    A[User A starts editing match] --> B[Lock match record]
    B --> C[User B tries to edit same match]
    C --> D{Record locked?}
    
    D -->|Yes| E[Show message: Match being edited]
    E --> F[Offer to reload data]
    F --> G{Reload clicked?}
    G -->|Yes| H[Refresh match data]
    G -->|No| I[Return to matches list]
    
    D -->|No| J[Allow edit access]
    J --> K[User A saves changes]
    K --> L[Release lock]
    L --> M[Notify User B of updates]
```

### 3.3 Data Validation Failures
```mermaid
flowchart TD
    A[User submits form] --> B[Client-side validation]
    B --> C{Client validation passed?}
    
    C -->|No| D[Highlight errors]
    D --> E[Show validation messages]
    E --> F[Focus first error field]
    F --> G[User corrects errors]
    G --> A
    
    C -->|Yes| H[Submit to server]
    H --> I[Server-side validation]
    I --> J{Server validation passed?}
    
    J -->|No| K[Return validation errors]
    K --> E
    
    J -->|Yes| L[Process request]
    L --> M[Return success response]
```

---

## 4. Performance Optimization Flows

### 4.1 Data Loading Strategy
```mermaid
flowchart TD
    A[Page loads] --> B[Show loading spinner]
    B --> C[Load critical data first]
    C --> D[Display core content]
    D --> E[Load secondary data]
    E --> F[Update UI progressively]
    F --> G[Cache results]
    G --> H[Enable real-time updates]
```

### 4.2 Real-time Updates Flow
```mermaid
flowchart TD
    A[User opens matches page] --> B[Subscribe to match updates]
    B --> C[Match result recorded elsewhere]
    C --> D[Database triggers notification]
    D --> E[Supabase real-time pushes update]
    E --> F[Client receives update]
    F --> G[Update local state]
    G --> H[Re-render affected components]
    H --> I[Show update notification]
```

---

## 5. Mobile-Specific Workflows

### 5.1 Mobile Match Creation
```mermaid
flowchart TD
    A[User on mobile device] --> B[Tap 'Create Match']
    B --> C[Show full-screen modal]
    C --> D[Step 1: Select teams]
    D --> E[Large touch targets]
    E --> F[Swipe to next step]
    F --> G[Step 2: Enter stakes]
    G --> H[Number pad input]
    H --> I[Swipe to next step]
    I --> J[Step 3: Set date/time]
    J --> K[Native date picker]
    K --> L[Review summary]
    L --> M[Submit with haptic feedback]
```

### 5.2 Mobile Stats Entry
```mermaid
flowchart TD
    A[Admin on mobile] --> B[Select match from list]
    B --> C[Tap 'Enter Stats']
    C --> D[Show horizontal player cards]
    D --> E[Swipe between players]
    E --> F[Tap number inputs]
    F --> G[Number pad appears]
    G --> H[Quick +/- buttons]
    H --> I[Visual feedback on save]
    I --> J[Next player automatically]
```

---

## 6. Integration Points

### 6.1 Supabase Integration Flow
```mermaid
flowchart TD
    A[React Component] --> B[Custom Hook]
    B --> C[Service Function]
    C --> D[Supabase Client]
    D --> E[PostgreSQL Database]
    
    E --> F[Database Response]
    F --> D
    D --> G[Supabase Response]
    G --> C
    C --> H[Formatted Data]
    H --> B
    B --> I[Component State Update]
    I --> J[UI Re-render]
```

### 6.2 Real-time Subscription Flow
```mermaid
flowchart TD
    A[Component Mounts] --> B[Create Supabase Subscription]
    B --> C[Listen for Database Changes]
    C --> D[Change Detected]
    D --> E[Filter Relevant Changes]
    E --> F[Update Local State]
    F --> G[Trigger Re-render]
    G --> H[Component Unmounts]
    H --> I[Cleanup Subscription]
```

---

## 7. Business Rules Enforcement

### 7.1 Match Participation Rules
- Minimum 2 teams, maximum 6 teams per match
- Teams must have minimum 3 active players
- Stake amount must be positive and divisible by participating teams
- Only active teams can join new matches

### 7.2 Financial Rules
- Total distribution must equal total pot exactly
- Player earnings cannot be negative
- Only one financial transaction per player per match
- Audit trail required for all money movements

### 7.3 Statistics Rules
- Only one MVP per match
- Statistics can only be recorded after match completion
- Negative statistics not allowed
- Player must be on participating team to have stats

---

**Activity Diagrams Status:** ✅ Complete  
**Next Step:** Sequence Diagram for API interactions  
**Business Logic:** Ready for implementation 