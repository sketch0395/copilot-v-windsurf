'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadWithSync, saveWithSync } from '@/utils/cloudSync';
import { 
  type GamificationData, 
  loadGamificationData as loadLocalGamification,
  saveGamificationData as saveLocalGamification
} from '@/utils/gamification';

export function useGamificationSync() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and when auth changes
  useEffect(() => {
    async function loadData() {
      try {
        if (isAuthenticated) {
          // Load both cloud and local data
          const cloudData = await loadWithSync(isAuthenticated, 'gamification', null) as GamificationData | null;
          const localData = loadLocalGamification();
          
          if (cloudData) {
            // Merge cloud and local data, preferring cloud but keeping any newer local achievements
            const mergedData: GamificationData = {
              ...cloudData,
              // Merge achievements arrays, keeping unique values
              achievements: Array.from(new Set([
                ...(cloudData.achievements || []),
                ...(localData.achievements || [])
              ])),
              // Use higher values for stats
              points: Math.max(cloudData.points || 0, localData.points || 0),
              level: Math.max(cloudData.level || 1, localData.level || 1),
              completedBlocks: Math.max(cloudData.completedBlocks || 0, localData.completedBlocks || 0),
              completedSessions: Math.max(cloudData.completedSessions || 0, localData.completedSessions || 0),
              totalFocusMinutes: Math.max(cloudData.totalFocusMinutes || 0, localData.totalFocusMinutes || 0),
              // Merge points history
              pointsHistory: [
                ...(cloudData.pointsHistory || []),
                ...(localData.pointsHistory || [])
              ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            };
            
            setData(mergedData);
            // Update both local and cloud with merged data
            saveLocalGamification(mergedData);
            await saveWithSync(isAuthenticated, 'gamification', mergedData);
          } else {
            // No cloud data, use local and sync to cloud
            setData(localData);
            await saveWithSync(isAuthenticated, 'gamification', localData);
          }
        } else {
          // Use local storage
          const localData = loadLocalGamification();
          setData(localData);
        }
      } catch (error) {
        console.error('Failed to load gamification data:', error);
        // Fallback to local
        const localData = loadLocalGamification();
        setData(localData);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [isAuthenticated]);

  // Save data whenever it changes
  useEffect(() => {
    if (data && !isLoading) {
      // Save locally
      saveLocalGamification(data);
      
      // Save to cloud if authenticated
      if (isAuthenticated) {
        saveWithSync(isAuthenticated, 'gamification', data).catch(err => {
          console.error('Failed to sync gamification to cloud:', err);
        });
      }
    }
  }, [data, isAuthenticated, isLoading]);

  return { data, setData, isLoading };
}
