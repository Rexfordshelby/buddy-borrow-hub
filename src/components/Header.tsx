
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Search, User, Bell, X } from 'lucide-react';
import { LoginModal } from './LoginModal';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="gradient-primary rounded-lg p-2">
              <div className="h-6 w-6 bg-white rounded-sm flex items-center justify-center text-trust-600 font-bold text-sm">
                BB
              </div>
            </div>
            <span className="font-bold text-xl text-gray-900">BorrowBuddy</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">Home</a>
            <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">Explore</a>
            <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">How it Works</a>
            <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">Support</a>
          </nav>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search items, services..." 
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)}>
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm" className="gradient-primary text-white border-0">
              List Item
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search items, services..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              <nav className="flex flex-col space-y-3">
                <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">Home</a>
                <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">Explore</a>
                <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">How it Works</a>
                <a href="#" className="text-gray-600 hover:text-trust-600 transition-colors">Support</a>
              </nav>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button className="gradient-primary text-white border-0">
                  List Item
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};
