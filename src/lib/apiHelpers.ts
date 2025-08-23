/**
 * Funciones auxiliares para mejorar el manejo de API con fallbacks
 */

import { pokemonApiCircuitBreaker } from './circuitBreaker';
import { PokemonCache } from './cache';
import type { PokemonCardSearchResponse, PokemonCard } from '../types/pokemon';

/**
 * Función auxiliar para búsqueda de cartas con fallback completo
 */
export async function searchCardsWithFallback(
  operation: () => Promise<PokemonCardSearchResponse>,
  cacheKey: string,
  fallbackData?: Partial<PokemonCardSearchResponse>
): Promise<PokemonCardSearchResponse> {
  try {
    // Intentar la operación con circuit breaker
    const result = await pokemonApiCircuitBreaker.execute(operation);
    
    // Guardar en caché con tiempo de stale
    PokemonCache.set(cacheKey, result, 300000); // 5 minutos
    
    return {
      ...result,
      isStale: false,
      timestamp: Date.now(),
      circuitBreakerUsed: false
    } as any;
  } catch (error) {
    console.error('Error in searchCardsWithFallback:', error);
    
    // Intentar obtener datos stale del caché
    const staleData = PokemonCache.getStale<PokemonCardSearchResponse>(cacheKey);
    if (staleData) {
      console.warn('Using stale data as fallback');
      return {
        ...staleData.data,
        isStale: staleData.isStale,
        timestamp: Date.now(),
        circuitBreakerUsed: true
      } as any;
    }
    
    // Si no hay datos stale, usar fallback por defecto
    const defaultFallback: PokemonCardSearchResponse = {
      data: [],
      page: 1,
      pageSize: 20,
      count: 0,
      totalCount: 0,
      isStale: false,
      timestamp: Date.now(),
      circuitBreakerUsed: true,
      ...fallbackData
    } as any;
    
    return defaultFallback;
  }
}

/**
 * Función auxiliar para obtener carta por ID con fallback
 */
export async function getCardWithFallback(
  operation: () => Promise<PokemonCard | null>,
  cacheKey: string
): Promise<PokemonCard | null> {
  try {
    // Intentar la operación con circuit breaker
    const result = await pokemonApiCircuitBreaker.execute(operation);
    
    if (result) {
      // Guardar en caché con tiempo de stale
      PokemonCache.set(cacheKey, result, 600000); // 10 minutos
    }
    
    return result;
  } catch (error) {
    console.error('Error in getCardWithFallback:', error);
    
    // Intentar obtener datos stale del caché
    const staleData = PokemonCache.getStale<PokemonCard>(cacheKey);
    if (staleData) {
      console.warn('Using stale card data as fallback');
      return staleData.data;
    }
    
    return null;
  }
}

/**
 * Función auxiliar para operaciones genéricas con fallback
 */
export async function executeWithFallback<T>(
  operation: () => Promise<T>,
  cacheKey: string,
  fallbackValue: T,
  staleTime: number = 300000
): Promise<{ data: T; fromCache: boolean; isStale: boolean }> {
  try {
    // Intentar la operación con circuit breaker
    const result = await pokemonApiCircuitBreaker.execute(operation);
    
    // Guardar en caché
    PokemonCache.set(cacheKey, result, staleTime);
    
    return {
      data: result,
      fromCache: false,
      isStale: false
    };
  } catch (error) {
    console.error('Error in executeWithFallback:', error);
    
    // Intentar obtener datos stale del caché
    const staleData = PokemonCache.getStale<T>(cacheKey);
    if (staleData) {
      console.warn('Using stale data as fallback');
      return {
        data: staleData.data,
        fromCache: true,
        isStale: staleData.isStale
      };
    }
    
    // Usar valor de fallback
    return {
      data: fallbackValue,
      fromCache: false,
      isStale: false
    };
  }
}

/**
 * Verificar si hay datos disponibles (frescos o stale) para una clave
 */
export function hasAvailableData(cacheKey: string): boolean {
  return PokemonCache.hasData(cacheKey);
}

/**
 * Verificar si los datos están frescos para una clave
 */
export function isFreshData(cacheKey: string): boolean {
  return PokemonCache.isFresh(cacheKey);
}

/**
 * Obtener estadísticas del circuit breaker
 */
export function getApiHealthStats() {
  return pokemonApiCircuitBreaker.getStats();
}

/**
 * Resetear el circuit breaker manualmente
 */
export function resetApiHealth() {
  pokemonApiCircuitBreaker.reset();
}