'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';
import { loadUsageData, getUsageStats } from '@/utils/usageTracking';

export default function CalendarPage() {
  // Initialize state with data from localStorage
  const [activeDays] = useState<Set<string>>(() => {
    const usageData = loadUsageData();
    return new Set(usageData.activeDays);
  });
  
  const [stats] = useState(() => {
    const usageData = loadUsageData();
    return getUsageStats(usageData.activeDays);
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStreakMessage = () => {
    if (stats.currentStreak === 0) return "Let's start your streak today! 🚀";
    if (stats.currentStreak === 1) return "One day down! Keep the momentum! 💪";
    if (stats.currentStreak < 7) return "You're building a solid habit! 🔥";
    if (stats.currentStreak < 30) return "Wow! You're crushing it! ⚡";
    return "Legendary consistency! You're unstoppable! 🏆";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">
            📅 Your Progress Calendar
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4">
            Track your consistency and watch your streaks grow!
          </p>
        </header>

        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Stats Overview - Mobile responsive grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Days */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl mb-2">📊</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalDays}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Active Days
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl mb-2">🔥</div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.currentStreak}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current Streak
              </div>
            </div>

            {/* Longest Streak */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl mb-2">🏆</div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.longestStreak}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Longest Streak
              </div>
            </div>

            {/* This Month */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl mb-2">📅</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.thisMonth}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Days This Month
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 sm:p-6 shadow-lg text-center text-white">
            <h3 className="text-lg sm:text-2xl font-bold mb-2">
              {getStreakMessage()}
            </h3>
            <p className="text-sm sm:text-base text-purple-100">
              Last active: {formatDate(stats.lastActive)}
            </p>
          </div>

          {/* Calendar */}
          <Calendar activeDays={activeDays} />

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
              💡 Insights
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-xl sm:text-2xl">🎯</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                    Consistency Score
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stats.totalDays > 0
                      ? `You've used the focus tracker on ${stats.totalDays} ${stats.totalDays === 1 ? 'day' : 'days'}. ${
                          stats.currentStreak > 0
                            ? `You're on a ${stats.currentStreak}-day streak!`
                            : 'Start a new streak today!'
                        }`
                      : "Welcome! Start tracking your focus today to build consistency."}
                  </p>
                </div>
              </div>

              {stats.longestStreak > stats.currentStreak && stats.currentStreak > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="text-xl sm:text-2xl">🚀</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                      Beat Your Record
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Your longest streak is {stats.longestStreak} days. Keep going to beat your personal best!
                    </p>
                  </div>
                </div>
              )}

              {stats.currentStreak >= stats.longestStreak && stats.longestStreak > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="text-xl sm:text-2xl">🎉</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                      Personal Record!
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      You&apos;re at your longest streak ever! Amazing consistency! 🌟
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="text-xl sm:text-2xl">💪</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                    Monthly Progress
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This month you&apos;ve tracked {stats.thisMonth} {stats.thisMonth === 1 ? 'day' : 'days'}. 
                    {stats.thisMonth < 15 && " Keep up the momentum to reach 15 days!"}
                    {stats.thisMonth >= 15 && stats.thisMonth < 25 && " You're doing great! Can you hit 25?"}
                    {stats.thisMonth >= 25 && " Outstanding! You're crushing it this month!"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-3">
              📝 Tips for Building Consistency
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Use the focus timer daily, even if just for 15 minutes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Mark your time blocks as complete to stay motivated</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Review your calendar weekly to identify patterns</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Don&apos;t break the chain - consistency builds habits</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
