import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Star, Briefcase, Clock, Award, Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  location: string;
  images: string[];
  tags: string[];
  rating: number;
  total_reviews: number;
  profiles: {
    full_name: string;
    rating: number;
  };
}

const serviceCategories = [
  'cleaning',
  'repairs',
  'tutoring',
  'pet_care',
  'gardening',
  'photography',
  'fitness',
  'beauty',
  'tech_support',
  'delivery',
  'consulting',
  'other'
] as const;

type ServiceCategory = typeof serviceCategories[number];
type SortOption = 'newest' | 'price_low' | 'price_high' | 'rating';

const Services = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // First fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      if (!servicesData || servicesData.length === 0) {
        setServices([]);
        return;
      }

      // Get unique provider IDs
      const providerIds = [...new Set(servicesData.map(service => service.provider_id))];

      // Fetch profiles for all providers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, rating')
        .in('id', providerIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by ID for efficient lookup
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Combine services with their provider profiles
      const servicesWithProfiles = servicesData.map(service => ({
        ...service,
        profiles: profilesMap.get(service.provider_id) || {
          full_name: 'Unknown Provider',
          rating: 0
        }
      }));

      setServices(servicesWithProfiles);
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
      <Layout>
        <div className="bg-gradient-to-br from-background via-background to-emerald-50/30">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <div className="h-12 bg-muted rounded-lg w-80 mx-auto mb-6 animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-96 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="glass-card shadow-card border-0 bg-card/80">
                  <div className="h-48 bg-muted rounded-t-lg animate-pulse"></div>
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded mb-2 animate-pulse"></div>
                    <div className="h-8 bg-muted rounded w-24 animate-pulse"></div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-background via-background to-emerald-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">Services Marketplace</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hire trusted professionals for any task. From home services to specialized skills, find the perfect provider for your needs.
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-8">
            <Card className="glass-effect shadow-elegant">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-0 bg-background/50"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ServiceCategory | 'all')}>
                      <SelectTrigger className="w-full sm:w-48 border-0 bg-background/50">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                      <SelectTrigger className="w-full sm:w-48 border-0 bg-background/50">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {filteredServices.length === 0 ? "No services found" : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} available`}
            </p>
            <Button 
              onClick={() => navigate('/add-service')}
              variant="outline"
              className="hover-scale"
            >
              <Plus className="h-4 w-4 mr-2" />
              Offer Service
            </Button>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  No services found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 
                    `No services match "${searchTerm}". Try a different search term or browse all categories.` :
                    "Be the first to offer a service in this category and start earning!"
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
                    💼 Offer Your Service
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover-lift glass-card shadow-card group transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm" 
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-t-lg overflow-hidden relative">
                    {service.images && service.images.length > 0 ? (
                      <img 
                        src={service.images[0]} 
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-600">
                        <Briefcase className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="backdrop-blur-sm bg-emerald-600/90 text-white">
                        {service.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                        ${Number(service.price).toFixed(2)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{service.price_type.replace('_', ' ')}
                        </span>
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {service.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate text-xs">{service.location || 'Remote/Flexible'}</span>
                      </div>
                      <div className="flex items-center text-amber-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs font-medium">{Number(service.rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="text-xs text-muted-foreground">
                        by {service.profiles.full_name}
                      </div>
                      <div className="flex items-center text-xs text-emerald-600">
                        <Award className="h-3 w-3 mr-1" />
                        {service.total_reviews} reviews
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Services;