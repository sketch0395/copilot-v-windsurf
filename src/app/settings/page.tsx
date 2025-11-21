'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, deleteAccount } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    setError('');
    setDeleting(true);

    try {
      await deleteAccount();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            ⚙️ Account Settings
          </h1>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Display Name
                </label>
                <p className="text-lg text-gray-800 dark:text-white">
                  {user.displayName || 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <p className="text-lg text-gray-800 dark:text-white">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
              ⚠️ Danger Zone
            </h2>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Delete My Account
                </button>
              ) : (
                <div className="bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
                  <p className="font-semibold text-red-800 dark:text-red-400 mb-3">
                    Are you absolutely sure?
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 list-disc list-inside space-y-1">
                    <li>Your account and login credentials</li>
                    <li>All your routines and schedules</li>
                    <li>Your gamification progress (points, levels, achievements)</li>
                    <li>Your usage history and streaks</li>
                  </ul>
                  
                  {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? '⏳ Deleting...' : '✓ Yes, Delete Everything'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setError('');
                      }}
                      disabled={deleting}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
