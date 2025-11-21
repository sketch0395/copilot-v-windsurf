'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { loadGamificationData } from '@/utils/gamification';
import { usePetSync } from '@/hooks/usePetSync';
import {
  PetState,
  createNewPet,
  updatePetStats,
  feedPet,
  playWithPet,
  restPet,
  levelUpPet,
  getPetMood,
  getUnlockedPets,
  canAdoptPet,
  PET_TYPES
} from '@/utils/pet';

export default function PetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showAdoption, setShowAdoption] = useState(false);
  const [petName, setPetName] = useState('');
  const [selectedType, setSelectedType] = useState<PetState['type']>('cat');
  const [userLevel, setUserLevel] = useState(1);
  const { pet, savePet, isLoading } = usePetSync(userLevel);
  const [cooldowns, setCooldowns] = useState({
    feed: false,
    play: false,
    rest: false
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Get user level
    const gamificationData = loadGamificationData();
    setUserLevel(gamificationData.level);
  }, [user, router]);

  // Auto-update pet stats every minute
  useEffect(() => {
    if (!pet) return;

    const interval = setInterval(() => {
      const updatedPet = updatePetStats(pet);
      const leveledPet = levelUpPet(updatedPet, userLevel);
      
      // Only save if stats actually changed to avoid unnecessary saves
      if (
        updatedPet.health !== pet.health ||
        updatedPet.happiness !== pet.happiness ||
        updatedPet.hunger !== pet.hunger ||
        updatedPet.energy !== pet.energy ||
        leveledPet.level !== pet.level
      ) {
        savePet(leveledPet);
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [pet, userLevel, savePet]);

  const handleAdoptPet = () => {
    if (!petName.trim()) return;
    
    const newPet = createNewPet(petName, selectedType);
    savePet(newPet);
    setShowAdoption(false);
    setPetName('');
  };

  const handleFeed = () => {
    if (!pet || cooldowns.feed) return;
    const updatedPet = feedPet(pet);
    if (updatedPet.lastFed !== pet.lastFed) {
      savePet(updatedPet);
      setCooldowns({ ...cooldowns, feed: true });
      setTimeout(() => setCooldowns(prev => ({ ...prev, feed: false })), 3600000); // 1 hour
    }
  };

  const handlePlay = () => {
    if (!pet || cooldowns.play) return;
    const updatedPet = playWithPet(pet);
    if (updatedPet.lastPlayed !== pet.lastPlayed) {
      savePet(updatedPet);
      setCooldowns({ ...cooldowns, play: true });
      setTimeout(() => setCooldowns(prev => ({ ...prev, play: false })), 7200000); // 2 hours
    }
  };

  const handleRest = () => {
    if (!pet || cooldowns.rest) return;
    const updatedPet = restPet(pet);
    if (updatedPet.lastSlept !== pet.lastSlept) {
      savePet(updatedPet);
      setCooldowns({ ...cooldowns, rest: true });
      setTimeout(() => setCooldowns(prev => ({ ...prev, rest: false })), 14400000); // 4 hours
    }
  };

  const handleRelease = () => {
    if (confirm(`Are you sure you want to release ${pet?.name}? This cannot be undone!`)) {
      savePet(null); // Clear pet data both locally and in cloud
    }
  };

  const getStatColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const unlockedPets = getUnlockedPets(userLevel);
  const mood = pet ? getPetMood(pet) : null;

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            🐾 Your Focus Pet
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          🐾 Your Focus Pet
        </h1>

        {!pet ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">🥚</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Adopt Your First Pet!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your pet will grow with you as you complete tasks and level up!
            </p>
            <button
              onClick={() => setShowAdoption(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Adopt a Pet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pet Display */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {pet.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Level {pet.level} {PET_TYPES[pet.type].name}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{mood?.emoji}</div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mood?.mood}
                  </p>
                </div>
              </div>

              {/* Pet Avatar */}
              <div className="text-center mb-6">
                <div className="text-9xl mb-4 animate-bounce">
                  {PET_TYPES[pet.type].emoji}
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  {mood?.message}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">💖 Health</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {Math.round(pet.health)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatColor(pet.health)} transition-all`}
                      style={{ width: `${pet.health}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">😊 Happiness</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {Math.round(pet.happiness)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatColor(pet.happiness)} transition-all`}
                      style={{ width: `${pet.happiness}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">🍖 Hunger</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {Math.round(pet.hunger)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatColor(pet.hunger)} transition-all`}
                      style={{ width: `${pet.hunger}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">⚡ Energy</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {Math.round(pet.energy)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatColor(pet.energy)} transition-all`}
                      style={{ width: `${pet.energy}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={handleFeed}
                  disabled={cooldowns.feed}
                  className="flex flex-col items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-3xl mb-2">🍖</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    Feed
                  </span>
                  {cooldowns.feed && (
                    <span className="text-xs text-gray-500">1h cooldown</span>
                  )}
                </button>

                <button
                  onClick={handlePlay}
                  disabled={cooldowns.play}
                  className="flex flex-col items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-3xl mb-2">🎾</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    Play
                  </span>
                  {cooldowns.play && (
                    <span className="text-xs text-gray-500">2h cooldown</span>
                  )}
                </button>

                <button
                  onClick={handleRest}
                  disabled={cooldowns.rest}
                  className="flex flex-col items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-3xl mb-2">💤</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    Rest
                  </span>
                  {cooldowns.rest && (
                    <span className="text-xs text-gray-500">4h cooldown</span>
                  )}
                </button>
              </div>
            </div>

            {/* Pet Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                📊 Pet Info
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Days Alive</p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {Math.floor((Date.now() - pet.createdAt) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {PET_TYPES[pet.type].name}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleRelease}
                className="mt-6 w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Release Pet
              </button>
            </div>

            {/* Unlock Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                🔓 Available Pets
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {Object.entries(PET_TYPES).map(([type, data]) => (
                  <div
                    key={type}
                    className={`text-center p-3 rounded-lg ${
                      canAdoptPet(type as keyof typeof PET_TYPES, userLevel)
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-100 dark:bg-gray-700 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{data.emoji}</div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {data.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Lvl {data.unlockLevel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Adoption Modal */}
        {showAdoption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Adopt Your Pet
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Enter a name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  maxLength={20}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {unlockedPets.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedType === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-4xl mb-1">{PET_TYPES[type].emoji}</div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {PET_TYPES[type].name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAdoptPet}
                  disabled={!petName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adopt
                </button>
                <button
                  onClick={() => {
                    setShowAdoption(false);
                    setPetName('');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
