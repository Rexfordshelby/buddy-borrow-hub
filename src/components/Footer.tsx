
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Mail, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="gradient-primary rounded-lg p-2">
                <div className="h-6 w-6 bg-white rounded-sm flex items-center justify-center text-primary font-bold text-sm">
                  BP
                </div>
              </div>
              <span className="font-bold text-xl">BorrowPal</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted community marketplace for borrowing and lending. Building connections through sharing.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white p-2"
                onClick={() => window.open('https://www.instagram.com/_borrowpalofficial_?igsh=d3l3cjZqcHV1b3Vu', '_blank')}
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Facebook className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <nav className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">How It Works</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Browse Items</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">List an Item</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Safety & Trust</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Insurance</a>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Support</h3>
            <nav className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Community Guidelines</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            </nav>
          </div>

          {/* Contact & App Download */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Get In Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>raashifshaikh70@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Instagram className="h-4 w-4" />
                <span>@_borrowpalofficial_</span>
              </div>
            </div>

            {/* App Download Badges */}
            <div className="space-y-3">
              <h4 className="font-medium">Download Our App</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start h-12 bg-transparent border-gray-600 text-white hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📱</div>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="font-semibold">App Store</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 bg-transparent border-gray-600 text-white hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🤖</div>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="font-semibold">Google Play</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
              <p className="text-gray-400">Get the latest updates and community news delivered to your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <Input 
                placeholder="Enter your email" 
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-r-none"
              />
              <Button className="gradient-primary text-white border-0 rounded-l-none px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>&copy; 2024 BorrowPal. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
