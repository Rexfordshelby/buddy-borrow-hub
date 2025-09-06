
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Clock, Wrench, Car, Home, Utensils, Scissors, Camera, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import type { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

const serviceCategories = [
  { id: 'home', name: 'Home Services', icon: Home, color: 'bg-blue-100 text-blue-800' },
  { id: 'automotive', name: 'Automotive', icon: Car, color: 'bg-green-100 text-green-800' },
  { id: 'food', name: 'Food & Catering', icon: Utensils, color: 'bg-orange-100 text-orange-800' },
  { id: 'beauty', name: 'Beauty & Wellness', icon: Scissors, color: 'bg-pink-100 text-pink-800' },
  { id: 'event', name: 'Events & Photography', icon: Camera, color: 'bg-purple-100 text-purple-800' },
  { id: 'repair', name: 'Repair & Maintenance', icon: Wrench, color: 'bg-red-100 text-red-800' },
];

const Services = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles!provider_id (
            full_name,
            rating
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error loading services",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return Number(a.price) - Number(b.price);
      case 'price_high':
        return Number(b.price) - Number(a.price);
      case 'rating':
        return Number(b.rating) - Number(a.rating);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="h-12 bg-muted rounded-lg w-80 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="mb-8">
            <div className="h-8 bg-muted rounded w-48 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="p-4 text-center">
                    <div className="h-8 w-8 bg-muted rounded mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-card shadow-card">
                <div className="h-48 bg-muted rounded-t-lg animate-pulse"></div>
                <CardHeader className="pb-2">
                  <div className="h-6 bg-muted rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout showHeader={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Services Marketplace</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find trusted professionals for cleaning, repairs, tutoring, and specialized services in your community
          </p>
        </div>

        {/* Service Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8 gradient-text">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceCategories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover-lift glass-card group transition-all duration-300"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="glass-effect shadow-elegant">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-background/50"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 border-0 bg-background/50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 border-0 bg-background/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredServices.length === 0 ? "No services found" : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} available`}
          </p>
          <Button 
            onClick={() => navigate('/add-service')}
            variant="outline"
            className="hover-scale"
          >
            Offer Your Service
          </Button>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">No services found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 
                  `No services match "${searchTerm}". Try a different search term or browse all categories.` :
                  "Be the first to list a service in this category and start earning!"
                }
              </p>
              <div className="flex gap-3 justify-center">
                {searchTerm && (
                  <Button 
                    onClick={() => setSearchTerm('')}
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/add-service')} 
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                >
                  🚀 List Your Service
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="cursor-pointer hover-lift glass-card shadow-card group transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm" 
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <div className="h-48 bg-muted rounded-t-lg overflow-hidden relative">
                  {service.images && service.images.length > 0 ? (
                    <img 
                      src={service.images[0]} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                      <div className="text-center">
                        <Briefcase className="h-16 w-16 mx-auto mb-2" />
                        <p className="text-sm">Professional Service</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="backdrop-blur-sm bg-emerald-600/90 text-white">
                      {serviceCategories.find(cat => cat.id === service.category)?.name || service.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {service.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                      ${Number(service.price).toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/{service.price_type.replace('_', ' ')}</span>
                    </span>
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{Number(service.rating).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({service.total_reviews})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {service.description || 'Professional service available'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate text-xs">{service.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center text-emerald-600">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="text-xs">{service.availability || 'Available'}</span>
                    </div>
                  </div>
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {service.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/service/${service.id}`);
                      }}
                      size="sm"
                    >
                      Book Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/service/${service.id}`);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="glass-effect border-0 shadow-elegant">
            <CardContent className="p-8">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Offer Your Services
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of professionals earning on our marketplace. Share your skills and build your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/add-service')} className="gradient-primary shadow-glow">
                    🚀 Become a Service Provider
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/about')}>
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
