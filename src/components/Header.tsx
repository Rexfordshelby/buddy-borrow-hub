
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Package, Plus, ArrowLeft, Briefcase } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const canGoBack = location.pathname !== '/';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/marketplace':
        return 'Marketplace';
      case '/services':
        return 'Services';
      case '/add-item':
        return 'List Item';
      case '/add-service':
        return 'List Service';
      case '/dashboard':
        return 'Dashboard';
      case '/wallet':
        return 'Wallet';
      default:
        return '';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-trust-600 to-trust-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-trust-800">BorrowBuddy</span>
                {getPageTitle() && (
                  <span className="text-sm text-gray-600">{getPageTitle()}</span>
                )}
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/marketplace')}
              className={`transition-colors ${
                location.pathname === '/marketplace' 
                  ? 'text-trust-600 font-medium' 
                  : 'text-gray-600 hover:text-trust-600'
              }`}
            >
              Marketplace
            </button>
            <button 
              onClick={() => navigate('/services')}
              className={`transition-colors ${
                location.pathname === '/services' 
                  ? 'text-trust-600 font-medium' 
                  : 'text-gray-600 hover:text-trust-600'
              }`}
            >
              Services
            </button>
            <button 
              onClick={() => navigate('/about')}
              className={`transition-colors ${
                location.pathname === '/about' 
                  ? 'text-trust-600 font-medium' 
                  : 'text-gray-600 hover:text-trust-600'
              }`}
            >
              About
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/add-item')}
                  className="hidden md:flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List Item
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/add-service')}
                  className="hidden md:flex items-center"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  List Service
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/add-item')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>List Item</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/add-service')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>List Service</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="gradient-primary"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
