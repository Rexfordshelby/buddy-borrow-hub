
import { DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import { StatsCard } from './StatsCard';

export const QuickStats = () => {
  const stats = [
    {
      title: 'Total Earnings',
      value: '$2,847',
      change: '+12% from last month',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-6 w-6" />,
    },
    {
      title: 'Active Listings',
      value: '23',
      change: '+3 new this week',
      changeType: 'positive' as const,
      icon: <Package className="h-6 w-6" />,
    },
    {
      title: 'Total Borrows',
      value: '156',
      change: '+8% this month',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: 'Trust Score',
      value: '4.8',
      change: 'Excellent rating',
      changeType: 'positive' as const,
      icon: <Users className="h-6 w-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};
