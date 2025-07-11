
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    location: 'San Francisco, CA',
    rating: 5,
    text: "BorrowBuddy saved me hundreds on my home renovation! I borrowed a drill, saw, and sanders from neighbors instead of buying them. The owners were super friendly and helpful.",
    category: 'Tools',
    avatar: '👩‍💼'
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    location: 'Austin, TX',
    rating: 5,
    text: "As a photography student, I couldn't afford expensive lenses. BorrowBuddy connected me with local photographers who let me rent their gear at amazing prices. Game changer!",
    category: 'Photography',
    avatar: '📸'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    location: 'Miami, FL',
    rating: 5,
    text: "I love that I can lend out my camping gear when I'm not using it. It's earning me extra income and helping others enjoy the outdoors without the huge upfront cost.",
    category: 'Outdoor',
    avatar: '🏕️'
  },
  {
    id: 4,
    name: 'David Kim',
    location: 'Seattle, WA',
    rating: 5,
    text: "The platform is so easy to use and the community is trustworthy. I've borrowed everything from a projector for movie nights to a pressure washer for my deck.",
    category: 'Electronics',
    avatar: '💻'
  }
];

export const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Our Community
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what real users are saying about their BorrowBuddy experience
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      {/* Avatar & Info */}
                      <div className="flex-shrink-0 text-center md:text-left">
                        <div className="text-6xl mb-4">{testimonial.avatar}</div>
                        <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                        <p className="text-gray-600 text-sm">{testimonial.location}</p>
                        <div className="flex items-center justify-center md:justify-start mt-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <div className="mt-3">
                          <span className="inline-block px-3 py-1 bg-trust-100 text-trust-700 rounded-full text-xs font-medium">
                            {testimonial.category}
                          </span>
                        </div>
                      </div>

                      {/* Testimonial Text */}
                      <div className="flex-1">
                        <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
                          "{testimonial.text}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-trust-600' : 'bg-gray-300'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
