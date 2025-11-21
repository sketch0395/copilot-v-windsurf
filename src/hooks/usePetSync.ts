'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadFromCloud, saveToCloud } from '@/utils/cloudSync';
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
          // Load from both cloud and local storage
          const cloudData = await loadFromCloud('pet');
          const localData = localStorage.getItem('adhd-tracker-pet');
          
          const cloudPet: PetState | null = cloudData as PetState | null;
          let localPet: PetState | null = null;
          
          if (localData) {
            try {
              localPet = JSON.parse(localData) as PetState;
            } catch (error) {
              console.error('Failed to parse local pet:', error);
            }
          }

          // Merge strategy: Use the most recent pet data
          if (cloudPet || localPet) {
            // If both exist, use the one with the most recent timestamp
            let basePet: PetState;
            
            if (cloudPet && localPet) {
              // Compare last update times to determine which is more recent
              const cloudLastUpdate = Math.max(
                cloudPet.lastFed,
                cloudPet.lastPlayed,
                cloudPet.lastSlept
              );
              const localLastUpdate = Math.max(
                localPet.lastFed,
                localPet.lastPlayed,
                localPet.lastSlept
              );
              
              basePet = cloudLastUpdate > localLastUpdate ? cloudPet : localPet;
            } else {
              basePet = (cloudPet || localPet)!;
            }
            
            // Update stats based on time passed
            const updatedPet = updatePetStats(basePet);
            setPet(updatedPet);
            
            // Sync the merged result to both cloud and local
            localStorage.setItem('adhd-tracker-pet', JSON.stringify(updatedPet));
            await saveToCloud('pet', updatedPet);
          } else {
            setPet(null);
          }
        } else {
          // Load from localStorage as fallback
          const localData = localStorage.getItem('adhd-tracker-pet');
          if (localData) {
            try {
              const petData = JSON.parse(localData) as PetState;
              const updatedPet = updatePetStats(petData);
              setPet(updatedPet);
            } catch (error) {
              console.error('Failed to parse local pet:', error);
              setPet(null);
            }
          } else {
            setPet(null);
          }
        }
      } catch (error) {
        console.error('Failed to load pet data:', error);
        // Try localStorage as fallback
        const localData = localStorage.getItem('adhd-tracker-pet');
        if (localData) {
          try {
            const petData = JSON.parse(localData) as PetState;
            const updatedPet = updatePetStats(petData);
            setPet(updatedPet);
          } catch (error) {
            console.error('Failed to parse local pet:', error);
            setPet(null);
          }
        } else {
          setPet(null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [isAuthenticated]);

  // Apply level-ups when userLevel changes
  useEffect(() => {
    if (pet && userLevel) {
      const leveledPet = levelUpPet(pet, userLevel);
      if (leveledPet.level !== pet.level) {
        setPet(leveledPet);
        // Save the leveled up pet
        localStorage.setItem('adhd-tracker-pet', JSON.stringify(leveledPet));
        if (isAuthenticated) {
          saveToCloud('pet', leveledPet).catch(error => {
            console.error('Failed to sync leveled pet to cloud:', error);
          });
        }
      }
    }
  }, [userLevel, pet, isAuthenticated]);

  // Save pet data whenever it changes
  const savePet = async (petData: PetState | null) => {
    setPet(petData);
    
    if (petData === null) {
      // Clear pet data
      localStorage.removeItem('adhd-tracker-pet');
      
      // Clear from cloud if authenticated
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('adhd-tracker-token');
          if (token) {
            await fetch('/api/data?type=pet', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        } catch (error) {
          console.error('Failed to delete pet from cloud:', error);
        }
      }
    } else {
      // Save pet data
      localStorage.setItem('adhd-tracker-pet', JSON.stringify(petData));
      
      // Save to cloud if authenticated
      if (isAuthenticated) {
        try {
          await saveToCloud('pet', petData);
        } catch (error) {
          console.error('Failed to sync pet to cloud:', error);
        }
      }
    }
  };

  return { pet, savePet, isLoading };
}
