
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Package, Briefcase, Shield, Star, Users, TrendingUp, Zap, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      
      {/* Platform Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <StatsOverview />
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Start Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What are you looking for?</h2>
            <p className="text-xl text-muted-foreground">Discover items to borrow or services to book in your community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Items Marketplace */}
            <Card className="card-modern hover-lift cursor-pointer group" onClick={() => navigate('/marketplace')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl gradient-text">Borrow Items</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Find and borrow tools, electronics, books, sports equipment and more from your neighbors
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Instant booking</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Insured items</span>
                  </div>
                </div>
                <Button className="w-full gradient-primary group-hover:shadow-glow transition-all duration-300" onClick={() => navigate('/marketplace')}>
                  Browse Items <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Services Marketplace */}
            <Card className="card-modern hover-lift cursor-pointer group" onClick={() => navigate('/services')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Book Services</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Hire trusted professionals for cleaning, repairs, tutoring, and specialized services
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Award className="h-3 w-3" />
                    <span>Verified pros</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Star className="h-3 w-3" />
                    <span>Top rated</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white group-hover:shadow-glow transition-all duration-300" onClick={() => navigate('/services')}>
                  Browse Services <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Component */}
          <div className="max-w-4xl mx-auto">
            <QuickActions />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Why Choose BorrowPal</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Built for trust, designed for <span className="gradient-text">convenience</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join a community that values sharing, sustainability, and mutual support
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover-lift">
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Secure & Trusted</h3>
              <p className="text-muted-foreground leading-relaxed">
                All users are verified, and every transaction is protected with our comprehensive trust and insurance system
              </p>
            </div>
            
            <div className="text-center group hover-lift">
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Star className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Rated Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rate and review every interaction to build a trusted community marketplace where quality matters
              </p>
            </div>
            
            <div className="text-center group hover-lift">
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Earn & Save</h3>
              <p className="text-muted-foreground leading-relaxed">
                Earn money by lending items or offering services, save by borrowing instead of buying everything new
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Join Our Growing Community</h3>
            <p className="text-lg text-white/90">Thousands of people are already sharing smarter</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <div className="text-white/80 font-medium">Items Available</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-white/80 font-medium">Services Listed</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">2000+</div>
              <div className="text-white/80 font-medium">Happy Users</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">4.8★</div>
              <div className="text-white/80 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <TestimonialsSlider />
      
      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-8">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">Start Your Journey</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">transform</span> how you share?
            </h2>
            
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already borrowing, lending, and building stronger communities together
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 h-auto text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => navigate('/marketplace')}
              >
                Browse Items
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 h-auto text-lg font-semibold transition-all duration-300"
                onClick={() => navigate('/services')}
              >
                Find Services
                <Briefcase className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Verified Community</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
