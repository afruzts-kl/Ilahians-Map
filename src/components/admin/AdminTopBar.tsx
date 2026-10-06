import React from 'react';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../../hooks/useAdminAuth';

interface AdminTopBarProps {
  user: AdminUser;
  onSignOut: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ user, onSignOut }) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.name);
  const avatarColor = `hsl(${user.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 70%, 50%)`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Admin Badge */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">
              Admin Mode
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.role === 'superadmin' ? 'Super Administrator' : 'Editor'}
            </p>
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-800"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Name & Email */}
          <div className="hidden sm:block text-left">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {user.email}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};