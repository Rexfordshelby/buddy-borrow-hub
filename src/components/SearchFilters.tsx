import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  MapPin,
  DollarSign,
  Star
} from "lucide-react";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
}

export const SearchFilters = ({ onSearch, onFilterChange }: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [rating, setRating] = useState([0]);

  const categories = [
    "Electronics", "Tools", "Books", "Sports", "Home & Garden", 
    "Clothing", "Photography", "Music", "Automotive", "Other"
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    
    setActiveFilters(newFilters);
    onFilterChange({ categories: newFilters, priceRange, rating });
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setPriceRange([0, 100]);
    setRating([0]);
    onFilterChange({ categories: [], priceRange: [0, 100], rating: [0] });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for items, services, or locations..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-12 h-12 text-base"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Location Filter */}
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Enter location or zip code"
          className="flex-1"
        />
        <Button variant="outline" size="sm">
          Use My Location
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => toggleFilter(filter)}
            >
              {filter}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <CollapsibleContent>
          <Card className="card-modern">
            <CardContent className="p-6 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  Categories
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={activeFilters.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter(category)}
                      className="justify-start h-8 text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Price Range (per day)
                </h4>
                <div className="space-y-3">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Minimum Rating
                </h4>
                <div className="space-y-3">
                  <Slider
                    value={rating}
                    onValueChange={setRating}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Any</span>
                    <span>{rating[0]}+ stars</span>
                  </div>
                </div>
              </div>

              {/* Apply Filters */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  onClick={() => onFilterChange({ categories: activeFilters, priceRange, rating })}
                  className="flex-1 gradient-primary"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};