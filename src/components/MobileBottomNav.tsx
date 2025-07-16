
import { Home, Search, Plus, Wallet, User, Package, Briefcase } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const MobileBottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'explore', icon: Search, label: 'Browse', path: '/marketplace' },
    { id: 'add', icon: Plus, label: 'Add', path: null }, // Special case for dropdown
    { id: 'wallet', icon: Wallet, label: 'Wallet', path: '/wallet' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'add') {
      return;
    }
    navigate(item.path!);
  };

  const isActiveTab = (path: string | null) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          item.id === 'add' ? (
            <DropdownMenu key={item.id}>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center p-3 min-w-0 flex-1 group">
                  <div className="p-2 bg-gradient-to-r from-trust-600 to-trust-700 text-white rounded-xl mb-1 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-trust-600">{item.label}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={8} className="w-48">
                <DropdownMenuItem onClick={() => navigate('/add-item')} className="gap-3">
                  <Package className="h-4 w-4" />
                  <span>List Item</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/add-service')} className="gap-3">
                  <Briefcase className="h-4 w-4" />
                  <span>List Service</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 transition-all duration-300 ${
                isActiveTab(item.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1 rounded-lg mb-1 transition-all duration-300 ${
                isActiveTab(item.path) ? 'bg-primary/10' : 'hover:bg-muted'
              }`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        ))}
      </div>
    </div>
  );
};
