import { type RoutineBlock } from '@/components/ADHDRoutineTracker';
import { type GamificationData } from '@/utils/gamification';

export interface UserData {
  routine?: RoutineBlock[];
  gamification?: GamificationData;
  usage?: {
    activeDays: string[];
  };
  lastSynced?: string;
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adhd-tracker-token');
  }
  return null;
}

// Save data to backend API
export async function saveToCloud(dataType: 'routine' | 'gamification' | 'usage', data: unknown) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ dataType, data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save data');
    }

    return true;
  } catch (error) {
    console.error('Failed to save to cloud:', error);
    return false;
  }
}

// Load data from backend API
export async function loadFromCloud(dataType: 'routine' | 'gamification' | 'usage') {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`/api/data?type=${dataType}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Data not found
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to load data');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to load from cloud:', error);
    return null;
  }
}

// Sync all data to cloud
export async function syncAllData(data: UserData) {
  const results = {
    routine: false,
    gamification: false,
    usage: false
  };

  if (data.routine) {
    results.routine = await saveToCloud('routine', data.routine);
  }
  if (data.gamification) {
    results.gamification = await saveToCloud('gamification', data.gamification);
  }
  if (data.usage) {
    results.usage = await saveToCloud('usage', data.usage);
  }

  return results;
}

// Load all user data from cloud
export async function loadAllData(): Promise<UserData> {
  try {
    const token = getAuthToken();
    if (!token) {
      return {};
    }

    const response = await fetch('/api/data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return {};
    }

    const allData = await response.json();
    
    return {
      routine: allData.routine?.data,
      gamification: allData.gamification?.data,
      usage: allData.usage?.data
    };
  } catch (error) {
    console.error('Failed to load all data:', error);
    return {};
  }
}

// Helper to save data with automatic cloud sync
export async function saveWithSync(
  isAuthenticated: boolean,
  key: string,
  data: unknown
) {
  if (isAuthenticated) {
    // Save to cloud via API
    return await saveToCloud(key as 'routine' | 'gamification' | 'usage', data);
  } else {
    // Save locally
    try {
      localStorage.setItem(`adhd-${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save locally:', error);
      return false;
    }
  }
}

// Helper to load data from cloud or local
export async function loadWithSync(
  isAuthenticated: boolean,
  key: string,
  defaultValue: unknown = null
) {
  if (isAuthenticated) {
    // Load from cloud via API
    const cloudData = await loadFromCloud(key as 'routine' | 'gamification' | 'usage');
    return cloudData !== null ? cloudData : defaultValue;
  } else {
    // Load locally
    try {
      const stored = localStorage.getItem(`adhd-${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('Failed to load locally:', error);
      return defaultValue;
    }
  }
}
