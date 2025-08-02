import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Slider } from '../../ui/slider';
import { Badge } from '../../ui/badge';
import { useLocalization } from '../../../hooks/useLocalization';
import { usePerformanceConfig } from '../../../hooks/usePerformanceConfig';
import { 
  Settings, 
  Zap, 
  Database, 
  Wifi, 
  RotateCcw, 
  Monitor, 
  Image,
  Loader,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const PerformanceSettings: React.FC = () => {
  const { t } = useLocalization();
  const {
    config,
    isLoading,
    toggleCache,
    toggleRealtime,
    toggleRetry,
    togglePerformanceMonitor,
    setCacheSize,
    resetConfig,
    getPerformanceMetrics,
    optimizeForColdStart,
  } = usePerformanceConfig();

  const metrics = getPerformanceMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings.performance.title', 'Performance Settings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const settingsGroups = [
    {
      title: t('settings.performance.caching.title', 'Caching'),
      description: t('settings.performance.caching.description', 'Improve loading times by storing data locally'),
      icon: Database,
      settings: [
        {
          key: 'enableCache',
          label: t('settings.performance.caching.enable', 'Enable Cache'),
          description: t('settings.performance.caching.enableDesc', 'Store frequently accessed data in memory'),
          value: config.enableCache,
          onChange: toggleCache,
          type: 'switch' as const,
        },
        {
          key: 'cacheSize',
          label: t('settings.performance.caching.size', 'Cache Size'),
          description: t('settings.performance.caching.sizeDesc', 'Maximum number of items to store in cache'),
          value: config.cacheSize,
          onChange: (value: number[]) => setCacheSize(value[0]),
          type: 'slider' as const,
          min: 100,
          max: 2000,
          step: 100,
          disabled: !config.enableCache,
        },
      ],
    },
    {
      title: t('settings.performance.realtime.title', 'Real-time Updates'),
      description: t('settings.performance.realtime.description', 'Get instant updates when data changes'),
      icon: Wifi,
      settings: [
        {
          key: 'enableRealtime',
          label: t('settings.performance.realtime.enable', 'Enable Real-time'),
          description: t('settings.performance.realtime.enableDesc', 'Automatically sync changes across devices'),
          value: config.enableRealtime,
          onChange: toggleRealtime,
          type: 'switch' as const,
        },
      ],
    },
    {
      title: t('settings.performance.reliability.title', 'Reliability'),
      description: t('settings.performance.reliability.description', 'Handle network issues and improve stability'),
      icon: RefreshCw,
      settings: [
        {
          key: 'enableRetry',
          label: t('settings.performance.reliability.retry', 'Auto Retry'),
          description: t('settings.performance.reliability.retryDesc', 'Automatically retry failed requests'),
          value: config.enableRetry,
          onChange: toggleRetry,
          type: 'switch' as const,
        },
      ],
    },
    {
      title: t('settings.performance.ui.title', 'User Interface'),
      description: t('settings.performance.ui.description', 'Optimize visual performance and loading'),
      icon: Monitor,
      settings: [
        {
          key: 'enablePerformanceMonitor',
          label: t('settings.performance.ui.monitor', 'Performance Monitor'),
          description: t('settings.performance.ui.monitorDesc', 'Show performance metrics (development only)'),
          value: config.enablePerformanceMonitor,
          onChange: togglePerformanceMonitor,
          type: 'switch' as const,
        },
        {
          key: 'preloadImages',
          label: t('settings.performance.ui.preload', 'Preload Images'),
          description: t('settings.performance.ui.preloadDesc', 'Load critical images in advance'),
          value: config.preloadImages,
          onChange: () => {}, // TODO: Implement
          type: 'switch' as const,
          disabled: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('settings.performance.title', 'Performance Settings')}
            </div>
            <div className="flex items-center gap-2">
              {metrics.isOptimized ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Zap className="w-3 h-3 mr-1" />
                  {t('settings.performance.optimized', 'Optimized')}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {t('settings.performance.notOptimized', 'Not Optimized')}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.cacheSize}</div>
              <div className="text-sm text-gray-600">
                {t('settings.performance.metrics.cacheItems', 'Cache Items')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(metrics.hitRate)}%</div>
              <div className="text-sm text-gray-600">
                {t('settings.performance.metrics.hitRate', 'Hit Rate')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.memoryUsage}</div>
              <div className="text-sm text-gray-600">
                {t('settings.performance.metrics.memory', 'Memory Usage')}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={optimizeForColdStart}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              {t('settings.performance.optimizeForColdStart', 'Optimize for Cold Start')}
            </Button>
            <Button
              onClick={resetConfig}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('settings.performance.reset', 'Reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group) => {
        const Icon = group.icon;
        return (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {group.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{group.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-sm text-gray-600">{setting.description}</div>
                    {setting.type === 'slider' && (
                      <div className="mt-2">
                        <Slider
                          value={[setting.value as number]}
                          onValueChange={setting.onChange as (value: number[]) => void}
                          min={setting.min}
                          max={setting.max}
                          step={setting.step}
                          disabled={setting.disabled}
                          className="w-48"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{setting.min}</span>
                          <span className="font-medium">{setting.value}</span>
                          <span>{setting.max}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {setting.type === 'switch' && (
                    <Switch
                      checked={setting.value as boolean}
                      onCheckedChange={setting.onChange as (checked: boolean) => void}
                      disabled={setting.disabled}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PerformanceSettings;