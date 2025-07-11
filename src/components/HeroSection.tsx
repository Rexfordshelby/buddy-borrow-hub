
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-trust-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-trust-900 mb-6 leading-tight">
            Need it?{' '}
            <span className="bg-gradient-to-r from-trust-600 to-emerald-600 bg-clip-text text-transparent">
              Borrow it instantly.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with your community to borrow what you need or lend what you have. 
            Safe, simple, and sustainable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="gradient-primary text-lg px-8 py-4 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleBorrowClick}
            >
              🔍 Borrow Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 h-auto font-semibold border-2 border-trust-200 hover:border-trust-300 transition-all duration-300"
              onClick={handleListClick}
            >
              📦 List an Item
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Verified Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-trust-500 rounded-full"></div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Insurance Covered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
