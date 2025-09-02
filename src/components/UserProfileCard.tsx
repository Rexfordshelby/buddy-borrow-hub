import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar, Package, Briefcase, MessageCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  rating: number;
  total_reviews: number;
  created_at: string;
  verified?: boolean;
}

interface UserStats {
  totalItems: number;
  totalServices: number;
  totalTransactions: number;
  joinedDate: string;
}

interface UserProfileCardProps {
  userId: string;
  showActions?: boolean;
  className?: string;
}

export const UserProfileCard = ({ userId, showActions = true, className }: UserProfileCardProps) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .rpc('get_public_profile', { _id: userId });

      if (data && data[0]) {
        setProfile(data[0]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Get user's items count
      const { count: itemsCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId);

      // Get user's services count
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', userId);

      // Get completed transactions count
      const { count: transactionsCount } = await supabase
        .from('borrow_requests')
        .select('*', { count: 'exact', head: true })
        .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`)
        .eq('status', 'completed');

      setStats({
        totalItems: itemsCount || 0,
        totalServices: servicesCount || 0,
        totalTransactions: transactionsCount || 0,
        joinedDate: profile?.created_at || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    // Implementation for opening chat
    navigate(`/chat/${userId}`);
  };

  const handleViewProfile = () => {
    navigate(`/profile/${userId}`);
  };

  if (loading || !profile) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-effect shadow-elegant hover-lift transition-all duration-300 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
              {profile.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {profile.verified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
              <Shield className="h-4 w-4 text-blue-500 fill-current" />
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-bold text-lg">{profile.full_name}</h3>
          {profile.location && (
            <div className="flex items-center justify-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              {profile.location}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(profile.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium ml-1">
            {profile.rating.toFixed(1)} ({profile.total_reviews} reviews)
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground text-center line-clamp-3">
            {profile.bio}
          </p>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Package className="h-4 w-4 text-primary mr-1" />
                <span className="font-bold text-lg">{stats.totalItems}</span>
              </div>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary mr-1" />
                <span className="font-bold text-lg">{stats.totalServices}</span>
              </div>
              <p className="text-xs text-muted-foreground">Services</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary mr-1" />
                <span className="font-bold text-lg">{stats.totalTransactions}</span>
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMessage}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button 
              size="sm" 
              onClick={handleViewProfile}
              className="flex-1 gradient-primary"
            >
              View Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};