
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, HandHeart, ShieldCheck } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-trust-50 via-white to-success-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-0"></div>
      
      <div className="container relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full px-4 py-2 bg-success-100 text-success-700 text-sm font-medium">
                <HandHeart className="h-4 w-4 mr-2" />
                Trusted by 50K+ users
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Need it?{' '}
                <span className="text-transparent bg-clip-text gradient-primary">
                  Borrow it
                </span>
                {' '}instantly.
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Connect with your community to borrow what you need and lend what you don't use. 
                From tools to tech, make sharing simple and sustainable.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gradient-primary text-white border-0 h-14 px-8 text-lg font-medium">
                Borrow Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium border-2 border-trust-200 hover:bg-trust-50">
                List an Item
                <Search className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center text-gray-600">
                <ShieldCheck className="h-5 w-5 text-success-600 mr-2" />
                <span className="text-sm">Secure & Insured</span>
              </div>
              <div className="flex items-center text-gray-600">
                <div className="h-5 w-5 bg-success-600 rounded-full mr-2 flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="relative animate-slide-up">
            <div className="relative z-10">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 ml-auto max-w-md">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 bg-trust-100 rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-trust-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Camera Lens</h3>
                    <p className="text-gray-500 text-sm">Photography Equipment</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="font-bold text-trust-600">$25/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-gray-500 ml-1 text-sm">(4.9)</span>
                    </div>
                  </div>
                  <Button className="w-full gradient-success text-white border-0">
                    Request to Borrow
                  </Button>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 glass-card">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm font-medium">Available Now</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-trust-600">2.5k+</div>
                  <div className="text-xs text-gray-500">Items Available</div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-3xl transform rotate-6"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
