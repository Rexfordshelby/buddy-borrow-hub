import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, Users, Star, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatCard {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

export const StatsOverview = () => {
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: "Total Items",
      value: "0",
      change: "+12%",
      trend: 'up',
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Active Users",
      value: "0",
      change: "+8%",
      trend: 'up',
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Avg Rating",
      value: "4.8",
      change: "+0.2",
      trend: 'up',
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Total Earnings",
      value: "$0",
      change: "+15%",
      trend: 'up',
      icon: DollarSign,
      color: "text-purple-600"
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total items
        const { count: itemsCount } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true });

        // Fetch total users (profiles)
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Update stats
        setStats(prev => prev.map(stat => {
          if (stat.title === "Total Items") {
            return { ...stat, value: itemsCount?.toString() || "0" };
          }
          if (stat.title === "Active Users") {
            return { ...stat, value: usersCount?.toString() || "0" };
          }
          return stat;
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && (
              <div className="flex items-center space-x-1 mt-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                  }`}
                >
                  {stat.change}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};