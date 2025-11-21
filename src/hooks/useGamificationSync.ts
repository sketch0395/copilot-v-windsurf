'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadWithSync, saveWithSync } from '@/utils/cloudSync';
import { 
  type GamificationData, 
  calculateLevel,
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
          // Load from cloud
          const cloudData = await loadWithSync(isAuthenticated, 'gamification', null);
          if (cloudData) {
            setData(cloudData as GamificationData);
            // Update local storage as backup
            saveLocalGamification(cloudData as GamificationData);
          } else {
            // No cloud data, use local
            const localData = loadLocalGamification();
            setData(localData);
            // Sync to cloud
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
