import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLocalization } from '../../hooks/useLocalization';
import { cacheService } from '../../utils/cacheService';
import { Activity, Database, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  apiCalls: number;
  lastUpdate: Date;
}

export const PerformanceMonitor: React.FC = () => {
  const { t } = useLocalization();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    apiCalls: 0,
    lastUpdate: new Date()
  });
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const cacheStats = cacheService.getStats();
      const performance = window.performance;
      
      // Use the hitRate from cache stats or calculate a simple approximation
      const hitRate = cacheStats.hitRate || 0;

      // Parse memory usage from string
      const memoryUsageStr = cacheStats.memoryUsage.replace(' MB', '');
      const memoryUsage = parseFloat(memoryUsageStr) * 1024; // Convert MB to KB

      // Get navigation timing for render performance
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const renderTime = navigationTiming ? 
        Math.round(navigationTiming.loadEventEnd - navigationTiming.fetchStart) : 0;

      setMetrics({
        renderTime,
        cacheHitRate: Math.round(hitRate),
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        apiCalls: cacheStats.size,
        lastUpdate: new Date()
      });
    };

    // Update metrics immediately
    updateMetrics();

    // Set up interval to update metrics
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  const clearCache = () => {
    cacheService.clear();
    setMetrics(prev => ({ ...prev, lastUpdate: new Date() }));
  };

  const getPerformanceColor = (value: number, type: 'renderTime' | 'cacheHitRate' | 'memoryUsage') => {
    switch (type) {
      case 'renderTime':
        if (value < 1000) return 'text-green-600';
        if (value < 3000) return 'text-yellow-600';
        return 'text-red-600';
      case 'cacheHitRate':
        if (value > 80) return 'text-green-600';
        if (value > 50) return 'text-yellow-600';
        return 'text-red-600';
      case 'memoryUsage':
        if (value < 100) return 'text-green-600';
        if (value < 500) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-100 hover:bg-blue-200"
      >
        <Activity className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 border-blue-200 bg-blue-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-blue-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t('performance.title', 'Performance Monitor')}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Render Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">
              {t('performance.renderTime', 'Load Time')}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={getPerformanceColor(metrics.renderTime, 'renderTime')}
          >
            {metrics.renderTime}ms
          </Badge>
        </div>

        {/* Cache Hit Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">
              {t('performance.cacheHitRate', 'Cache Hit Rate')}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={getPerformanceColor(metrics.cacheHitRate, 'cacheHitRate')}
          >
            {metrics.cacheHitRate}%
          </Badge>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">
              {t('performance.memoryUsage', 'Cache Size')}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={getPerformanceColor(metrics.memoryUsage, 'memoryUsage')}
          >
            {metrics.memoryUsage}KB
          </Badge>
        </div>

        {/* API Calls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium">
              {t('performance.apiCalls', 'API Calls')}
            </span>
          </div>
          <Badge variant="outline">
            {metrics.apiCalls}
          </Badge>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="flex-1 text-xs"
          >
            {t('performance.clearCache', 'Clear Cache')}
          </Button>
        </div>

        {/* Last Update */}
        <div className="text-xs text-gray-500 text-center">
          {t('performance.lastUpdate', 'Last update')}: {metrics.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;