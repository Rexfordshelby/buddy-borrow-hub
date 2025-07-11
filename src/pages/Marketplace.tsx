
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    total_reviews: number;
  };
}

const Marketplace = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  const categories = [
    'all', 'electronics', 'tools', 'sports', 'books', 'furniture', 
    'kitchen', 'automotive', 'clothing', 'gaming', 'other'
  ];

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, sortBy]);

  const fetchItems = async () => {
    setLoading(true);
    
    let query = supabase
      .from('items')
      .select(`
        *,
        profiles!items_owner_id_fkey (
          full_name,
          rating,
          total_reviews
        )
      `)
      .eq('availability', true);

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    if (sortBy === 'price_low') {
      query = query.order('price_per_day', { ascending: true });
    } else if (sortBy === 'price_high') {
      query = query.order('price_per_day', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching items:', error);
    } else {
      setItems(data || []);
    }
    
    setLoading(false);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Discover amazing items to borrow from your community</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleItemClick(item.id)}
              >
                <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {item.condition.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{item.profiles.rating.toFixed(1)}</span>
                    <span>({item.profiles.total_reviews})</span>
                  </div>
                </CardHeader>
                
                <CardContent className="py-2">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{item.location || 'Location not specified'}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-trust-600" />
                      <span className="font-semibold text-trust-600">
                        ${item.price_per_day}/day
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No items found matching your criteria</div>
            <Button onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
