'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('adhd-tracker-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Default to dark theme
      setThemeState('dark');
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage and apply to document
    localStorage.setItem('adhd-tracker-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const themes = {
  light: {
    name: 'Light Mode',
    icon: '☀️',
    bg: 'from-gray-50 to-gray-100',
    card: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200'
  },
  dark: {
    name: 'Dark Mode',
    icon: '🌙',
    bg: 'from-gray-900 to-gray-800',
    card: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700'
  },
  ocean: {
    name: 'Ocean Vibes',
    icon: '🌊',
    bg: 'from-blue-400 via-cyan-400 to-teal-400',
    card: 'bg-blue-900/80 backdrop-blur-sm',
    text: 'text-white',
    textSecondary: 'text-blue-100',
    border: 'border-blue-300'
  },
  sunset: {
    name: 'Sunset Glow',
    icon: '🌅',
    bg: 'from-orange-400 via-pink-400 to-purple-500',
    card: 'bg-purple-900/80 backdrop-blur-sm',
    text: 'text-white',
    textSecondary: 'text-orange-100',
    border: 'border-pink-300'
  },
  forest: {
    name: 'Forest Zen',
    icon: '🌲',
    bg: 'from-green-600 via-emerald-600 to-teal-700',
    card: 'bg-green-900/80 backdrop-blur-sm',
    text: 'text-white',
    textSecondary: 'text-green-100',
    border: 'border-green-300'
  },
  neon: {
    name: 'Neon Nights',
    icon: '⚡',
    bg: 'from-purple-900 via-pink-900 to-purple-900',
    card: 'bg-black/80 backdrop-blur-sm border-2 border-pink-500',
    text: 'text-pink-300',
    textSecondary: 'text-purple-300',
    border: 'border-pink-500'
  }
};