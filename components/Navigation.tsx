import React from 'react';
import { Home, BookOpen } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'home', icon: Home },
    { id: 'diary', icon: BookOpen },
  ];

  return (
    <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="bg-[#33302E] rounded-full px-8 py-4 shadow-2xl flex items-center gap-10 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-8"
            >
              <item.icon
                size={26}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-colors duration-300 ${
                  isActive ? 'text-rose-500' : 'text-stone-500 hover:text-stone-400'
                }`}
              />
              {isActive && (
                <span className="absolute -bottom-2 w-1 h-1 bg-rose-500 rounded-full animate-fade-in" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;