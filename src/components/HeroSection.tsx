
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBorrowClick = () => {
    if (user) {
      navigate('/marketplace');
    } else {
      navigate('/auth');
    }
  };

  const handleListClick = () => {
    if (user) {
      navigate('/add-item');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-trust-50 via-white to-trust-100 py-20 lg:py-32 overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-trust-200 to-trust-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-warm-200 to-warm-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Enhanced hero badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-trust-200 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-trust-600" />
            <span className="text-sm font-medium text-trust-700">Trusted by 10,000+ users</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-trust-900 mb-6 leading-tight animate-slide-up">
            Need it?{' '}
            <span className="bg-gradient-to-r from-trust-600 via-emerald-600 to-trust-700 bg-clip-text text-transparent">
              Borrow it instantly.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Connect with your community to borrow what you need or lend what you have. 
            Safe, simple, and sustainable sharing made easy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up">
            <Button 
              size="lg" 
              className="gradient-primary text-lg px-8 py-4 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={handleBorrowClick}
            >
              🔍 Borrow Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 h-auto font-semibold border-2 border-trust-200 hover:border-trust-300 hover:bg-trust-50 transition-all duration-300 group"
              onClick={handleListClick}
            >
              📦 List an Item
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Enhanced trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 animate-fade-in">
            <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-full">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Verified Users</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-full">
              <Zap className="w-5 h-5 text-trust-500" />
              <span className="font-medium">Instant Booking</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-warm-500" />
              <span className="font-medium">Insured Items</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
