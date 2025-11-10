'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RoutineBlock } from './ADHDRoutineTracker';
import { recordFocusSession } from '@/utils/gamification';

interface FocusTimerProps {
  currentBlock: RoutineBlock | null;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
}

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60;   // 5 minutes in seconds
const LONG_BREAK = 15 * 60;   // 15 minutes in seconds

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export default function FocusTimer({ currentBlock, isActive, onToggle }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [customTime, setCustomTime] = useState(25);
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1);
    } catch {
      console.log('Audio notification not available');
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    if (timerMode === 'focus') {
      // Calculate minutes for the completed session based on current timer mode
      let totalTimeMinutes = 25; // default
      const currentTotal = timerMode === 'focus' ? FOCUS_DURATION : 
                          timerMode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK;
      
      totalTimeMinutes = Math.floor(currentTotal / 60);
      
      // Award points for completing focus session
      if (totalTimeMinutes >= 15) {
        const result = recordFocusSession(totalTimeMinutes);
        window.dispatchEvent(new Event('gamification-update'));
        
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
      
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      
      if (newPomodoroCount % 4 === 0) {
        setTimerMode('longBreak');
        setTimeLeft(LONG_BREAK);
      } else {
        setTimerMode('shortBreak');
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setTimerMode('focus');
      setTimeLeft(FOCUS_DURATION);
    }
  }, [timerMode, pomodoroCount]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onToggle(false);
            playNotificationSound();
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, onToggle, playNotificationSound, handleTimerComplete]);

  const resetTimer = () => {
    onToggle(false);
    if (timerMode === 'focus') {
      setTimeLeft(FOCUS_DURATION);
    } else if (timerMode === 'shortBreak') {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const setCustomTimer = () => {
    const seconds = customTime * 60;
    setTimeLeft(seconds);
    setTimerMode('focus');
    setShowCustomInput(false);
    onToggle(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    switch (timerMode) {
      case 'focus': return 'text-blue-600 dark:text-blue-400';
      case 'shortBreak': return 'text-green-600 dark:text-green-400';
      case 'longBreak': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getProgressColor = () => {
    switch (timerMode) {
      case 'focus': return 'stroke-blue-500';
      case 'shortBreak': return 'stroke-green-500';
      case 'longBreak': return 'stroke-purple-500';
      default: return 'stroke-blue-500';
    }
  };

  const totalTime = timerMode === 'focus' ? FOCUS_DURATION : 
                   timerMode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Timer Mode Display */}
      <div className="flex items-center space-x-4">
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
          timerMode === 'focus' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          timerMode === 'shortBreak' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        }`}>
          {timerMode === 'focus' ? '🎯 Focus Time' : 
           timerMode === 'shortBreak' ? '☕ Short Break' : 
           '🌟 Long Break'}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Pomodoros: {pomodoroCount}
        </span>
      </div>

      {/* Circular Progress Timer */}
      <div className="relative">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200 dark:text-gray-600"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={`transition-all duration-1000 ${getProgressColor()}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentBlock?.name || 'No active block'}
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggle(!isActive)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isActive ? '⏸️ Pause' : '▶️ Start'}
        </button>
        
        <button
          onClick={resetTimer}
          className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          🔄 Reset
        </button>
        
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="px-4 py-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          ⚙️ Custom
        </button>
      </div>

      {/* Custom Time Input */}
      {showCustomInput && (
        <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Minutes:
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={customTime}
            onChange={(e) => setCustomTime(parseInt(e.target.value) || 25)}
            className="w-16 px-2 py-1 border rounded text-center dark:bg-gray-600 dark:border-gray-500"
          />
          <button
            onClick={setCustomTimer}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Set
          </button>
        </div>
      )}

      {/* Quick Timer Presets */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setTimeLeft(15 * 60);
            setTimerMode('focus');
            onToggle(false);
          }}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          15min
        </button>
        <button
          onClick={() => {
            setTimeLeft(25 * 60);
            setTimerMode('focus');
            onToggle(false);
          }}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          25min
        </button>
        <button
          onClick={() => {
            setTimeLeft(45 * 60);
            setTimerMode('focus');
            onToggle(false);
          }}
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          45min
        </button>
      </div>
    </div>
  );
}