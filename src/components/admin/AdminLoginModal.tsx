import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
      } else if (data?.user) {
        // Check if user is in admin allowlist
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (profile && (profile.role === 'superadmin' || profile.role === 'editor')) {
          onLoginSuccess();
          onClose();
        } else {
          // Sign out non-admin user
          await supabase.auth.signOut();
          setError('This account is not authorised.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-campus-100 dark:bg-campus-950/60 text-campus-700 dark:text-campus-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Admin Authentication</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">IlahiaNav Campus Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ilahia.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-campus-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-campus-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-campus-600 hover:bg-campus-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        {isSupabaseConfigured && (
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            Don&apos;t have an account? Contact the superadmin to be added to the allowlist.
          </p>
        )}
      </div>
    </div>
  );
};
