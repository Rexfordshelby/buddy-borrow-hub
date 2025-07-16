import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Star, Clock, Heart, Award, Target, Zap } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-primary">BorrowBuddy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're building the future of sharing economy - connecting people who need things 
            with people who have them, creating a sustainable and community-driven marketplace.
          </p>
          <Button size="lg" onClick={() => navigate('/marketplace')}>
            Join Our Community
          </Button>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              To create a world where sharing is the norm, not the exception. We believe that 
              by connecting communities and enabling people to share resources, we can build 
              a more sustainable future while helping everyone save money and reduce waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Community First</h3>
                <p className="text-muted-foreground">
                  Building stronger communities by connecting neighbors and fostering trust through shared experiences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                <p className="text-muted-foreground">
                  Reducing waste and environmental impact by maximizing the use of existing resources.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  Leveraging technology to make sharing simple, safe, and accessible for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Trust & Safety</h3>
              <p className="text-sm text-muted-foreground">
                Every interaction is protected by our comprehensive verification and insurance system.
              </p>
            </div>

            <div className="text-center">
              <Users className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                We believe in the power of community and building lasting relationships.
              </p>
            </div>

            <div className="text-center">
              <Star className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                We maintain high standards for all items and services on our platform.
              </p>
            </div>

            <div className="text-center">
              <Clock className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Convenience</h3>
              <p className="text-sm text-muted-foreground">
                Making sharing as easy as buying, with 24/7 support and seamless experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">JD</span>
                </div>
                <h3 className="font-semibold mb-1">John Doe</h3>
                <p className="text-sm text-muted-foreground mb-3">CEO & Founder</p>
                <p className="text-sm">
                  Passionate about building sustainable communities and leveraging technology for social good.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">JS</span>
                </div>
                <h3 className="font-semibold mb-1">Jane Smith</h3>
                <p className="text-sm text-muted-foreground mb-3">CTO</p>
                <p className="text-sm">
                  Tech leader with 10+ years building scalable platforms and exceptional user experiences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">MJ</span>
                </div>
                <h3 className="font-semibold mb-1">Mike Johnson</h3>
                <p className="text-sm text-muted-foreground mb-3">Head of Community</p>
                <p className="text-sm">
                  Community builder focused on creating safe, inclusive spaces for sharing and collaboration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-sm opacity-90">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-sm opacity-90">Items Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-sm opacity-90">Dollars Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25K+</div>
              <div className="text-sm opacity-90">CO2 Reduced (lbs)</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join the Movement?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start sharing, saving, and building connections in your community today.
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

export default About;