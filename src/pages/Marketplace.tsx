
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Calendar, Star } from 'lucide-react';
import { Layout } from '@/components/Layout';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price_per_day: number;
  deposit_amount: number;
  location: string;
  images: string[];
  profiles: {
    full_name: string;
    rating: number;
  };
}

const categories = [
  'electronics',
  'tools', 
  'sports',
  'books',
  'furniture',
  'kitchen',
  'automotive',
  'clothing',
  'gaming',
  'other'
] as const;

type Category = typeof categories[number];

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles!owner_id (
            full_name,
            rating
          )
        `)
        .eq('availability', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to load items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="h-12 bg-muted rounded-lg w-64 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="h-12 bg-muted rounded flex-1 animate-pulse"></div>
                  <div className="h-12 bg-muted rounded w-48 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
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
    );
  }

  return (
    <Layout showHeader={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">Marketplace</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing items to rent from trusted community members. From tech gear to outdoor equipment, find what you need when you need it.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="glass-effect shadow-elegant">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search for anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-background/50"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category | 'all')}>
                  <SelectTrigger className="w-full md:w-48 border-0 bg-background/50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredItems.length === 0 ? "No items found" : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} available`}
          </p>
          <Button 
            onClick={() => navigate('/add-item')}
            variant="outline"
            className="hover-scale"
          >
            List Your Item
          </Button>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">No items found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 
                  `No items match "${searchTerm}". Try a different search term or browse all categories.` :
                  "Be the first to list an item in this category and start earning!"
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
                  onClick={() => navigate('/add-item')} 
                  className="gradient-primary"
                >
                  🚀 List Your First Item
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover-lift glass-card shadow-card group transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm" 
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <div className="h-48 bg-muted rounded-t-lg overflow-hidden relative">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                      <Calendar className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-black font-medium">
                      {item.condition.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="backdrop-blur-sm bg-primary/90 text-white">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold gradient-text">
                      ${item.price_per_day}
                      <span className="text-sm font-normal text-muted-foreground">/day</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {item.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate text-xs">{item.location || 'Location not specified'}</span>
                    </div>
                    {item.profiles?.rating && (
                      <div className="flex items-center text-amber-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs font-medium">{Number(item.profiles.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      by {item.profiles?.full_name || 'Unknown Owner'}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ${item.deposit_amount} deposit
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add some spacing at the bottom */}
        <div className="h-16" />
      </div>
    </Layout>
  );
};

export default Marketplace;
