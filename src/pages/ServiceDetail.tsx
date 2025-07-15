import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Clock, Camera, ArrowLeft, MessageSquare, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Service not found",
        description: "The service you're looking for doesn't exist or has been removed.",
        variant: "destructive",
      });
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (!service) return;
    // Navigate to booking form or open booking modal
    toast({
      title: "Booking feature coming soon",
      description: "Service booking functionality will be available soon.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Service not found</h2>
            <Button onClick={() => navigate('/services')}>Back to Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/services')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Images */}
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground text-center">
                <Camera className="h-16 w-16 mx-auto mb-4" />
                <p>Service Image</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{service.title}</h1>
                  <Badge variant="secondary" className="mb-2">
                    {service.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    ${Number(service.price).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {service.price_type.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{Number(service.rating).toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">({service.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {service.location || 'Location not specified'}
                </div>
                <div className="flex items-center text-green-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {service.availability || 'Available'}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description || 'No description available.'}
              </p>
            </div>

            {service.tags && service.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-3">
              <Button onClick={handleBookService} className="w-full gradient-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Book This Service
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Provider
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;