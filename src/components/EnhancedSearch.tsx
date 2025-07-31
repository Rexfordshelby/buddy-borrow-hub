import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Clock, TrendingUp, MapPin, Star, Package, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'item' | 'service';
  category: string;
  price: number;
  location?: string;
  rating: number;
  image?: string;
}

interface EnhancedSearchProps {
  className?: string;
  onSelect?: () => void;
}

export const EnhancedSearch = ({ className, onSelect }: EnhancedSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Search items
      const { data: items } = await supabase
        .from('items')
        .select('id, title, description, category, price_per_day, location, images')
        .eq('availability', true)
        .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%, category.ilike.%${searchQuery}%`)
        .limit(5);

      // Search services
      const { data: services } = await supabase
        .from('services')
        .select('id, title, description, category, price, location, rating, images')
        .eq('is_active', true)
        .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%, category.ilike.%${searchQuery}%`)
        .limit(5);

      const searchResults: SearchResult[] = [
        ...(items || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: 'item' as const,
          category: item.category,
          price: item.price_per_day,
          location: item.location,
          rating: 0,
          image: item.images?.[0]
        })),
        ...(services || []).map(service => ({
          id: service.id,
          title: service.title,
          description: service.description,
          type: 'service' as const,
          category: service.category,
          price: service.price,
          location: service.location,
          rating: service.rating || 0,
          image: service.images?.[0]
        }))
      ];

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    const path = result.type === 'item' ? `/item/${result.id}` : `/service/${result.id}`;
    navigate(path);
    
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    setIsOpen(false);
    setQuery('');
    onSelect?.();
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    searchRef.current?.focus();
  };

  const trendingSearches = ['Camera', 'Laptop', 'Cleaning', 'Repair', 'Cooking'];

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={searchRef}
          placeholder="Search items, services, or categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 py-3 text-lg border-0 bg-background/80 backdrop-blur-sm shadow-elegant"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 glass-effect shadow-elegant max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {query.length <= 2 ? (
              <div className="p-4 space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecentSearch(search)}
                          className="text-xs"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecentSearch(search)}
                        className="text-xs"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No results found for "{query}"</p>
                    <p className="text-sm mt-1">Try different keywords or browse categories</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {results.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleSelect(result)}
                      >
                        <div className="flex items-center gap-3">
                          {result.image ? (
                            <img 
                              src={result.image} 
                              alt={result.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              {result.type === 'item' ? 
                                <Package className="h-6 w-6 text-muted-foreground" /> :
                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                              }
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{result.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {result.description || `${result.category} • $${result.price}${result.type === 'item' ? '/day' : ''}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {result.location && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {result.location}
                                </div>
                              )}
                              {result.rating > 0 && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {result.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-sm">${result.price}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.type === 'item' ? '/day' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};