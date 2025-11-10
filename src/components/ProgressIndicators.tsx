'use client';

import { RoutineBlock } from './ADHDRoutineTracker';

interface ProgressIndicatorsProps {
  routine: RoutineBlock[];
}

export default function ProgressIndicators({ routine }: ProgressIndicatorsProps) {
  // Calculate overall progress
  const totalBlocks = routine.length;
  const completedBlocks = routine.filter(block => block.completed).length;
  const overallProgress = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

  // Calculate progress by type
  const progressByType = routine.reduce((acc, block) => {
    if (!acc[block.type]) {
      acc[block.type] = { total: 0, completed: 0 };
    }
    acc[block.type].total++;
    if (block.completed) {
      acc[block.type].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  // Get time-based progress
  const getCurrentTimeProgress = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const workDayStart = 9 * 60; // 9:00 AM
    const workDayEnd = 18 * 60;  // 6:00 PM
    
    if (currentMinutes < workDayStart) return 0;
    if (currentMinutes > workDayEnd) return 100;
    
    return ((currentMinutes - workDayStart) / (workDayEnd - workDayStart)) * 100;
  };

  const dayProgress = getCurrentTimeProgress();

  const typeIcons = {
    'work': { icon: '💼', color: 'bg-blue-500', name: 'Work Focus' },
    'side-project': { icon: '🚀', color: 'bg-purple-500', name: 'Side Projects' },
    'break': { icon: '☕', color: 'bg-green-500', name: 'Breaks' },
    'personal': { icon: '🏠', color: 'bg-orange-500', name: 'Personal Time' }
  };

  const getMotivationalMessage = () => {
    if (overallProgress === 100) return "🎉 Amazing! You've completed your entire day!";
    if (overallProgress >= 80) return "🔥 You're on fire! Almost there!";
    if (overallProgress >= 60) return "💪 Great momentum! Keep it up!";
    if (overallProgress >= 40) return "⚡ Good progress! You're getting there!";
    if (overallProgress >= 20) return "🌟 Nice start! Every step counts!";
    return "🚀 Ready to crush your day? Let's begin!";
  };

  const getStreakInfo = () => {
    // Simple streak calculation - consecutive completed blocks
    let currentStreak = 0;
    for (let i = 0; i < routine.length; i++) {
      if (routine[i].completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const streak = getStreakInfo();

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            📊 Daily Progress
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(overallProgress)}%
            </div>
            <div className="text-sm text-gray-500">
              {completedBlocks}/{totalBlocks} completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${overallProgress}%` }}
          >
            {overallProgress > 0 && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getMotivationalMessage()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Counter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {streak}
            </div>
            <div className="text-xs text-gray-500">Current Streak</div>
          </div>
        </div>

        {/* Day Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-center">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(dayProgress)}%
            </div>
            <div className="text-xs text-gray-500">Day Progress</div>
          </div>
        </div>

        {/* Focus Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {progressByType.work ? Math.round((progressByType.work.completed / progressByType.work.total) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">Work Focus</div>
          </div>
        </div>

        {/* Side Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-center">
            <div className="text-3xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {progressByType['side-project'] ? Math.round((progressByType['side-project'].completed / progressByType['side-project'].total) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">Side Projects</div>
          </div>
        </div>
      </div>

      {/* Progress by Type */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          📈 Progress by Category
        </h4>
        <div className="space-y-4">
          {Object.entries(progressByType).map(([type, data]) => {
            const typeInfo = typeIcons[type as keyof typeof typeIcons] || { 
              icon: '📋', 
              color: 'bg-gray-500', 
              name: type 
            };
            const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;

            return (
              <div key={type} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-32">
                  <span className="text-lg">{typeInfo.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {typeInfo.name}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {data.completed}/{data.total}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round(percentage)}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${typeInfo.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          🏆 Today&apos;s Achievements
        </h4>
        <div className="flex flex-wrap gap-3">
          {overallProgress >= 25 && (
            <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
              <span>🌟</span>
              <span>Quarter Done</span>
            </div>
          )}
          {overallProgress >= 50 && (
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
              <span>🎯</span>
              <span>Halfway Hero</span>
            </div>
          )}
          {overallProgress >= 75 && (
            <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
              <span>🚀</span>
              <span>Almost There</span>
            </div>
          )}
          {overallProgress === 100 && (
            <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
              <span>🏆</span>
              <span>Day Champion</span>
            </div>
          )}
          {streak >= 3 && (
            <div className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm">
              <span>🔥</span>
              <span>On Fire</span>
            </div>
          )}
          {progressByType.work && progressByType.work.completed > 0 && (
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
              <span>💼</span>
              <span>Work Warrior</span>
            </div>
          )}
          {progressByType['side-project'] && progressByType['side-project'].completed > 0 && (
            <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
              <span>🚀</span>
              <span>Side Quest Pro</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}