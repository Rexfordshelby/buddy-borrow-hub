
import { Search, MessageCircle, RotateCcw } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Find',
      description: 'Browse thousands of items in your area or search for exactly what you need',
      color: 'trust'
    },
    {
      icon: MessageCircle,
      title: 'Request',
      description: 'Send a request to the owner and coordinate pickup details through our secure chat',
      color: 'warm'
    },
    {
      icon: RotateCcw,
      title: 'Return',
      description: 'Use the item for your agreed period and return it in the same condition',
      color: 'success'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How BorrowBuddy Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting what you need is as simple as 1, 2, 3. Join thousands who are already sharing smarter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 transform -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              )}

              <div className="relative z-10 text-center space-y-6 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                {/* Icon Circle */}
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                  step.color === 'trust' ? 'bg-trust-100' :
                  step.color === 'warm' ? 'bg-warm-100' :
                  'bg-success-100'
                }`}>
                  <step.icon className={`h-10 w-10 ${
                    step.color === 'trust' ? 'text-trust-600' :
                    step.color === 'warm' ? 'text-warm-600' :
                    'text-success-600'
                  }`} />
                </div>

                {/* Step Number */}
                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${
                    step.color === 'trust' ? 'bg-trust-600' :
                    step.color === 'warm' ? 'bg-warm-600' :
                    'bg-success-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-trust-600 font-medium">
            <span>Ready to get started?</span>
            <button className="underline hover:no-underline transition-all">
              Browse items near you →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
