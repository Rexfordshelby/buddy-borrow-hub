
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Package, Briefcase, Shield, Star, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      
      {/* Quick Actions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What are you looking for?</h2>
            <p className="text-xl text-gray-600">Discover items to borrow or services to book</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Items Marketplace */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/marketplace')}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-trust-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Package className="h-8 w-8 text-trust-600" />
                </div>
                <CardTitle className="text-2xl">Borrow Items</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Find and borrow tools, electronics, books, and more from your community
                </p>
                <Button className="w-full" onClick={() => navigate('/marketplace')}>
                  Browse Items <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Services Marketplace */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services')}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Book Services</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Hire professionals for cleaning, repairs, cooking, and other services
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate('/services')}>
                  Browse Services <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TrustLend?</h2>
            <p className="text-xl text-gray-600">Built for trust, designed for convenience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Trusted</h3>
              <p className="text-gray-600">
                All users are verified, and every transaction is protected with our trust system
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rated Community</h3>
              <p className="text-gray-600">
                Rate and review every interaction to build a trusted community marketplace
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn & Save</h3>
              <p className="text-gray-600">
                Earn money by lending items or offering services, save by borrowing instead of buying
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-trust-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-trust-100">Items Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-trust-100">Services Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2000+</div>
              <div className="text-trust-100">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-trust-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <TestimonialsSlider />
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of users who are already borrowing, lending, and earning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/marketplace')}>
              Browse Items
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/services')}>
              Find Services
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
