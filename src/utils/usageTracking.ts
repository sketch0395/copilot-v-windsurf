// Utility functions for tracking app usage

export interface UsageData {
  activeDays: string[]; // Array of dates in 'YYYY-MM-DD' format
  lastVisit: string;
  totalSessions: number;
}

const STORAGE_KEY = 'adhd-tracker-usage';

export function getTodayDateKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function loadUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return { activeDays: [], lastVisit: '', totalSessions: 0 };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { activeDays: [], lastVisit: '', totalSessions: 0 };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { activeDays: [], lastVisit: '', totalSessions: 0 };
  }
}

export function saveUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordDailyUsage(): UsageData {
  const data = loadUsageData();
  const today = getTodayDateKey();

  // Check if today is already recorded
  if (!data.activeDays.includes(today)) {
    data.activeDays.push(today);
  }

  // Update last visit and session count
  data.lastVisit = today;
  data.totalSessions += 1;

  saveUsageData(data);
  return data;
}

export function getCurrentStreak(activeDays: string[]): number {
  if (activeDays.length === 0) return 0;

  // Sort dates in descending order
  const sortedDays = [...activeDays].sort((a, b) => b.localeCompare(a));
  
  const today = getTodayDateKey();
  let streak = 0;
  
  // Check if today is included
  if (sortedDays[0] !== today) {
    // Check if yesterday was active
    const yesterday = getDateDaysAgo(1);
    if (sortedDays[0] !== yesterday) {
      return 0; // Streak is broken
    }
  }

  // Count consecutive days
  const currentDate = new Date();
  for (const day of sortedDays) {
    const expectedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    if (day === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getLongestStreak(activeDays: string[]): number {
  if (activeDays.length === 0) return 0;

  // Sort dates in ascending order
  const sortedDays = [...activeDays].sort((a, b) => a.localeCompare(b));
  
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    
    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

export function getDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getActiveDaysInMonth(activeDays: string[], year: number, month: number): number {
  const monthStr = String(month + 1).padStart(2, '0');
  const yearMonthPrefix = `${year}-${monthStr}`;
  
  return activeDays.filter(day => day.startsWith(yearMonthPrefix)).length;
}

export function getUsageStats(activeDays: string[]) {
  return {
    totalDays: activeDays.length,
    currentStreak: getCurrentStreak(activeDays),
    longestStreak: getLongestStreak(activeDays),
    thisMonth: getActiveDaysInMonth(activeDays, new Date().getFullYear(), new Date().getMonth()),
    lastActive: activeDays.length > 0 ? activeDays[activeDays.length - 1] : null
  };
}