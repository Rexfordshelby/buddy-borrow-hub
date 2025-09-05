import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings, Heart, BarChart3, Wallet, Plus, Package, Briefcase, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from './NotificationCenter';
import { ThemeSelector } from './ThemeSelector';
import borrowpalLogo from "@/assets/borrowpal-logo-new.png";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
      case '/about':
        return 'About';
      case '/profile':
        return 'Profile';
      case '/settings':
        return 'Settings';
      case '/favorites':
        return 'Favorites';
      default:
        return '';
    }
  };

  const navItems = [
    { label: "Home", path: "/", icon: null },
    { label: "Marketplace", path: "/marketplace", icon: Package },
    { label: "Services", path: "/services", icon: Briefcase },
    { label: "About", path: "/about", icon: null },
  ];

  const userNavItems = user ? [
    { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { label: "Favorites", path: "/favorites", icon: Heart },
    { label: "Wallet", path: "/wallet", icon: Wallet },
    { label: "Profile", path: "/profile", icon: User },
    { label: "Settings", path: "/settings", icon: Settings },
  ] : [];

  const quickActions = user ? [
    { label: "List Item", path: "/add-item", icon: Plus, variant: "outline" as const },
    { label: "Offer Service", path: "/add-service", icon: Plus, variant: "outline" as const },
  ] : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Back Button & Logo */}
          <div className="flex items-center space-x-4">
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover-scale"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            
            <div 
              className="flex items-center space-x-3 cursor-pointer hover-scale" 
              onClick={() => navigate('/')}
            >
              <img 
                src={borrowpalLogo} 
                alt="BorrowPal" 
                className="h-10 w-auto object-contain"
              />
              {getPageTitle() && (
                <div className="hidden sm:block border-l border-border/50 pl-3">
                  <span className="text-lg font-semibold text-foreground">
                    {getPageTitle()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="relative transition-all duration-200 hover-scale"
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {item.label}
                  {location.pathname === item.path && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Right Section - Actions & Theme */}
          <div className="flex items-center space-x-2">
            {/* Theme Selector */}
            <ThemeSelector />
            
            {/* Notifications (only when authenticated) */}
            {user && <NotificationCenter />}

            {user ? (
              <>
                {/* Quick Actions - Desktop */}
                <div className="hidden lg:flex items-center space-x-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.path}
                        variant={action.variant}
                        size="sm"
                        onClick={() => navigate(action.path)}
                        className="hover-scale"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    );
                  })}
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-effect" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Manage your account</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {userNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="cursor-pointer"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="hover-scale"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="gradient-primary shadow-glow hover-scale"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-10 w-10 hover-scale">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] glass-effect">
                <div className="flex flex-col h-full">
                  {/* Logo in mobile menu */}
                  <div className="flex items-center space-x-2 mb-8 pb-4 border-b border-border/20">
                    <img 
                      src={borrowpalLogo} 
                      alt="BorrowPal" 
                      className="h-8 w-auto object-contain"
                    />
                    <span className="text-lg font-bold gradient-text">BorrowPal</span>
                  </div>

                  {/* Navigation Items */}
                  <nav className="flex flex-col space-y-2 mb-6">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.path}
                          variant={location.pathname === item.path ? "default" : "ghost"}
                          onClick={() => {
                            navigate(item.path);
                            setIsOpen(false);
                          }}
                          className="justify-start"
                        >
                          {Icon && <Icon className="h-4 w-4 mr-2" />}
                          {item.label}
                        </Button>
                      );
                    })}
                  </nav>

                  {user ? (
                    <>
                      {/* Quick Actions */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <Button
                                key={action.path}
                                variant={action.variant}
                                onClick={() => {
                                  navigate(action.path);
                                  setIsOpen(false);
                                }}
                                className="w-full justify-start"
                              >
                                <Icon className="h-4 w-4 mr-2" />
                                {action.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* User Section */}
                      <div className="border-t border-border/20 pt-6 mt-auto">
                        <div className="flex items-center space-x-3 mb-4 p-3 rounded-lg bg-muted/30">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" alt="User" />
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {user.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-muted-foreground">User Account</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {userNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Button
                                key={item.path}
                                variant="ghost"
                                onClick={() => {
                                  navigate(item.path);
                                  setIsOpen(false);
                                }}
                                className="w-full justify-start"
                              >
                                <Icon className="h-4 w-4 mr-2" />
                                {item.label}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleSignOut();
                            setIsOpen(false);
                          }}
                          className="w-full justify-start text-destructive hover:text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3 mt-auto pt-6 border-t border-border/20">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          navigate('/auth');
                          setIsOpen(false);
                        }}
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => {
                          navigate('/auth');
                          setIsOpen(false);
                        }} 
                        className="w-full gradient-primary"
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