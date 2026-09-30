import React from 'react';
import { Map, Compass, Bookmark, User } from 'lucide-react';

export type ActiveTab = 'map' | 'explore' | 'saved' | 'profile';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  savedCount
}) => {
  const navItems = [
    { id: 'map' as ActiveTab, label: 'Map', icon: Map },
    { id: 'explore' as ActiveTab, label: 'Explore', icon: Compass },
    { id: 'saved' as ActiveTab, label: 'Saved', icon: Bookmark, badge: savedCount > 0 ? savedCount : null },
    { id: 'profile' as ActiveTab, label: 'About', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 md:hidden py-1 px-4 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-campus-600 dark:text-campus-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-campus-600 dark:bg-campus-400 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
