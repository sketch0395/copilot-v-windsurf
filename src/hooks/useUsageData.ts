'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadWithSync } from '@/utils/cloudSync';
import { type UsageData } from '@/utils/usageTracking';

export function useUsageData() {
  const { isAuthenticated } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (isAuthenticated) {
          // Load from cloud
          const cloudData = await loadWithSync(isAuthenticated, 'usage', null);
          if (cloudData) {
            setUsageData(cloudData as UsageData);
            // Update local storage as backup
            localStorage.setItem('adhd-tracker-usage', JSON.stringify(cloudData));
          } else {
            // No cloud data, use local
            const localData = localStorage.getItem('adhd-tracker-usage');
            if (localData) {
              setUsageData(JSON.parse(localData));
            } else {
              setUsageData({ activeDays: [], lastVisit: '', totalSessions: 0 });
            }
          }
        } else {
          // Use local storage
          const localData = localStorage.getItem('adhd-tracker-usage');
          if (localData) {
            setUsageData(JSON.parse(localData));
          } else {
            setUsageData({ activeDays: [], lastVisit: '', totalSessions: 0 });
          }
        }
      } catch (error) {
        console.error('Failed to load usage data:', error);
        // Fallback to local
        const localData = localStorage.getItem('adhd-tracker-usage');
        if (localData) {
          setUsageData(JSON.parse(localData));
        } else {
          setUsageData({ activeDays: [], lastVisit: '', totalSessions: 0 });
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [isAuthenticated]);

  return { usageData, isLoading };
}
