import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '../utils/cacheService';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NetworkOptimization {
  enableOfflineMode: boolean;
  enableDataSaver: boolean;
  enableImageOptimization: boolean;
  enableRequestBatching: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;
}

const DEFAULT_OPTIMIZATION: NetworkOptimization = {
  enableOfflineMode: true,
  enableDataSaver: false,
  enableImageOptimization: true,
  enableRequestBatching: true,
  maxConcurrentRequests: 6,
  requestTimeout: 10000,
};

export const useNetworkOptimization = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
  });
  
  const [optimization, setOptimization] = useState<NetworkOptimization>(DEFAULT_OPTIMIZATION);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const requestQueue = useRef<Array<() => Promise<any>>>([]);
  const activeRequests = useRef(0);

  // Update network status
  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const status: NetworkStatus = {
        isOnline: navigator.onLine,
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      };
      
      setNetworkStatus(status);
      
      // Determine if connection is slow
      const isSlow = status.effectiveType === 'slow-2g' || 
                    status.effectiveType === '2g' || 
                    status.downlink < 1.5 || 
                    status.rtt > 300;
      
      setIsSlowConnection(isSlow);
      
      // Auto-enable data saver on slow connections
      if (isSlow && !optimization.enableDataSaver) {
        setOptimization(prev => ({ ...prev, enableDataSaver: true }));
      }
    }
  }, [optimization.enableDataSaver]);

  // Listen for network changes
  useEffect(() => {
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Initial status update
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStatus]);

  // Request queue management
  const processRequestQueue = useCallback(async () => {
    while (requestQueue.current.length > 0 && activeRequests.current < optimization.maxConcurrentRequests) {
      const request = requestQueue.current.shift();
      if (request) {
        activeRequests.current++;
        try {
          await request();
        } catch (error) {
        } finally {
          activeRequests.current--;
          // Process next request after a small delay
          setTimeout(processRequestQueue, 10);
        }
      }
    }
  }, [optimization.maxConcurrentRequests]);

  // Add request to queue
  const queueRequest = useCallback(<T>(requestFn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      if (optimization.enableRequestBatching) {
        requestQueue.current.push(wrappedRequest);
        processRequestQueue();
      } else {
        wrappedRequest();
      }
    });
  }, [optimization.enableRequestBatching, processRequestQueue]);

  // Optimize image loading based on connection
  const getOptimizedImageUrl = useCallback((originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string => {
    if (!optimization.enableImageOptimization) {
      return originalUrl;
    }

    // For slow connections or data saver mode, use smaller images
    if (isSlowConnection || optimization.enableDataSaver || networkStatus.saveData) {
      if (originalUrl.includes('images.pokemontcg.io')) {
        // Use small images for Pokemon TCG API
        return originalUrl.replace('/large/', '/small/');
      }
    }

    return originalUrl;
  }, [optimization.enableImageOptimization, optimization.enableDataSaver, isSlowConnection, networkStatus.saveData]);

  // Get optimized request options
  const getOptimizedRequestOptions = useCallback((options: RequestInit = {}): RequestInit => {
    const optimizedOptions: RequestInit = {
      ...options,
      signal: AbortSignal.timeout(optimization.requestTimeout),
    };

    // Add cache headers for offline support
    if (optimization.enableOfflineMode) {
      optimizedOptions.headers = {
        ...optimizedOptions.headers,
        'Cache-Control': 'max-age=300, stale-while-revalidate=86400',
      };
    }

    return optimizedOptions;
  }, [optimization.enableOfflineMode, optimization.requestTimeout]);

  // Preload critical data when connection improves
  const preloadCriticalData = useCallback(async () => {
    if (!networkStatus.isOnline || isSlowConnection) {
      return;
    }

    // Preload user data and recent collections
    try {

      // This would trigger the hooks to fetch fresh data
      // The actual implementation would depend on your data fetching strategy
    } catch (error) {
    }
  }, [networkStatus.isOnline, isSlowConnection]);

  // Update optimization settings
  const updateOptimization = useCallback((updates: Partial<NetworkOptimization>) => {
    setOptimization(prev => ({ ...prev, ...updates }));
  }, []);

  // Get connection quality score (0-100)
  const getConnectionQuality = useCallback((): number => {
    if (!networkStatus.isOnline) return 0;
    
    let score = 50; // Base score
    
    // Adjust based on effective type
    switch (networkStatus.effectiveType) {
      case '4g':
        score += 40;
        break;
      case '3g':
        score += 20;
        break;
      case '2g':
        score -= 20;
        break;
      case 'slow-2g':
        score -= 40;
        break;
    }
    
    // Adjust based on downlink speed
    if (networkStatus.downlink > 10) score += 10;
    else if (networkStatus.downlink < 1) score -= 20;
    
    // Adjust based on RTT
    if (networkStatus.rtt < 100) score += 10;
    else if (networkStatus.rtt > 500) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }, [networkStatus]);

  // Auto-optimize based on connection
  useEffect(() => {
    const quality = getConnectionQuality();
    
    if (quality < 30) {
      // Poor connection - enable all optimizations
      updateOptimization({
        enableDataSaver: true,
        enableImageOptimization: true,
        enableRequestBatching: true,
        maxConcurrentRequests: 2,
        requestTimeout: 15000,
      });
    } else if (quality > 70) {
      // Good connection - disable some optimizations for better UX
      updateOptimization({
        enableDataSaver: false,
        maxConcurrentRequests: 8,
        requestTimeout: 8000,
      });
    }
  }, [getConnectionQuality, updateOptimization]);

  return {
    networkStatus,
    optimization,
    isSlowConnection,
    queueRequest,
    getOptimizedImageUrl,
    getOptimizedRequestOptions,
    preloadCriticalData,
    updateOptimization,
    getConnectionQuality,
  };
};

export default useNetworkOptimization;