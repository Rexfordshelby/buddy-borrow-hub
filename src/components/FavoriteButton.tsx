import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  itemId?: string;
  serviceId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton = ({ itemId, serviceId, className, size = 'md' }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (itemId || serviceId)) {
      checkFavoriteStatus();
    }
  }, [user, itemId, serviceId]);

  const checkFavoriteStatus = async () => {
    if (!user || (!itemId && !serviceId)) return;

    try {
      // For now, use localStorage to simulate favorites
      const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
      const favoriteKey = itemId ? `item_${itemId}` : `service_${serviceId}`;
      setIsFavorited(favorites.includes(favoriteKey));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    if (!itemId && !serviceId) return;

    setLoading(true);
    try {
      // For now, use localStorage to simulate favorites
      const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
      const favoriteKey = itemId ? `item_${itemId}` : `service_${serviceId}`;
      
      if (isFavorited) {
        // Remove from favorites
        const updatedFavorites = favorites.filter((fav: string) => fav !== favoriteKey);
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites list.",
        });
      } else {
        // Add to favorites
        const updatedFavorites = [...favorites, favoriteKey];
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "Item saved to your favorites list.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(
        "rounded-full transition-all duration-200 hover:scale-105",
        sizeClasses[size],
        isFavorited ? 
          "bg-red-100 hover:bg-red-200 text-red-600" : 
          "bg-white/80 hover:bg-white text-muted-foreground hover:text-red-500",
        className
      )}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          isFavorited && "fill-current"
        )} 
      />
    </Button>
  );
};