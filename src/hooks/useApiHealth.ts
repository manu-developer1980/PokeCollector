import { useState, useEffect, useCallback } from 'react';
import { pokemonApiCircuitBreaker, CircuitState } from '../lib/circuitBreaker';
import { api } from '../lib/api';

export interface ApiHealthStatus {
  isOnline: boolean;
  isApiHealthy: boolean;
  circuitState: CircuitState;
  lastError: string | null;
  lastSuccessTime: number | null;
  lastFailureTime: number | null;
  failureCount: number;
  successCount: number;
}

export interface UseApiHealthReturn {
  status: ApiHealthStatus;
  checkHealth: () => Promise<void>;
  resetCircuitBreaker: () => void;
}

const HEALTH_CHECK_INTERVAL = 30000; // 30 segundos
const HEALTH_CHECK_ENDPOINT = '/health';

export function useApiHealth(): UseApiHealthReturn {
  const [status, setStatus] = useState<ApiHealthStatus>({
    isOnline: navigator.onLine,
    isApiHealthy: true,
    circuitState: CircuitState.CLOSED,
    lastError: null,
    lastSuccessTime: null,
    lastFailureTime: null,
    failureCount: 0,
    successCount: 0
  });

  const updateStatus = useCallback(() => {
    const stats = pokemonApiCircuitBreaker.getStats();
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      circuitState: stats.state,
      lastSuccessTime: stats.lastSuccessTime,
      lastFailureTime: stats.lastFailureTime,
      failureCount: stats.failureCount,
      successCount: stats.successCount,
      isApiHealthy: stats.state !== CircuitState.OPEN
    }));
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      // Intentar hacer una petición simple al endpoint de salud
      await api.get(HEALTH_CHECK_ENDPOINT, {
        timeout: 5000 // Timeout corto para health check
      });
      
      setStatus(prev => ({
        ...prev,
        isApiHealthy: true,
        lastError: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        isApiHealthy: false,
        lastError: errorMessage
      }));
    }
    
    updateStatus();
  }, [updateStatus]);

  const resetCircuitBreaker = useCallback(() => {
    pokemonApiCircuitBreaker.reset();
    updateStatus();
  }, [updateStatus]);

  // Escuchar cambios en el estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkHealth(); // Verificar la API cuando volvemos a estar online
    };

    const handleOffline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false,
        isApiHealthy: false,
        lastError: 'No internet connection'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);

  // Health check periódico
  useEffect(() => {
    // Check inicial
    checkHealth();

    // Configurar intervalo para checks periódicos
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkHealth();
      }
    }, HEALTH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkHealth]);

  // Actualizar estado del circuit breaker periódicamente
  useEffect(() => {
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  return {
    status,
    checkHealth,
    resetCircuitBreaker
  };
}