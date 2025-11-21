export interface PetState {
  name: string;
  type: 'cat' | 'dog' | 'dragon' | 'robot' | 'plant' | 'mecha';
  level: number;
  happiness: number; // 0-100
  health: number; // 0-100
  hunger: number; // 0-100
  energy: number; // 0-100
  lastFed: number;
  lastPlayed: number;
  lastSlept: number;
  createdAt: number;
}

export interface PetStats {
  totalFeedings: number;
  totalPlaySessions: number;
  totalSleeps: number;
  daysAlive: number;
}

const PET_TYPES = {
  cat: { emoji: '🐱', name: 'Cat', unlockLevel: 0 },
  dog: { emoji: '🐶', name: 'Dog', unlockLevel: 5 },
  dragon: { emoji: '🐉', name: 'Dragon', unlockLevel: 10 },
  robot: { emoji: '🤖', name: 'Robot', unlockLevel: 15 },
  plant: { emoji: '🌱', name: 'Plant', unlockLevel: 20 },
  mecha: { emoji: '🦾', name: 'Mecha', unlockLevel: 25 }
};

const DECAY_RATE = {
  hunger: 5, // Decreases 5 points per hour
  energy: 3, // Decreases 3 points per hour
  happiness: 2 // Decreases 2 points per hour
};

export function createNewPet(name: string, type: PetState['type']): PetState {
  const now = Date.now();
  return {
    name,
    type,
    level: 1,
    happiness: 100,
    health: 100,
    hunger: 100,
    energy: 100,
    lastFed: now,
    lastPlayed: now,
    lastSlept: now,
    createdAt: now
  };
}

export function updatePetStats(pet: PetState): PetState {
  const now = Date.now();
  const hoursSinceLastFed = (now - pet.lastFed) / (1000 * 60 * 60);
  const hoursSinceLastPlayed = (now - pet.lastPlayed) / (1000 * 60 * 60);
  const hoursSinceLastSlept = (now - pet.lastSlept) / (1000 * 60 * 60);

  // Calculate decay
  const hunger = Math.max(0, pet.hunger - (DECAY_RATE.hunger * hoursSinceLastFed));
  const energy = Math.max(0, pet.energy - (DECAY_RATE.energy * hoursSinceLastSlept));
  const happiness = Math.max(0, pet.happiness - (DECAY_RATE.happiness * hoursSinceLastPlayed));

  // Health is affected by other stats
  let health = pet.health;
  if (hunger < 20) health = Math.max(0, health - 2);
  if (energy < 20) health = Math.max(0, health - 2);
  if (happiness < 20) health = Math.max(0, health - 1);

  // Slowly regenerate health if all stats are good
  if (hunger > 70 && energy > 70 && happiness > 70) {
    health = Math.min(100, health + 1);
  }

  return {
    ...pet,
    hunger,
    energy,
    happiness,
    health
  };
}

export function feedPet(pet: PetState): PetState {
  const now = Date.now();
  const hoursSinceLastFed = (now - pet.lastFed) / (1000 * 60 * 60);
  
  // Prevent spam feeding (can only feed once per hour)
  if (hoursSinceLastFed < 1) {
    return pet;
  }

  return {
    ...pet,
    hunger: Math.min(100, pet.hunger + 30),
    happiness: Math.min(100, pet.happiness + 5),
    lastFed: now
  };
}

export function playWithPet(pet: PetState): PetState {
  const now = Date.now();
  const hoursSinceLastPlayed = (now - pet.lastPlayed) / (1000 * 60 * 60);
  
  // Prevent spam playing (can only play once per 2 hours)
  if (hoursSinceLastPlayed < 2) {
    return pet;
  }

  return {
    ...pet,
    happiness: Math.min(100, pet.happiness + 25),
    energy: Math.max(0, pet.energy - 15),
    lastPlayed: now
  };
}

export function restPet(pet: PetState): PetState {
  const now = Date.now();
  const hoursSinceLastSlept = (now - pet.lastSlept) / (1000 * 60 * 60);
  
  // Prevent spam resting (can only rest once per 4 hours)
  if (hoursSinceLastSlept < 4) {
    return pet;
  }

  return {
    ...pet,
    energy: Math.min(100, pet.energy + 40),
    happiness: Math.min(100, pet.happiness + 10),
    lastSlept: now
  };
}

export function levelUpPet(pet: PetState, userLevel: number): PetState {
  // Pet level is tied to user's gamification level
  const petLevel = Math.floor(userLevel / 2) + 1;
  
  if (petLevel > pet.level) {
    return {
      ...pet,
      level: petLevel,
      // Bonus stats on level up
      happiness: Math.min(100, pet.happiness + 20),
      health: Math.min(100, pet.health + 20)
    };
  }
  
  return pet;
}

export function getPetMood(pet: PetState): {
  mood: string;
  emoji: string;
  message: string;
} {
  const avgStat = (pet.happiness + pet.health + pet.hunger + pet.energy) / 4;

  if (avgStat >= 80) {
    return {
      mood: 'Excellent',
      emoji: '🌟',
      message: 'Your pet is thriving!'
    };
  } else if (avgStat >= 60) {
    return {
      mood: 'Happy',
      emoji: '😊',
      message: 'Your pet is doing great!'
    };
  } else if (avgStat >= 40) {
    return {
      mood: 'Okay',
      emoji: '😐',
      message: 'Your pet needs some attention.'
    };
  } else if (avgStat >= 20) {
    return {
      mood: 'Sad',
      emoji: '😢',
      message: 'Your pet is struggling!'
    };
  } else {
    return {
      mood: 'Critical',
      emoji: '💀',
      message: 'Your pet needs immediate care!'
    };
  }
}

export function getUnlockedPets(userLevel: number): Array<keyof typeof PET_TYPES> {
  return Object.entries(PET_TYPES)
    .filter(([, data]) => userLevel >= data.unlockLevel)
    .map(([type]) => type as keyof typeof PET_TYPES);
}

export function canAdoptPet(type: keyof typeof PET_TYPES, userLevel: number): boolean {
  return userLevel >= PET_TYPES[type].unlockLevel;
}

export { PET_TYPES };
