'use client';

import { useState, useEffect } from 'react';
import { 
  loadGamificationData, 
  getProgressToNextLevel, 
  getPointsForNextLevel,
  getLevelTitle,
  getLevelBadgeColor,
  getUnlockedAchievements,
  getLockedAchievements,
  type GamificationData,
  type Achievement
} from '@/utils/gamification';

interface GamificationWidgetProps {
  onShowAchievements?: () => void;
}

export default function GamificationWidget({ onShowAchievements }: GamificationWidgetProps) {
  const [data, setData] = useState<GamificationData>({
    points: 0,
    level: 0,
    achievements: [],
    completedBlocks: 0,
    completedSessions: 0,
    totalFocusMinutes: 0,
    pointsHistory: []
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const gameData = loadGamificationData();
      setData(gameData);
    };
    
    loadData();
    
    // Listen for gamification updates
    const handleUpdate = () => loadData();
    window.addEventListener('gamification-update', handleUpdate);
    
    return () => window.removeEventListener('gamification-update', handleUpdate);
  }, []);

  const progress = getProgressToNextLevel(data.points, data.level);
  const nextLevelPoints = getPointsForNextLevel(data.level);
  const levelTitle = getLevelTitle(data.level);
  const badgeColor = getLevelBadgeColor(data.level);
  const unlockedAchievements = getUnlockedAchievements(data);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-purple-200 dark:border-purple-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full ${badgeColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
            {data.level}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              Level {data.level}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {levelTitle}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>{data.points} XP</span>
          <span>{nextLevelPoints} XP</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
          {Math.round(progress)}% to next level
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {data.completedBlocks}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Blocks</div>
        </div>
        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {data.completedSessions}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Sessions</div>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {Math.floor(data.totalFocusMinutes / 60)}h
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Focus</div>
        </div>
      </div>

      {/* Achievements Badge */}
      <button
        onClick={onShowAchievements}
        className="w-full p-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-md flex items-center justify-center space-x-2"
      >
        <span>🏆</span>
        <span className="font-medium">
          {unlockedAchievements.length} / {unlockedAchievements.length + getLockedAchievements(data).length} Achievements
        </span>
      </button>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Recent Activity
          </h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {data.pointsHistory.slice(-5).reverse().map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  {event.reason}
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  +{event.amount} XP
                </span>
              </div>
            ))}
            {data.pointsHistory.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">
                No activity yet. Start completing tasks!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Achievements Modal Component
interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  // Load fresh data whenever modal state is checked
  const data = isOpen ? loadGamificationData() : {
    points: 0,
    level: 0,
    achievements: [],
    completedBlocks: 0,
    completedSessions: 0,
    totalFocusMinutes: 0,
    pointsHistory: []
  };

  if (!isOpen) return null;

  const unlockedAchievements = getUnlockedAchievements(data);
  const lockedAchievements = getLockedAchievements(data);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            🏆 Achievements
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Unlocked ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} unlocked={true} />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Locked ({lockedAchievements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} unlocked={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-60'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 dark:text-white mb-1">
            {achievement.name}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {achievement.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              +{achievement.points} XP
            </span>
            {unlocked && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                ✓ Unlocked
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}