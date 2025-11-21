# Cloud Sync Implementation

## Problem
User reported that when logging in on multiple devices, progress and data (points, level, achievements, pet stats, streaks) were not syncing between devices.

## Root Cause
Only routine data was using the cloud sync API (`loadWithSync`/`saveWithSync`). Other data types (gamification, pet, usage tracking) were only saving to localStorage without cloud synchronization.

## Solution
Created custom React hooks for each data type that automatically handle cloud synchronization when users are authenticated:

### 1. Gamification Data Sync (`src/hooks/useGamificationSync.ts`)
- **Purpose**: Syncs user points, level, achievements, and stats
- **Features**:
  - Loads from cloud when authenticated
  - Falls back to localStorage when offline or unauthenticated
  - Automatically syncs changes to cloud in real-time
  - Maintains localStorage backup for offline access

- **Usage**: Integrated into `GamificationWidget.tsx`
  ```tsx
  const { data, setData, isLoading } = useGamificationSync();
  ```

### 2. Pet Data Sync (`src/hooks/usePetSync.ts`)
- **Purpose**: Syncs virtual pet stats, actions, and cooldowns
- **Features**:
  - Loads pet data from cloud
  - Updates pet stats automatically (hunger, energy, happiness)
  - Syncs pet actions (feed, play, rest) across devices
  - Handles pet level progression tied to user level

- **Usage**: Integrated into `src/app/pet/page.tsx`
  ```tsx
  const { pet, savePet, isLoading } = usePetSync(userLevel);
  ```

### 3. Usage Tracking Sync (`src/hooks/useUsageSync.ts`)
- **Purpose**: Syncs daily active days, streaks, and session counts
- **Features**:
  - Records daily usage automatically
  - Syncs active days array to cloud
  - Updates streak calculations across devices
  - Prevents duplicate daily recordings

- **Usage**: Integrated into `ADHDRoutineTracker.tsx`
  ```tsx
  useUsageSync(); // Automatically records and syncs
  ```

### 4. Usage Data Hook (`src/hooks/useUsageData.ts`)
- **Purpose**: Loads usage data for display (calendar page)
- **Features**:
  - Loads from cloud when authenticated
  - Provides reactive updates to usage stats
  - Maintains localStorage backup

- **Usage**: Integrated into `src/app/calendar/page.tsx`
  ```tsx
  const { usageData, isLoading } = useUsageData();
  ```

## Data Types Synchronized

| Data Type | Storage Key | Cloud Sync Type | Contains |
|-----------|-------------|----------------|----------|
| Routine | N/A | `routine` | Routine blocks, completion status |
| Gamification | `adhd-tracker-gamification` | `gamification` | Points, level, achievements, stats |
| Pet | `adhd-tracker-pet` | `pet` | Pet stats, actions, cooldowns |
| Usage | `adhd-tracker-usage` | `usage` | Active days, streaks, sessions |

## How It Works

1. **On Login/Authentication Change**:
   - Hooks detect authentication state via `useAuth()`
   - Load data from cloud API (`/api/data?type=<dataType>`)
   - Update localStorage as backup
   - Set loading state to false

2. **On Data Change**:
   - Save to localStorage immediately (fast, offline support)
   - Async save to cloud via API (`POST /api/data`)
   - Errors logged but don't block user interaction

3. **On Page Load**:
   - Show loading skeleton while fetching cloud data
   - Merge cloud and local data (cloud takes precedence)
   - Render with synced data

## Components Updated

### Modified Files:
- `src/components/GamificationWidget.tsx` - Uses `useGamificationSync()`
- `src/components/ADHDRoutineTracker.tsx` - Uses `useUsageSync()`
- `src/app/pet/page.tsx` - Uses `usePetSync()`
- `src/app/calendar/page.tsx` - Uses `useUsageData()`

### New Files Created:
- `src/hooks/useGamificationSync.ts`
- `src/hooks/usePetSync.ts`
- `src/hooks/useUsageSync.ts`
- `src/hooks/useUsageData.ts`

## Benefits

1. **Real-time Sync**: Changes propagate immediately to cloud
2. **Offline Support**: LocalStorage backup ensures app works offline
3. **Multi-device**: Users can switch devices seamlessly
4. **Performance**: Loading states prevent UI jank
5. **Reliability**: Error handling with fallback to local data

## Testing Multi-Device Sync

1. **Device 1**: Login, complete a routine block, earn points, feed pet
2. **Device 2**: Login with same account
3. **Verify**: All data appears (routine status, points, level, pet stats)
4. **Device 2**: Make changes (complete task, play with pet)
5. **Device 1**: Refresh page
6. **Verify**: Changes from Device 2 appear on Device 1

## Future Improvements

- Add conflict resolution for simultaneous edits
- Implement delta sync (only sync changes)
- Add sync indicator UI (show when syncing)
- Batch sync requests to reduce API calls
- Add offline queue for sync operations
