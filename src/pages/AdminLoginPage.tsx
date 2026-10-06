import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, AlertCircle, Chrome } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { isSupabaseConfigured } from '../services/supabase';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle, signInWithEmail, isLoading: authLoading, clearError } = useAdminAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supabase Not Configured</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Admin features require Supabase credentials. Please add <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_URL</code> and <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_ANON_KEY</code> to your environment variables.
            </p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Required Setup:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Create Supabase project</li>
              <li>Run migrations 001, 003, 004</li>
              <li>Enable Email & Google auth providers</li>
              <li>Add admin emails to <code>admin_emails</code> table</li>
              <li>Create <code>blueprints</code> storage bucket</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-campus-100 dark:bg-campus-950/60 flex items-center justify-center mx-auto mb-4 text-campus-600 dark:text-campus-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">IlahiaNav Campus Management</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
                disabled={loading || authLoading}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-campus-500 disabled:opacity-50"
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
                disabled={loading || authLoading}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-campus-500 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full py-3 bg-campus-600 hover:bg-campus-700 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {loading || authLoading ? 'Signing in...' : 'Sign In with Email'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading || authLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors disabled:opacity-50"
        >
          <Chrome className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>

        {/* Info Note */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Only emails in the admin allowlist can access this portal.
          <br />
          Contact the superadmin to request access.
        </p>
      </div>
    </div>
  );
};