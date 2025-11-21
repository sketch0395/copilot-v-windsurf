'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadWithSync, saveWithSync } from '@/utils/cloudSync';
import {
  PetState,
  updatePetStats,
  levelUpPet
} from '@/utils/pet';

export function usePetSync(userLevel: number) {
  const { isAuthenticated } = useAuth();
  const [pet, setPet] = useState<PetState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load pet data on mount and when auth changes
  useEffect(() => {
    async function loadData() {
      try {
        if (isAuthenticated) {
          // Load from cloud
          const cloudData = await loadWithSync(isAuthenticated, 'pet', null);
          if (cloudData) {
            const petData = cloudData as PetState;
            const updatedPet = updatePetStats(petData);
            const leveledPet = levelUpPet(updatedPet, userLevel);
            setPet(leveledPet);
          }
        } else {
          // Load from localStorage as fallback
          const localData = localStorage.getItem('adhd-tracker-pet');
          if (localData) {
            const petData = JSON.parse(localData) as PetState;
            const updatedPet = updatePetStats(petData);
            const leveledPet = levelUpPet(updatedPet, userLevel);
            setPet(leveledPet);
          }
        }
      } catch (error) {
        console.error('Failed to load pet data:', error);
        // Try localStorage as fallback
        const localData = localStorage.getItem('adhd-tracker-pet');
        if (localData) {
          const petData = JSON.parse(localData) as PetState;
          const updatedPet = updatePetStats(petData);
          const leveledPet = levelUpPet(updatedPet, userLevel);
          setPet(leveledPet);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [isAuthenticated, userLevel]);

  // Save pet data whenever it changes
  const savePet = async (petData: PetState) => {
    setPet(petData);
    
    // Save locally
    localStorage.setItem('adhd-tracker-pet', JSON.stringify(petData));
    
    // Save to cloud if authenticated
    if (isAuthenticated) {
      try {
        await saveWithSync(isAuthenticated, 'pet', petData);
      } catch (error) {
        console.error('Failed to sync pet to cloud:', error);
      }
    }
  };

  return { pet, savePet, isLoading };
}
