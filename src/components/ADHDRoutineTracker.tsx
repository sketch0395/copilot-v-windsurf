'use client';

import { useState, useEffect, useMemo } from 'react';
import FocusTimer from './FocusTimer';
import RoutineSchedule from './RoutineSchedule';
import ProgressIndicators from './ProgressIndicators';
import GamificationWidget, { AchievementsModal } from './GamificationWidget';
import PointsNotification from './PointsNotification';
import { recordDailyUsage } from '@/utils/usageTracking';
import { recordBlockCompletion } from '@/utils/gamification';

export interface RoutineBlock {
  id: string;
  name: string;
  type: 'work' | 'side-project' | 'break' | 'personal';
  startTime: string;
  endTime: string;
  completed: boolean;
  color: string;
}

const defaultRoutine: RoutineBlock[] = [
  {
    id: '1',
    name: 'Morning Focus Work',
    type: 'work',
    startTime: '09:00',
    endTime: '11:00',
    completed: false,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Break Time',
    type: 'break',
    startTime: '11:00',
    endTime: '11:15',
    completed: false,
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'Work Sprint',
    type: 'work',
    startTime: '11:15',
    endTime: '12:30',
    completed: false,
    color: 'bg-blue-500'
  },
  {
    id: '4',
    name: 'Lunch Break',
    type: 'break',
    startTime: '12:30',
    endTime: '13:30',
    completed: false,
    color: 'bg-green-500'
  },
  {
    id: '5',
    name: 'Afternoon Work',
    type: 'work',
    startTime: '13:30',
    endTime: '15:30',
    completed: false,
    color: 'bg-blue-500'
  },
  {
    id: '6',
    name: 'Side Project Time',
    type: 'side-project',
    startTime: '15:30',
    endTime: '17:00',
    completed: false,
    color: 'bg-purple-500'
  },
  {
    id: '7',
    name: 'Personal Time',
    type: 'personal',
    startTime: '17:00',
    endTime: '18:00',
    completed: false,
    color: 'bg-orange-500'
  }
];

export default function ADHDRoutineTracker() {
  const [routine, setRoutine] = useState<RoutineBlock[]>(() => {
    // Load routine from localStorage on component mount
    const savedRoutine = localStorage.getItem('adhd-routine');
    if (savedRoutine) {
      return JSON.parse(savedRoutine);
    }
    return defaultRoutine;
  });
  
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    // Record daily usage when component mounts
    recordDailyUsage();
  }, []);

  useEffect(() => {
    // Save routine to localStorage whenever it changes
    localStorage.setItem('adhd-routine', JSON.stringify(routine));
  }, [routine]);

  // Calculate current block using useMemo to avoid cascading renders
  const currentBlock = useMemo(() => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    const current = routine.find(block => {
      return currentTime >= block.startTime && currentTime <= block.endTime;
    });
    
    return current || null;
  }, [routine]);

  const toggleBlockCompletion = (id: string) => {
    const block = routine.find(b => b.id === id);
    if (block && !block.completed) {
      // Award points when completing a block
      const result = recordBlockCompletion();
      
      // Trigger gamification update event
      window.dispatchEvent(new Event('gamification-update'));
      
      // Show notification if leveled up or got achievements
      if (result.leveledUp || result.newAchievements.length > 0) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('show-notification', {
            detail: {
              leveledUp: result.leveledUp,
              newLevel: result.data.level,
              achievements: result.newAchievements,
              points: result.data.lastPointsEarned
            }
          }));
        }, 300);
      }
    }
    
    setRoutine(prev => prev.map(block => 
      block.id === id ? { ...block, completed: !block.completed } : block
    ));
  };

  const updateRoutine = (newRoutine: RoutineBlock[]) => {
    setRoutine(newRoutine);
  };

  return (
    <>
      {/* Points Notification System */}
      <PointsNotification />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Gamification Widget */}
        <GamificationWidget onShowAchievements={() => setShowAchievements(true)} />
        
        {/* Achievements Modal */}
        <AchievementsModal 
          isOpen={showAchievements} 
          onClose={() => setShowAchievements(false)} 
        />
        
        {/* Current Block Display */}
      {currentBlock && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Currently: {currentBlock.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {currentBlock.startTime} - {currentBlock.endTime} 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs text-white ${currentBlock.color}`}>
                  {currentBlock.type.replace('-', ' ').toUpperCase()}
                </span>
              </p>
            </div>
            <button
              onClick={() => toggleBlockCompletion(currentBlock.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentBlock.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {currentBlock.completed ? '✓ Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>
      )}

      {/* Focus Timer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          🎯 Focus Timer
        </h3>
        <FocusTimer 
          currentBlock={currentBlock}
          isActive={isTimerActive}
          onToggle={setIsTimerActive}
        />
      </div>

      {/* Progress Overview */}
      <ProgressIndicators routine={routine} />

      {/* Daily Schedule */}
      <RoutineSchedule 
        routine={routine}
        onUpdateRoutine={updateRoutine}
        onToggleCompletion={toggleBlockCompletion}
      />
      </div>
    </>
  );
}