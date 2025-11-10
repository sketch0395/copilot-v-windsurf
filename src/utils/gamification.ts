// Gamification system for ADHD Focus Tracker

export interface GamificationData {
  points: number;
  level: number;
  achievements: string[];
  completedBlocks: number;
  completedSessions: number;
  totalFocusMinutes: number;
  lastPointsEarned?: number;
  pointsHistory: PointsEvent[];
}

export interface PointsEvent {
  amount: number;
  reason: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  requirement: (data: GamificationData) => boolean;
}

const STORAGE_KEY = 'adhd-tracker-gamification';

// Points awarded for different actions
export const POINTS = {
  BLOCK_COMPLETED: 10,
  FOCUS_SESSION_15MIN: 15,
  FOCUS_SESSION_25MIN: 25,
  FOCUS_SESSION_45MIN: 45,
  DAILY_STREAK: 20,
  WEEKLY_STREAK: 50,
  MONTHLY_STREAK: 100,
  ALL_BLOCKS_COMPLETED: 50,
};

// Level calculation: Level = floor(sqrt(points / 100))
export function calculateLevel(points: number): number {
  return Math.floor(Math.sqrt(points / 100));
}

export function getPointsForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return (nextLevel * nextLevel) * 100;
}

export function getPointsForCurrentLevel(currentLevel: number): number {
  return (currentLevel * currentLevel) * 100;
}

export function getProgressToNextLevel(points: number, currentLevel: number): number {
  const currentLevelPoints = getPointsForCurrentLevel(currentLevel);
  const nextLevelPoints = getPointsForNextLevel(currentLevel);
  const progressPoints = points - currentLevelPoints;
  const pointsNeeded = nextLevelPoints - currentLevelPoints;
  return (progressPoints / pointsNeeded) * 100;
}

// Achievements definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-block',
    name: 'First Steps',
    description: 'Complete your first routine block',
    icon: '🎯',
    points: 10,
    requirement: (data) => data.completedBlocks >= 1
  },
  {
    id: 'ten-blocks',
    name: 'Getting Started',
    description: 'Complete 10 routine blocks',
    icon: '⭐',
    points: 25,
    requirement: (data) => data.completedBlocks >= 10
  },
  {
    id: 'fifty-blocks',
    name: 'Consistent Performer',
    description: 'Complete 50 routine blocks',
    icon: '🌟',
    points: 50,
    requirement: (data) => data.completedBlocks >= 50
  },
  {
    id: 'hundred-blocks',
    name: 'Century Club',
    description: 'Complete 100 routine blocks',
    icon: '💯',
    points: 100,
    requirement: (data) => data.completedBlocks >= 100
  },
  {
    id: 'first-session',
    name: 'Focus Initiate',
    description: 'Complete your first focus session',
    icon: '🎓',
    points: 10,
    requirement: (data) => data.completedSessions >= 1
  },
  {
    id: 'ten-sessions',
    name: 'Focus Apprentice',
    description: 'Complete 10 focus sessions',
    icon: '📚',
    points: 30,
    requirement: (data) => data.completedSessions >= 10
  },
  {
    id: 'fifty-sessions',
    name: 'Focus Master',
    description: 'Complete 50 focus sessions',
    icon: '🎖️',
    points: 75,
    requirement: (data) => data.completedSessions >= 50
  },
  {
    id: 'ten-hours',
    name: 'Time Warrior',
    description: 'Accumulate 10 hours of focus time',
    icon: '⏰',
    points: 50,
    requirement: (data) => data.totalFocusMinutes >= 600
  },
  {
    id: 'fifty-hours',
    name: 'Time Lord',
    description: 'Accumulate 50 hours of focus time',
    icon: '⌛',
    points: 150,
    requirement: (data) => data.totalFocusMinutes >= 3000
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '🚀',
    points: 50,
    requirement: (data) => data.level >= 5
  },
  {
    id: 'level-10',
    name: 'Productivity Pro',
    description: 'Reach level 10',
    icon: '👑',
    points: 100,
    requirement: (data) => data.level >= 10
  },
  {
    id: 'level-20',
    name: 'Legendary Focus',
    description: 'Reach level 20',
    icon: '🏆',
    points: 200,
    requirement: (data) => data.level >= 20
  }
];

export function loadGamificationData(): GamificationData {
  if (typeof window === 'undefined') {
    return {
      points: 0,
      level: 0,
      achievements: [],
      completedBlocks: 0,
      completedSessions: 0,
      totalFocusMinutes: 0,
      pointsHistory: []
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      points: 0,
      level: 0,
      achievements: [],
      completedBlocks: 0,
      completedSessions: 0,
      totalFocusMinutes: 0,
      pointsHistory: []
    };
  }

  try {
    const data = JSON.parse(stored);
    data.level = calculateLevel(data.points);
    return data;
  } catch {
    return {
      points: 0,
      level: 0,
      achievements: [],
      completedBlocks: 0,
      completedSessions: 0,
      totalFocusMinutes: 0,
      pointsHistory: []
    };
  }
}

export function saveGamificationData(data: GamificationData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function awardPoints(
  currentData: GamificationData,
  points: number,
  reason: string
): { data: GamificationData; leveledUp: boolean; newAchievements: Achievement[] } {
  const newData = { ...currentData };
  const oldLevel = newData.level;

  newData.points += points;
  newData.level = calculateLevel(newData.points);
  newData.lastPointsEarned = points;

  // Add to points history
  newData.pointsHistory = [
    ...newData.pointsHistory,
    {
      amount: points,
      reason,
      timestamp: new Date().toISOString()
    }
  ].slice(-50); // Keep last 50 events

  // Check for new achievements
  const newAchievements: Achievement[] = [];
  ACHIEVEMENTS.forEach(achievement => {
    if (!newData.achievements.includes(achievement.id) && achievement.requirement(newData)) {
      newData.achievements.push(achievement.id);
      newAchievements.push(achievement);
      newData.points += achievement.points; // Bonus points for achievements
      newData.level = calculateLevel(newData.points); // Recalculate after bonus
    }
  });

  const leveledUp = newData.level > oldLevel;

  saveGamificationData(newData);

  return { data: newData, leveledUp, newAchievements };
}

export function recordBlockCompletion(): { data: GamificationData; leveledUp: boolean; newAchievements: Achievement[] } {
  const data = loadGamificationData();
  data.completedBlocks += 1;
  return awardPoints(data, POINTS.BLOCK_COMPLETED, 'Completed routine block');
}

export function recordFocusSession(minutes: number): { data: GamificationData; leveledUp: boolean; newAchievements: Achievement[] } {
  const data = loadGamificationData();
  data.completedSessions += 1;
  data.totalFocusMinutes += minutes;

  let points = POINTS.FOCUS_SESSION_15MIN;
  if (minutes >= 45) {
    points = POINTS.FOCUS_SESSION_45MIN;
  } else if (minutes >= 25) {
    points = POINTS.FOCUS_SESSION_25MIN;
  }

  return awardPoints(data, points, `Completed ${minutes}-minute focus session`);
}

export function getUnlockedAchievements(data: GamificationData): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => 
    data.achievements.includes(achievement.id)
  );
}

export function getLockedAchievements(data: GamificationData): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => 
    !data.achievements.includes(achievement.id)
  );
}

export function getLevelTitle(level: number): string {
  if (level === 0) return 'Beginner';
  if (level < 3) return 'Novice';
  if (level < 5) return 'Apprentice';
  if (level < 10) return 'Practitioner';
  if (level < 15) return 'Expert';
  if (level < 20) return 'Master';
  if (level < 30) return 'Grandmaster';
  return 'Legendary';
}

export function getLevelBadgeColor(level: number): string {
  if (level === 0) return 'bg-gray-500';
  if (level < 3) return 'bg-green-500';
  if (level < 5) return 'bg-blue-500';
  if (level < 10) return 'bg-purple-500';
  if (level < 15) return 'bg-orange-500';
  if (level < 20) return 'bg-red-500';
  if (level < 30) return 'bg-pink-500';
  return 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500';
}