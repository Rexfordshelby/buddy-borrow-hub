
import { Home, Search, Plus, Wallet, User } from 'lucide-react';
import { useState } from 'react';

export const MobileBottomNav = () => {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'borrow', icon: Plus, label: 'Borrow' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
              activeTab === item.id
                ? 'text-trust-600'
                : 'text-gray-400'
            }`}
          >
            <item.icon 
              className={`h-6 w-6 mb-1 ${
                item.id === 'borrow' 
                  ? 'p-1 bg-trust-600 text-white rounded-full' 
                  : ''
              }`} 
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
