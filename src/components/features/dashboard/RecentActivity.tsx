import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLocalization } from '../../hooks/useLocalization';
import { Clock, Plus, Eye, Star, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';

interface RecentActivityProps {
  isLoading?: boolean;
  userData?: any;
}

interface ActivityItem {
  id: string;
  type: 'collection_created' | 'card_added' | 'wishlist_added' | 'collection_updated';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ComponentType<any>;
  color: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  isLoading = false,
  userData
}) => {
  const { t, currentLanguage } = useLocalization();
  
  // Mock activity data - in a real app, this would come from an API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'collection_created',
      title: t('dashboard.activity.collectionCreated', 'New Collection Created'),
      description: t('dashboard.activity.collectionCreatedDesc', 'Created "Base Set" collection'),
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: Plus,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'card_added',
      title: t('dashboard.activity.cardAdded', 'Card Added'),
      description: t('dashboard.activity.cardAddedDesc', 'Added Charizard to collection'),
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      icon: Star,
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'wishlist_added',
      title: t('dashboard.activity.wishlistAdded', 'Added to Wishlist'),
      description: t('dashboard.activity.wishlistAddedDesc', 'Added Pikachu to wishlist'),
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: Heart,
      color: 'text-red-600'
    },
    {
      id: '4',
      type: 'collection_updated',
      title: t('dashboard.activity.collectionUpdated', 'Collection Updated'),
      description: t('dashboard.activity.collectionUpdatedDesc', 'Updated "Gym Heroes" collection'),
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: Eye,
      color: 'text-purple-600'
    }
  ];

  const getLocale = () => {
    return currentLanguage === 'es' ? es : enUS;
  };

  const getActivityTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'collection_created':
        return t('dashboard.activity.types.collection', 'Collection');
      case 'card_added':
        return t('dashboard.activity.types.card', 'Card');
      case 'wishlist_added':
        return t('dashboard.activity.types.wishlist', 'Wishlist');
      case 'collection_updated':
        return t('dashboard.activity.types.update', 'Update');
      default:
        return t('dashboard.activity.types.other', 'Activity');
    }
  };

  const getActivityBadgeVariant = (type: ActivityItem['type']) => {
    switch (type) {
      case 'collection_created':
        return 'default';
      case 'card_added':
        return 'secondary';
      case 'wishlist_added':
        return 'destructive';
      case 'collection_updated':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('dashboard.activity.title', 'Recent Activity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('dashboard.activity.title', 'Recent Activity')}
          </div>
          <Button variant="ghost" size="sm">
            {t('dashboard.activity.viewAll', 'View All')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('dashboard.activity.empty', 'No recent activity')}
            </h3>
            <p className="text-gray-500">
              {t('dashboard.activity.emptyDesc', 'Start building your collection to see activity here')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full bg-gray-100`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <Badge 
                        variant={getActivityBadgeVariant(activity.type)}
                        className="text-xs"
                      >
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                        locale: getLocale()
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t('dashboard.activity.quickActions', 'Quick Actions')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.activity.addCard', 'Add Card')}
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Heart className="w-4 h-4 mr-2" />
              {t('dashboard.activity.addWishlist', 'Add to Wishlist')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;