
import { Search, MessageCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Discover',
      description: 'Browse thousands of items and services in your area, or search for exactly what you need',
      color: 'trust',
      gradient: 'from-trust-100 to-trust-200'
    },
    {
      icon: MessageCircle,
      title: 'Connect',
      description: 'Send a request to the owner and coordinate details through our secure messaging system',
      color: 'warm',
      gradient: 'from-warm-100 to-warm-200'
    },
    {
      icon: RotateCcw,
      title: 'Enjoy & Return',
      description: 'Use the item for your agreed period and return it safely to complete the borrowing cycle',
      color: 'success',
      gradient: 'from-success-100 to-success-200'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-trust-100 text-trust-700 rounded-full px-4 py-2 mb-6">
            <span className="font-medium">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How BorrowBuddy Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting what you need is as simple as 1, 2, 3. Join thousands who are already sharing smarter and building stronger communities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Enhanced connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 transform -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-trust-400 to-trust-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
              )}

              <div className="relative z-10 text-center space-y-6 group-hover:transform group-hover:scale-105 transition-all duration-500">
                {/* Enhanced icon circle */}
                <div className={`mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <step.icon className={`h-12 w-12 ${
                    step.color === 'trust' ? 'text-trust-600' :
                    step.color === 'warm' ? 'text-warm-600' :
                    'text-success-600'
                  }`} />
                </div>

                {/* Enhanced step number */}
                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white shadow-lg ${
                    step.color === 'trust' ? 'bg-gradient-to-r from-trust-600 to-trust-700' :
                    step.color === 'warm' ? 'bg-gradient-to-r from-warm-600 to-warm-700' :
                    'bg-gradient-to-r from-success-600 to-success-700'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Enhanced content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced bottom CTA */}
        <div className="text-center">
          <div className="glass-card inline-flex items-center space-x-4 px-8 py-4 rounded-2xl">
            <span className="text-trust-700 font-medium text-lg">Ready to get started?</span>
            <Button 
              variant="ghost" 
              className="text-trust-600 hover:text-trust-700 hover:bg-trust-50 font-medium group"
            >
              Browse items near you
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
