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
  type: 'item_listed' | 'service_listed' | 'booking_completed' | 'review_received' | 'payment_received' | 'message_received';
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
      // Mock activity data - in real app, this would come from various tables
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'item_listed',
          title: 'New item listed',
          description: 'Your Canon EOS R5 Camera is now live on the marketplace',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          metadata: { itemId: '1' }
        },
        {
          id: '2',
          type: 'booking_completed',
          title: 'Service completed',
          description: 'House cleaning service completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          user: {
            name: 'Sarah Johnson',
            avatar: undefined
          },
          metadata: { amount: 120, serviceId: '1' }
        },
        {
          id: '3',
          type: 'review_received',
          title: 'New review received',
          description: 'John Smith left you a 5-star review',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          user: {
            name: 'John Smith',
            avatar: undefined
          },
          metadata: { rating: 5 }
        },
        {
          id: '4',
          type: 'payment_received',
          title: 'Payment received',
          description: 'Payment of $85 for DSLR Camera rental',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          metadata: { amount: 85 }
        },
        {
          id: '5',
          type: 'service_listed',
          title: 'Service updated',
          description: 'Your Photography Service pricing has been updated',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          metadata: { serviceId: '2' }
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
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
      case 'message_received':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
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
        return <Badge className="text-xs bg-green-100 text-green-800">Completed</Badge>;
      case 'review_received':
        return <Badge className="text-xs bg-yellow-100 text-yellow-800">Review</Badge>;
      case 'payment_received':
        return <Badge className="text-xs bg-purple-100 text-purple-800">Payment</Badge>;
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
        <Button variant="ghost" size="sm">
          View All
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
                      <span className="text-sm font-bold text-green-600">
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