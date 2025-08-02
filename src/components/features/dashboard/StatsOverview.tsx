import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { useLocalization } from '../../../hooks/useLocalization';
import { useStats } from '../../../hooks/useStats';
import { Database, Heart, TrendingUp, Star } from 'lucide-react';
import { Collection } from '@/types/pokemon';

interface StatsOverviewProps {
  isLoading?: boolean;
  userData?: any;
  collections?: Collection[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  isLoading = false,
  userData,
  collections = []
}) => {
  const { t } = useLocalization();
  const { stats, isLoading: statsLoading } = useStats();

  const loading = isLoading || statsLoading;

  const statsData = [
    {
      title: t('dashboard.stats.collections', 'Collections'),
      value: stats.collectionsCount,
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: t('dashboard.stats.collectionsDesc', 'Total collections')
    },
    {
      title: t('dashboard.stats.cards', 'Cards'),
      value: stats.cardsCount,
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: t('dashboard.stats.cardsDesc', 'Cards in collection')
    },
    {
      title: t('dashboard.stats.wishlist', 'Wishlist'),
      value: stats.wishlistCount,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: t('dashboard.stats.wishlistDesc', 'Cards in wishlist')
    },
    {
      title: t('dashboard.stats.completion', 'Completion'),
      value: stats.cardsCount > 0 ? Math.round((stats.cardsCount / (stats.cardsCount + stats.wishlistCount)) * 100) : 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: t('dashboard.stats.completionDesc', 'Collection progress'),
      isPercentage: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {stat.value}{stat.isPercentage ? '%' : ''}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                {stat.isPercentage && !loading && (
                  <div className="w-16">
                    <Progress value={stat.value} className="h-2" />
                  </div>
                )}
              </div>
              
              {/* Additional info for collections */}
              {index === 0 && collections.length > 0 && !loading && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    {collections.some(c => c.is_default) && (
                      <Badge variant="secondary" className="text-xs">
                        {t('dashboard.stats.hasDefault', 'Default set')}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {t('dashboard.stats.recentActivity', 'Recently active')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsOverview;