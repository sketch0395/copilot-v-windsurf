'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadWithSync, saveWithSync } from '@/utils/cloudSync';
import { 
  type UsageData, 
  recordDailyUsage as recordLocal,
  getTodayDateKey
} from '@/utils/usageTracking';

export function useUsageSync() {
  const { isAuthenticated } = useAuth();
  const [hasRecorded, setHasRecorded] = useState(false);

  // Record usage on mount and when auth changes
  useEffect(() => {
    if (hasRecorded) return; // Only record once per session
    
    async function recordUsage() {
      try {
        const today = getTodayDateKey();
        
        if (isAuthenticated) {
          // Load from cloud
          let cloudData = await loadWithSync(isAuthenticated, 'usage', null) as UsageData | null;
          
          if (!cloudData) {
            // No cloud data, create new
            cloudData = { activeDays: [], lastVisit: '', totalSessions: 0 };
          }

          // Check if today needs to be recorded
          if (!cloudData.activeDays.includes(today)) {
            cloudData.activeDays.push(today);
          }
          cloudData.lastVisit = today;
          cloudData.totalSessions += 1;

          // Save to cloud and local
          await saveWithSync(isAuthenticated, 'usage', cloudData);
          localStorage.setItem('adhd-tracker-usage', JSON.stringify(cloudData));
        } else {
          // Just record locally
          recordLocal();
        }
        
        setHasRecorded(true);
      } catch (error) {
        console.error('Failed to record usage:', error);
        // Fallback to local
        recordLocal();
        setHasRecorded(true);
      }
    }
    
    recordUsage();
  }, [isAuthenticated, hasRecorded]);

  return { hasRecorded };
}
