import { useState, useCallback, useRef, useEffect } from 'react';
import { withRetry, RetryOptions } from '../lib/retryUtils';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isRetrying: boolean;
  retryAttempt: number;
}

export interface UseAsyncStateOptions<T> {
  initialData?: T | null;
  retryOptions?: RetryOptions;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Hook optimizado para manejar operaciones asíncronas con retry logic
 * y estados de loading mejorados
 */
export function useAsyncState<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncStateOptions<T> = {}
) {
  const {
    initialData = null,
    retryOptions,
    onSuccess,
    onError,
    onRetry
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isRetrying: false,
    retryAttempt: 0
  });

  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  // Función para ejecutar la operación asíncrona
  const execute = useCallback(async (forceRefresh = false) => {
    // Cancelar operación anterior si existe
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    const currentController = abortController.current;

    if (!isMounted.current) return;

    // Si ya tenemos datos y no es refresh forzado, no hacer nada
    if (state.data && !forceRefresh && !state.error) {
      return state.data;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isRetrying: false,
      retryAttempt: 0
    }));

    try {
      const result = await withRetry(
        async () => {
          // Verificar si la operación fue cancelada
          if (currentController.signal.aborted) {
            throw new Error('Operation cancelled');
          }
          return await asyncFn();
        },
        {
          ...retryOptions,
          onRetry: (attempt, error) => {
            if (!isMounted.current || currentController.signal.aborted) return;
            
            setState(prev => ({
              ...prev,
              isRetrying: true,
              retryAttempt: attempt,
              error
            }));
            
            onRetry?.(attempt, error);
          }
        }
      );

      if (!isMounted.current || currentController.signal.aborted) return;

      setState({
        data: result,
        isLoading: false,
        error: null,
        isRetrying: false,
        retryAttempt: 0
      });

      onSuccess?.(result);
      return result;
    } catch (error) {
      if (!isMounted.current || currentController.signal.aborted) return;

      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
        isRetrying: false
      }));

      onError?.(errorObj);
      throw errorObj;
    }
  }, [asyncFn, state.data, state.error, retryOptions, onSuccess, onError, onRetry]);

  // Función para refrescar los datos
  const refresh = useCallback(() => {
    return execute(true);
  }, [execute]);

  // Función para limpiar el estado
  const reset = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      isRetrying: false,
      retryAttempt: 0
    });
  }, [initialData]);

  // Ejecutar automáticamente cuando cambien las dependencias
  useEffect(() => {
    execute();
  }, deps);

  // Cleanup al desmontar
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    refresh,
    reset,
    // Computed properties
    isIdle: !state.isLoading && !state.error && !state.data,
    hasData: !!state.data,
    hasError: !!state.error
  };
}

/**
 * Hook simplificado para operaciones que no necesitan retry automático
 */
export function useSimpleAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  return useAsyncState(asyncFn, deps, {
    retryOptions: { maxAttempts: 1 }
  });
}

/**
 * Hook específico para operaciones de Supabase con retry optimizado
 */
export function useSupabaseAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: Omit<UseAsyncStateOptions<T>, 'retryOptions'> = {}
) {
  return useAsyncState(asyncFn, deps, {
    ...options,
    retryOptions: {
      maxAttempts: 4,
      baseDelay: 2000,
      maxDelay: 60000,
      backoffFactor: 2,
      shouldRetry: (error: any) => {
        const errorMessage = error?.message?.toLowerCase() || '';
        return errorMessage.includes('fetch') || 
               errorMessage.includes('network') ||
               errorMessage.includes('connection') ||
               errorMessage.includes('timeout') ||
               (error?.status >= 500 && error?.status < 600);
      }
    }
  });
}