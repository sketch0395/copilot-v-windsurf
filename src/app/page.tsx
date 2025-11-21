'use client';

import { useState } from 'react';
import ADHDRoutineTracker from '@/components/ADHDRoutineTracker';
import { getRandomQuote } from '@/utils/quotes';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // Get quote only on client side after mount
  if (!mounted) {
    // Trigger mount on next render
    Promise.resolve().then(() => setMounted(true));
  }
  
  const quote = mounted ? getRandomQuote() : { text: '', author: '' };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header with Quote */}
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
            🧠 Welcome to Your Focus Zone
          </h1>
          
          {/* Motivational Quote */}
          {mounted && quote.text && (
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-1 mb-4 sm:mb-6 shadow-lg">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6">
                <p className="text-base sm:text-lg md:text-xl font-medium text-gray-800 dark:text-white mb-2 italic">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  — {quote.author}
                </p>
              </div>
            </div>
          )}
          
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4">
            Track your routines, crush your goals, and level up! 🚀
          </p>
          
          {/* Sync Status */}
          {user && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm">
              <span>☁️</span>
              <span>Syncing to cloud as <strong>{user.displayName || user.email}</strong></span>
            </div>
          )}
        </header>
        
        <ADHDRoutineTracker />
      </div>
    </div>
  );
}
