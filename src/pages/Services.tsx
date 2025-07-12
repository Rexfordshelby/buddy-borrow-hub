
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Clock, Wrench, Car, Home, Utensils, Scissors, Camera } from 'lucide-react';

const serviceCategories = [
  { id: 'home', name: 'Home Services', icon: Home, color: 'bg-blue-100 text-blue-800' },
  { id: 'automotive', name: 'Automotive', icon: Car, color: 'bg-green-100 text-green-800' },
  { id: 'food', name: 'Food & Catering', icon: Utensils, color: 'bg-orange-100 text-orange-800' },
  { id: 'beauty', name: 'Beauty & Wellness', icon: Scissors, color: 'bg-pink-100 text-pink-800' },
  { id: 'event', name: 'Events & Photography', icon: Camera, color: 'bg-purple-100 text-purple-800' },
  { id: 'repair', name: 'Repair & Maintenance', icon: Wrench, color: 'bg-red-100 text-red-800' },
];

const sampleServices = [
  {
    id: '1',
    title: 'Professional House Cleaning',
    description: 'Deep cleaning service for homes and apartments. Eco-friendly products used.',
    category: 'home',
    provider: 'Sarah Johnson',
    rating: 4.8,
    reviews: 124,
    price: 50,
    priceType: 'per_visit',
    location: 'New York, NY',
    availability: 'Available today',
    tags: ['Deep Cleaning', 'Eco-friendly', 'Same Day'],
    image: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Mobile Car Detailing',
    description: 'Complete car wash and detailing service at your location.',
    category: 'automotive',
    provider: 'Mike\'s Auto Care',
    rating: 4.9,
    reviews: 89,
    price: 80,
    priceType: 'per_service',
    location: 'Los Angeles, CA',
    availability: 'Next available: Tomorrow',
    tags: ['Mobile Service', 'Premium', 'Wax Included'],
    image: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'Private Chef Service',
    description: 'Personal chef for dinner parties, meal prep, and special occasions.',
    category: 'food',
    provider: 'Chef Maria Rodriguez',
    rating: 5.0,
    reviews: 67,
    price: 120,
    priceType: 'per_hour',
    location: 'Chicago, IL',
    availability: 'Book 2 days ahead',
    tags: ['Fine Dining', 'Meal Prep', 'Special Diets'],
    image: '/placeholder.svg'
  },
  {
    id: '4',
    title: 'Plumbing Repair Service',
    description: 'Emergency and scheduled plumbing repairs, installations, and maintenance.',
    category: 'repair',
    provider: 'QuickFix Plumbing',
    rating: 4.7,
    reviews: 203,
    price: 75,
    priceType: 'per_hour',
    location: 'Houston, TX',
    availability: '24/7 Emergency',
    tags: ['Emergency', '24/7', 'Licensed'],
    image: '/placeholder.svg'
  }
];

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState(sampleServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Marketplace</h1>
          <p className="text-gray-600">Find trusted professionals for all your service needs</p>
        </div>

        {/* Service Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Service Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceCategories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <category.icon className="h-8 w-8 mx-auto mb-2 text-trust-600" />
                  <p className="text-sm font-medium">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
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
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1">{service.title}</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {serviceCategories.find(cat => cat.id === service.category)?.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.reviews})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {service.location}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-2xl font-bold text-trust-600">
                      ${service.price}
                    </span>
                    <span className="text-sm text-gray-500">/{service.priceType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.availability}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {service.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-3">by {service.provider}</p>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => navigate(`/service/${service.id}`)}
                  >
                    Book Now
                  </Button>
                  <Button variant="outline" size="sm">
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="bg-trust-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Offer Your Services</h3>
              <p className="mb-6">Join our marketplace and start earning by offering your professional services</p>
              <Button variant="secondary" onClick={() => navigate('/add-service')}>
                Become a Service Provider
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;
