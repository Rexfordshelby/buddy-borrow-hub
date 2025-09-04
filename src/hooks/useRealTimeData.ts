import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

interface UseRealTimeDataOptions<T> {
  table: string;
  select?: string;
  filter?: (query: any) => any;
  dependencies?: any[];
  onError?: (error: Error) => void;
}

export function useRealTimeData<T extends Record<string, any>>({
  table,
  select = '*',
  filter,
  dependencies = [],
  onError,
}: UseRealTimeDataOptions<T>) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(table as any)
        .select(select);

      if (filter) {
        query = filter(query);
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData((fetchedData as unknown as T[]) || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      } else {
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, table, select, filter, onError, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        () => {
          // Refetch data when changes occur
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, table, fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}