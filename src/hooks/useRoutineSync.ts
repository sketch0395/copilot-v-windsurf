'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadFromCloud, saveToCloud } from '@/utils/cloudSync';
import { type RoutineBlock } from '@/components/ADHDRoutineTracker';

export function useRoutineSync(defaultRoutine: RoutineBlock[]) {
  const { isAuthenticated } = useAuth();
  const [routine, setRoutine] = useState<RoutineBlock[]>(defaultRoutine);
  const [isLoading, setIsLoading] = useState(true);

  // Load routine data on mount and when auth changes
  useEffect(() => {
    async function loadData() {
      try {
        if (isAuthenticated) {
          // Load from both cloud and local storage
          const cloudData = await loadFromCloud('routine');
          const localData = localStorage.getItem('adhd-tracker-routine');
          
          const cloudRoutine: RoutineBlock[] | null = cloudData as RoutineBlock[] | null;
          let localRoutine: RoutineBlock[] | null = null;
          
          if (localData) {
            try {
              localRoutine = JSON.parse(localData) as RoutineBlock[];
            } catch (error) {
              console.error('Failed to parse local routine:', error);
            }
          }

          // Merge strategy: Prefer cloud data if it exists, but merge completion states
          if (cloudRoutine || localRoutine) {
            const baseRoutine = cloudRoutine || localRoutine || defaultRoutine;
            
            // If both exist, merge completion states (keep any completed blocks)
            if (cloudRoutine && localRoutine) {
              const mergedRoutine = baseRoutine.map(block => {
                const localBlock = localRoutine.find(b => b.id === block.id);
                const cloudBlock = cloudRoutine.find(b => b.id === block.id);
                
                return {
                  ...block,
                  // Keep block as completed if it's completed in either source
                  completed: (localBlock?.completed || cloudBlock?.completed) || false
                };
              });
              
              setRoutine(mergedRoutine);
              
              // Sync merged result back to cloud
              await saveToCloud('routine', mergedRoutine);
              localStorage.setItem('adhd-tracker-routine', JSON.stringify(mergedRoutine));
            } else {
              setRoutine(baseRoutine);
              
              // Sync to the missing storage
              if (cloudRoutine) {
                localStorage.setItem('adhd-tracker-routine', JSON.stringify(cloudRoutine));
              } else if (localRoutine) {
                await saveToCloud('routine', localRoutine);
              }
            }
          } else {
            // No saved data, use default
            setRoutine(defaultRoutine);
          }
        } else {
          // Not authenticated, load from localStorage only
          const localData = localStorage.getItem('adhd-tracker-routine');
          if (localData) {
            try {
              const parsedRoutine = JSON.parse(localData) as RoutineBlock[];
              setRoutine(parsedRoutine);
            } catch (error) {
              console.error('Failed to parse local routine:', error);
              setRoutine(defaultRoutine);
            }
          } else {
            setRoutine(defaultRoutine);
          }
        }
      } catch (error) {
        console.error('Failed to load routine data:', error);
        // Fallback to localStorage
        const localData = localStorage.getItem('adhd-tracker-routine');
        if (localData) {
          try {
            const parsedRoutine = JSON.parse(localData) as RoutineBlock[];
            setRoutine(parsedRoutine);
          } catch (error) {
            console.error('Failed to parse local routine:', error);
            setRoutine(defaultRoutine);
          }
        } else {
          setRoutine(defaultRoutine);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [isAuthenticated, defaultRoutine]);

  // Save routine data whenever it changes
  const saveRoutine = async (routineData: RoutineBlock[]) => {
    setRoutine(routineData);
    
    // Save locally
    localStorage.setItem('adhd-tracker-routine', JSON.stringify(routineData));
    
    // Save to cloud if authenticated
    if (isAuthenticated) {
      try {
        await saveToCloud('routine', routineData);
      } catch (error) {
        console.error('Failed to sync routine to cloud:', error);
      }
    }
  };

  return { routine, saveRoutine, isLoading };
}
