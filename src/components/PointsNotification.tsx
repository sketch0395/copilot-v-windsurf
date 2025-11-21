'use client';

import { useState, useEffect } from 'react';
import { type Achievement } from '@/utils/gamification';

interface NotificationData {
  leveledUp?: boolean;
  newLevel?: number;
  achievements?: Achievement[];
  points?: number;
}

export default function PointsNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationData>;
      setNotifications(prev => [...prev, customEvent.detail]);
    };

    window.addEventListener('show-notification', handleNotification);

    return () => {
      window.removeEventListener('show-notification', handleNotification);
    };
  }, []);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      // Use a microtask to avoid cascading renders
      const timeoutId = setTimeout(() => {
        setCurrentNotification(notifications[0]);
        setNotifications(prev => prev.slice(1));
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [notifications, currentNotification]);

  useEffect(() => {
    if (currentNotification) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setCurrentNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  if (!currentNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-2xl p-6 max-w-sm border-4 border-yellow-300">
        {/* Points Earned */}
        {currentNotification.points && (
          <div className="text-center mb-4">
            <div className="text-6xl mb-2 animate-bounce">🎉</div>
            <div className="text-3xl font-bold mb-1">
              +{currentNotification.points} XP
            </div>
            <div className="text-purple-100 text-sm">Points Earned!</div>
          </div>
        )}

        {/* Level Up */}
        {currentNotification.leveledUp && currentNotification.newLevel && (
          <div className="text-center mb-4 py-4 bg-yellow-400 text-purple-900 rounded-lg">
            <div className="text-5xl mb-2">🎊</div>
            <div className="text-2xl font-bold">LEVEL UP!</div>
            <div className="text-3xl font-extrabold">
              Level {currentNotification.newLevel}
            </div>
          </div>
        )}

        {/* New Achievements */}
        {currentNotification.achievements && currentNotification.achievements.length > 0 && (
          <div className="space-y-2">
            <div className="text-center font-bold text-yellow-300 mb-2">
              🏆 New Achievement{currentNotification.achievements.length > 1 ? 's' : ''}!
            </div>
            {currentNotification.achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3"
              >
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-bold">{achievement.name}</div>
                  <div className="text-xs text-purple-100">
                    {achievement.description}
                  </div>
                  <div className="text-sm text-yellow-300 font-medium mt-1">
                    +{achievement.points} Bonus XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => setCurrentNotification(null)}
          className="absolute top-2 right-2 text-white hover:text-yellow-300 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}