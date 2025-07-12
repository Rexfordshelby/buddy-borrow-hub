
import { Home, Search, Plus, Wallet, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Package, Briefcase } from 'lucide-react';

export const MobileBottomNav = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'explore', icon: Search, label: 'Explore', path: '/marketplace' },
    { id: 'add', icon: Plus, label: 'Add', path: null }, // Special case for dropdown
    { id: 'wallet', icon: Wallet, label: 'Wallet', path: '/wallet' },
    { id: 'profile', icon: User, label: 'Profile', path: '/dashboard' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'add') {
      // Don't set active tab for the add button
      return;
    }
    setActiveTab(item.id);
    navigate(item.path!);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          item.id === 'add' ? (
            <DropdownMenu key={item.id}>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center p-2 min-w-0 flex-1">
                  <div className="p-1 bg-trust-600 text-white rounded-full mb-1">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-trust-600">{item.label}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={8}>
                <DropdownMenuItem onClick={() => navigate('/add-item')}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>List Item</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/add-service')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>List Service</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                activeTab === item.id
                  ? 'text-trust-600'
                  : 'text-gray-400'
              }`}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        ))}
      </div>
    </div>
  );
};
