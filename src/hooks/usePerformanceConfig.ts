import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '../utils/cacheService';

interface PerformanceConfig {
  enableCache: boolean;
  cacheSize: number;
  enableRealtime: boolean;
  enableRetry: boolean;
  enablePerformanceMonitor: boolean;
  preloadImages: boolean;
  lazyLoading: boolean;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableCache: true,
  cacheSize: 1000,
  enableRealtime: true,
  enableRetry: true,
  enablePerformanceMonitor: process.env.NODE_ENV === 'development',
  preloadImages: true,
  lazyLoading: true,
};

const STORAGE_KEY = 'pokecollector_performance_config';

export const usePerformanceConfig = () => {
  const [config, setConfig] = useState<PerformanceConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
      }
    } catch (error) {
      console.warn('Failed to load performance config from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        
        // Apply cache size changes
        if (config.enableCache) {
          cacheService.setMaxSize(config.cacheSize);
        } else {
          cacheService.clear();
        }
      } catch (error) {
        console.warn('Failed to save performance config to localStorage:', error);
      }
    }
  }, [config, isLoading]);

  const updateConfig = useCallback((updates: Partial<PerformanceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleCache = useCallback(() => {
    updateConfig({ enableCache: !config.enableCache });
  }, [config.enableCache, updateConfig]);

  const toggleRealtime = useCallback(() => {
    updateConfig({ enableRealtime: !config.enableRealtime });
  }, [config.enableRealtime, updateConfig]);

  const toggleRetry = useCallback(() => {
    updateConfig({ enableRetry: !config.enableRetry });
  }, [config.enableRetry, updateConfig]);

  const togglePerformanceMonitor = useCallback(() => {
    updateConfig({ enablePerformanceMonitor: !config.enablePerformanceMonitor });
  }, [config.enablePerformanceMonitor, updateConfig]);

  const setCacheSize = useCallback((size: number) => {
    if (size > 0 && size <= 10000) {
      updateConfig({ cacheSize: size });
    }
  }, [updateConfig]);

  const getOptimizedOptions = useCallback(() => {
    return {
      enableCache: config.enableCache,
      enableRealtime: config.enableRealtime,
      enableRetry: config.enableRetry,
      cacheSize: config.cacheSize,
    };
  }, [config]);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const cacheStats = cacheService.getStats();
    return {
      cacheSize: cacheStats.size,
      maxCacheSize: cacheStats.maxSize,
      hitRate: cacheStats.hitRate || 0,
      memoryUsage: cacheStats.memoryUsage,
      isOptimized: config.enableCache && config.enableRealtime,
    };
  }, [config]);

  // Preload critical resources
  const preloadCriticalResources = useCallback(async () => {
    if (!config.preloadImages) return;

    // Preload common Pokemon card placeholder images
    const criticalImages = [
      '/images/card-placeholder.png',
      '/images/pokemon-logo.png',
      // Add more critical images here
    ];

    const preloadPromises = criticalImages.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    try {
      await Promise.allSettled(preloadPromises);
      console.log('Critical resources preloaded');
    } catch (error) {
      console.warn('Some critical resources failed to preload:', error);
    }
  }, [config.preloadImages]);

  // Optimize for cold starts
  const optimizeForColdStart = useCallback(() => {
    // Increase cache size for cold start scenarios
    if (config.cacheSize < 500) {
      setCacheSize(500);
    }
    
    // Enable all optimizations
    updateConfig({
      enableCache: true,
      enableRetry: true,
      enableRealtime: true,
      preloadImages: true,
    });
  }, [config.cacheSize, setCacheSize, updateConfig]);

  return {
    config,
    isLoading,
    updateConfig,
    resetConfig,
    toggleCache,
    toggleRealtime,
    toggleRetry,
    togglePerformanceMonitor,
    setCacheSize,
    getOptimizedOptions,
    getPerformanceMetrics,
    preloadCriticalResources,
    optimizeForColdStart,
  };
};

export default usePerformanceConfig;