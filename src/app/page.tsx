'use client';

import { useState } from 'react';
import ADHDRoutineTracker from '@/components/ADHDRoutineTracker';
import { getRandomQuote } from '@/utils/quotes';

export default function Home() {
  const [quote] = useState(() => getRandomQuote());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header with Quote */}
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
            🧠 Welcome to Your Focus Zone
          </h1>
          
          {/* Motivational Quote */}
          {quote.text && (
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
        </header>
        
        <ADHDRoutineTracker />
      </div>
    </div>
  );
}
