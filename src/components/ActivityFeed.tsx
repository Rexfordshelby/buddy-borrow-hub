import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Briefcase, 
  Star, 
  MessageSquare, 
  CreditCard, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'item_listed' | 'service_listed' | 'booking_completed' | 'review_received' | 'payment_received' | 'rental_request' | 'service_booked';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    amount?: number;
    rating?: number;
    itemId?: string;
    serviceId?: string;
    requestId?: string;
  };
}

export const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const activities: ActivityItem[] = [];

      // Fetch recent items listed by user
      const { data: recentItems } = await supabase
        .from('items')
        .select('id, title, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentItems) {
        activities.push(...recentItems.map(item => ({
          id: `item-${item.id}`,
          type: 'item_listed' as const,
          title: 'New item listed',
          description: `Your ${item.title} is now live on the marketplace`,
          timestamp: item.created_at,
          metadata: { itemId: item.id }
        })));
      }

      // Fetch recent rental requests for user's items
      const { data: rentalRequests } = await supabase
        .from('borrow_requests')
        .select(`
          id, created_at, status,
          items!inner(title, owner_id),
          profiles!borrow_requests_borrower_id_fkey(full_name)
        `)
        .eq('items.owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (rentalRequests) {
        activities.push(...rentalRequests.map(request => ({
          id: `request-${request.id}`,
          type: 'rental_request' as const,
          title: 'New rental request',
          description: `${request.profiles.full_name} wants to rent your ${request.items.title}`,
          timestamp: request.created_at,
          user: {
            name: request.profiles.full_name,
            avatar: undefined
          },
          metadata: { requestId: request.id }
        })));
      }

      // Fetch recent service bookings completed
      const { data: serviceBookings } = await supabase
        .from('service_bookings')
        .select(`
          id, created_at, booking_date, total_amount,
          services!inner(title, provider_id),
          customer:profiles!service_bookings_customer_id_fkey(full_name)
        `)
        .eq('services.provider_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (serviceBookings) {
        activities.push(...serviceBookings.map(booking => ({
          id: `booking-${booking.id}`,
          type: 'booking_completed' as const,
          title: 'Service completed',
          description: `${booking.services.title} completed successfully`,
          timestamp: booking.created_at,
          user: {
            name: booking.customer.full_name,
            avatar: undefined
          },
          metadata: { amount: booking.total_amount, serviceId: booking.id }
        })));
      }

      // Fetch recent reviews received (as reviewee)
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          id, rating, created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name)
        `)
        .eq('reviewee_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviews) {
        activities.push(...reviews.map(review => ({
          id: `review-${review.id}`,
          type: 'review_received' as const,
          title: 'New review received',
          description: `${review.reviewer.full_name} left you a ${review.rating}-star review`,
          timestamp: review.created_at,
          user: {
            name: review.reviewer.full_name,
            avatar: undefined
          },
          metadata: { rating: review.rating }
        })));
      }

      // Fetch recent wallet transactions (payments received)
      const { data: payments } = await supabase
        .from('wallet_transactions')
        .select('id, amount, description, created_at')
        .eq('user_id', user.id)
        .eq('type', 'payment_received')
        .order('created_at', { ascending: false })
        .limit(5);

      if (payments) {
        activities.push(...payments.map(payment => ({
          id: `payment-${payment.id}`,
          type: 'payment_received' as const,
          title: 'Payment received',
          description: payment.description || `You received $${payment.amount.toFixed(2)}`,
          timestamp: payment.created_at,
          metadata: { amount: payment.amount }
        })));
      }

      // Fetch recent services listed by user
      const { data: recentServices } = await supabase
        .from('services')
        .select('id, title, created_at, updated_at')
        .eq('provider_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (recentServices) {
        activities.push(...recentServices.map(service => ({
          id: `service-${service.id}`,
          type: 'service_listed' as const,
          title: service.created_at === service.updated_at ? 'Service listed' : 'Service updated',
          description: `Your ${service.title} ${service.created_at === service.updated_at ? 'is now live' : 'has been updated'}`,
          timestamp: service.updated_at,
          metadata: { serviceId: service.id }
        })));
      }

      // Fetch recent service bookings for user's services
      const { data: newBookings } = await supabase
        .from('service_bookings')
        .select(`
          id, created_at, booking_date,
          services!inner(title, provider_id),
          customer:profiles!service_bookings_customer_id_fkey(full_name)
        `)
        .eq('services.provider_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (newBookings) {
        activities.push(...newBookings.map(booking => ({
          id: `new-booking-${booking.id}`,
          type: 'service_booked' as const,
          title: 'New service booking',
          description: `${booking.customer.full_name} booked your ${booking.services.title} for ${new Date(booking.booking_date).toLocaleDateString()}`,
          timestamp: booking.created_at,
          user: {
            name: booking.customer.full_name,
            avatar: undefined
          },
          metadata: { serviceId: booking.id }
        })));
      }

      // Sort all activities by timestamp and take the most recent 10
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'item_listed':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'service_listed':
        return <Briefcase className="h-5 w-5 text-green-500" />;
      case 'booking_completed':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'review_received':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'payment_received':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'rental_request':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'service_booked':
        return <Briefcase className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'item_listed':
      case 'service_listed':
        return <Badge variant="outline" className="text-xs">Listed</Badge>;
      case 'booking_completed':
        return <Badge className="text-xs bg-success/10 text-success-foreground">Completed</Badge>;
      case 'review_received':
        return <Badge className="text-xs bg-warning/10 text-warning-foreground">Review</Badge>;
      case 'payment_received':
        return <Badge className="text-xs bg-primary/10 text-primary-foreground">Payment</Badge>;
      case 'rental_request':
        return <Badge className="text-xs bg-accent/10 text-accent-foreground">Request</Badge>;
      case 'service_booked':
        return <Badge className="text-xs bg-secondary/10 text-secondary-foreground">Booking</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect shadow-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchActivities}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Start listing items or services to see activity here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 mt-1">
                  {activity.user ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="p-1.5 rounded-full bg-background border">
                      {getActivityIcon(activity.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.title}</p>
                    {getActivityBadge(activity.type)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                    
                    {activity.metadata?.amount && (
                      <span className="text-sm font-bold text-success">
                        +${activity.metadata.amount}
                      </span>
                    )}
                    
                    {activity.metadata?.rating && (
                      <div className="flex items-center text-xs">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {activity.metadata.rating}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};