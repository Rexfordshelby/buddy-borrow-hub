import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Package, Briefcase, Search, Filter, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FavoriteButton } from '../components/FavoriteButton';
import { Layout } from '@/components/Layout';

interface FavoriteItem {
  id: string;
  type: 'item' | 'service';
  title: string;
  description?: string;
  price: number;
  location?: string;
  rating?: number;
  image?: string;
  category: string;
}

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'items' | 'services'>('all');

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user favorites and then get the actual items/services separately
      const { data: userFavorites, error } = await supabase
        .from('user_favorites')
        .select('id, item_id, service_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
        return;
      }

      const favoriteItems: FavoriteItem[] = [];
      
      // Fetch items
      const itemIds = userFavorites?.filter(f => f.item_id).map(f => f.item_id) || [];
      if (itemIds.length > 0) {
        const { data: items } = await supabase
          .from('items')
          .select('id, title, description, price_per_day, location, images, category')
          .in('id', itemIds);

        items?.forEach(item => {
          favoriteItems.push({
            id: item.id,
            type: 'item',
            title: item.title,
            description: item.description,
            price: item.price_per_day,
            location: item.location,
            image: item.images?.[0],
            category: item.category
          });
        });
      }

      // Fetch services
      const serviceIds = userFavorites?.filter(f => f.service_id).map(f => f.service_id) || [];
      if (serviceIds.length > 0) {
        const { data: services } = await supabase
          .from('services')
          .select('id, title, description, price, location, images, category, rating')
          .in('id', serviceIds);

        services?.forEach(service => {
          favoriteItems.push({
            id: service.id,
            type: 'service',
            title: service.title,
            description: service.description,
            price: service.price,
            location: service.location,
            rating: service.rating,
            image: service.images?.[0],
            category: service.category
          });
        });
      }
      
      setFavorites(favoriteItems);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'items' && item.type === 'item') ||
                         (filter === 'services' && item.type === 'service');
    return matchesSearch && matchesFilter;
  });

  const handleItemClick = (item: FavoriteItem) => {
    const path = item.type === 'item' ? `/item/${item.id}` : `/service/${item.id}`;
    navigate(path);
  };

  if (!user) {
    return (
      <Layout showHeader={true}>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Card className="max-w-md mx-auto glass-effect">
            <CardContent className="text-center p-8">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-4">Please sign in to view favorites</h2>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">My Favorites</h1>
          <p className="text-muted-foreground text-lg">
            Your saved items and services in one place
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="glass-effect shadow-elegant">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search favorites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-background/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'items' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('items')}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Items
                  </Button>
                  <Button
                    variant={filter === 'services' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('services')}
                  >
                    <Briefcase className="h-4 w-4 mr-1" />
                    Services
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorites Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="glass-effect">
                <div className="h-48 bg-muted rounded-t-lg animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Heart className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-4 gradient-text">
                {searchTerm ? 'No matching favorites' : 'No favorites yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 
                  `No favorites match "${searchTerm}". Try a different search term.` :
                  'Start exploring the marketplace and save items you love!'
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
                  onClick={() => navigate('/marketplace')} 
                  className="gradient-primary"
                >
                  Browse Marketplace
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((item) => (
              <Card 
                key={`${item.type}-${item.id}`}
                className="cursor-pointer hover-lift glass-card shadow-card group transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm"
                onClick={() => handleItemClick(item)}
              >
                <div className="h-48 bg-muted rounded-t-lg overflow-hidden relative">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                      {item.type === 'item' ? 
                        <Package className="h-16 w-16" /> :
                        <Briefcase className="h-16 w-16" />
                      }
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-black font-medium">
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <FavoriteButton 
                      itemId={item.type === 'item' ? item.id : undefined}
                      serviceId={item.type === 'service' ? item.id : undefined}
                      size="sm"
                    />
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold gradient-text">
                      ${item.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        {item.type === 'item' ? '/day' : ''}
                      </span>
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-3">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {item.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    {item.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate text-xs">{item.location}</span>
                      </div>
                    )}
                    {item.rating && item.rating > 0 && (
                      <div className="flex items-center text-amber-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;