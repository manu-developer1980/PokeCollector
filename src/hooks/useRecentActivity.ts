import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'subscription_change' | 'collection_created' | 'audit_log';
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface UseRecentActivityReturn {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRecentActivity = (): UseRecentActivityReturn => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent users (last 24 hours)
      const { data: recentUsers, error: usersError } = await supabase
        .from('users')
        .select('id, email, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (usersError) throw usersError;

      // Mock recent subscription changes (table doesn't exist)
      const recentSubscriptions: any[] = [];

      // Fetch recent collections (last 24 hours)
      const { data: recentCollections, error: collectionsError } = await supabase
        .from('collections')
        .select('id, name, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (collectionsError) throw collectionsError;

      // Mock recent audit logs (table doesn't exist)
      const recentAuditLogs: any[] = [];

      // Combine and format all activities
      const allActivities: ActivityItem[] = [];

      // Add user registrations
      recentUsers?.forEach(user => {
        allActivities.push({
          id: `user-${user.id}`,
          type: 'user_registration',
          description: `Nuevo usuario registrado: ${user.email}`,
          timestamp: user.created_at,
          icon: 'UserCheck',
          color: 'text-green-600'
        });
      });

      // Add subscription changes
      recentSubscriptions?.forEach(sub => {
        allActivities.push({
          id: `subscription-${sub.id}`,
          type: 'subscription_change',
          description: `Cambio de suscripción: ${sub.old_plan || 'Gratuito'} → ${sub.new_plan}`,
          timestamp: sub.change_date,
          icon: 'CreditCard',
          color: 'text-blue-600'
        });
      });

      // Add collection creations
      recentCollections?.forEach(collection => {
        allActivities.push({
          id: `collection-${collection.id}`,
          type: 'collection_created',
          description: `Nueva colección creada: ${collection.name}`,
          timestamp: collection.created_at,
          icon: 'Database',
          color: 'text-purple-600'
        });
      });

      // Add audit log activities
      recentAuditLogs?.forEach(log => {
        allActivities.push({
          id: `audit-${log.id}`,
          type: 'audit_log',
          description: `Acción: ${log.action} en ${log.entity_type}`,
          timestamp: log.created_at,
          icon: 'Activity',
          color: 'text-indigo-600'
        });
      });

      // Sort by timestamp (most recent first) and take top 10
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setActivities(sortedActivities);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchRecentActivity();
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  return {
    activities,
    loading,
    error,
    refetch
  };
};

// Helper function to format relative time
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'hace un momento';
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `hace ${diffInDays}d`;
};