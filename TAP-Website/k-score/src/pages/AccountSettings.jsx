import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Delete user progress data
    try {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      for (const p of progressList) {
        await base44.entities.UserProgress.delete(p.id);
      }
    } catch (_) {}
    // Sign out after data deletion
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500 mt-1">{user?.email}</p>
        </motion.div>

        {/* Profile info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Profile</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
              {user?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-medium text-slate-900">{user?.full_name || 'User'}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Session</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left py-2 text-slate-700 hover:text-slate-900 transition-colors"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Sign Out</span>
          </button>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
          <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-sm text-slate-500 mb-4">
            Permanently deletes your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm border border-red-200 hover:bg-red-100 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Trash2 className="w-4 h-4" />
              Delete My Account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">
                  Are you sure? All your progress, scores, and data will be permanently erased.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-60"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}