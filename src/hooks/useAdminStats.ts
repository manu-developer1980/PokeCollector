import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';

export interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  subscriptionGrowth: number;
  totalCollections: number;
  newCollectionsThisWeek: number;
  totalCardsInCollections: number;
  recentActivity: number;
  systemHealth: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeSubscriptions: 0,
    subscriptionGrowth: 0,
    totalCollections: 0,
    newCollectionsThisWeek: 0,
    totalCardsInCollections: 0,
    recentActivity: 0,
    systemHealth: 98,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas usando consultas directas
      const [
        usersResult,
        subscriptionsResult,
        collectionsResult,
        cardsResult,
        activityResult
      ] = await Promise.all([
        // Usuarios totales y nuevos este mes
        supabase
          .from('users')
          .select('id, created_at, is_active')
          .eq('is_active', true),
        
        // Suscripciones activas
        supabase
          .from('subscriptions')
          .select('id, status, created_at')
          .eq('status', 'active'),
        
        // Colecciones totales y nuevas esta semana
        supabase
          .from('collections')
          .select('id, created_at'),
        
        // Total de cartas en colecciones
        supabase
          .from('collection_cards')
          .select('id'),
        
        // Actividad reciente (logs de auditoría)
        supabase
          .from('audit_logs')
          .select('id, created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Procesar resultados
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalUsers = usersResult.data?.length || 0;
      const newUsersThisMonth = usersResult.data?.filter(user => 
        new Date(user.created_at) >= oneMonthAgo
      ).length || 0;

      const activeSubscriptions = subscriptionsResult.data?.length || 0;
      const newSubscriptionsThisMonth = subscriptionsResult.data?.filter(sub => 
        new Date(sub.created_at) >= oneMonthAgo
      ).length || 0;

      const totalCollections = collectionsResult.data?.length || 0;
      const newCollectionsThisWeek = collectionsResult.data?.filter(collection => 
        new Date(collection.created_at) >= oneWeekAgo
      ).length || 0;

      const totalCardsInCollections = cardsResult.data?.length || 0;
      const recentActivity = activityResult.data?.length || 0;

      // Calcular crecimiento de suscripciones
      const subscriptionGrowth = activeSubscriptions > 0 
        ? Math.round((newSubscriptionsThisMonth / activeSubscriptions) * 100)
        : 0;

      setStats({
        totalUsers,
        newUsersThisMonth,
        activeSubscriptions,
        subscriptionGrowth,
        totalCollections,
        newCollectionsThisWeek,
        totalCardsInCollections,
        recentActivity,
        systemHealth: 98, // Valor fijo por ahora
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Error al cargar las estadísticas');
      
      // En caso de error, mantener valores por defecto
      setStats({
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeSubscriptions: 0,
        subscriptionGrowth: 0,
        totalCollections: 0,
        newCollectionsThisWeek: 0,
        totalCardsInCollections: 0,
        recentActivity: 0,
        systemHealth: 98,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};