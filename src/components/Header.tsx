import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Package, Plus, ArrowLeft, Briefcase, Menu, Palette } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { ThemeSelector } from './ThemeSelector';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useNavigate, useLocation } from 'react-router-dom';
import borrowpalLogo from '@/assets/borrowpal-logo.png';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navigationItems = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button & Logo */}
          <div className="flex items-center space-x-4">
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center hover-scale"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <img 
                  src={borrowpalLogo} 
                  alt="BorrowPal" 
                  className="h-10 w-auto transition-all duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-heading font-bold gradient-text">
                  BorrowPal
                </span>
                {getPageTitle() ? (
                  <span className="text-sm text-muted-foreground font-medium">
                    {getPageTitle()}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground font-medium">
                    Share • Borrow • Connect
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-scale ${
                  location.pathname === item.path 
                    ? 'text-primary bg-primary/10 shadow-button' 
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Selector */}
            <ThemeSelector />
            
            {/* Notifications (only when authenticated) */}
            {user && <NotificationCenter />}

            {user ? (
              <>
                {/* Quick Action Buttons - Desktop */}
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/add-item')}
                  className="hidden lg:flex items-center hover-scale border-primary/20 hover:border-primary/40"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List Item
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/add-service')}
                  className="hidden lg:flex items-center hover-scale border-primary/20 hover:border-primary/40"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  List Service
                </Button>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-gradient-primary p-0.5 hover:shadow-glow transition-all duration-300">
                      <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-popover/95 backdrop-blur-sm border border-border/50" align="end">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/add-item')} className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>List Item</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/add-service')} className="cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>List Service</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')} className="cursor-pointer">
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Guest Actions */
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                  className="hover-scale border-primary/20 hover:border-primary/40"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="btn-gradient"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover-scale">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background/95 backdrop-blur-sm">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left text-lg font-medium transition-colors ${
                        location.pathname === item.path 
                          ? 'text-primary' 
                          : 'text-foreground hover:text-primary'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                  
                  {user && (
                    <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          navigate('/add-item');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        List Item
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          navigate('/add-service');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        List Service
                      </Button>
                    </div>
                  )}
                  
                  {!user && (
                    <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          navigate('/auth');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => {
                          navigate('/auth');
                          setMobileMenuOpen(false);
                        }}
                        className="btn-gradient"
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};