import { PokemonCard, PokemonCardSearchResponse } from "@/types/pokemon";

const CACHE_PREFIX = 'pokemon_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const SEARCH_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos para búsquedas (más frecuentes)

interface CacheItem<T> {
  timestamp: number;
  data: T;
  staleTime?: number; // Tiempo después del cual los datos se consideran "stale" pero aún utilizables
}

export class PokemonCache {
  private static isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_DURATION;
  }

  static getSearchKey(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);
    
    return `${CACHE_PREFIX}search_${JSON.stringify(sortedParams)}`;
  }

  static getCardKey(cardId: string): string {
    return `${CACHE_PREFIX}card_${cardId}`;
  }

  static set<T>(key: string, data: T, staleTime?: number): void {
    const cacheItem: CacheItem<T> = {
      timestamp: Date.now(),
      data,
      staleTime: staleTime || CACHE_DURATION * 0.8 // Por defecto, stale time es 80% del TTL
    };
    try {
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Cache storage failed:', error);
      this.clearOldItems();
    }
  }

  // Método específico para cache de búsquedas con duración optimizada
  static setSearchResult<T>(key: string, data: T): void {
    const cacheItem: CacheItem<T> = {
      timestamp: Date.now(),
      data,
      staleTime: SEARCH_CACHE_DURATION * 0.7 // 70% del tiempo de cache para búsquedas
    };
    try {
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Cache storage failed:', error);
      this.clearOldItems();
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      if (this.isExpired(cacheItem.timestamp)) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch {
      return null;
    }
  }

  // Obtener datos incluso si están "stale" (útil como fallback)
  static getStale<T>(key: string): { data: T; isStale: boolean } | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Si los datos han expirado completamente, no los devolvemos
      if (this.isExpired(cacheItem.timestamp)) {
        localStorage.removeItem(key);
        return null;
      }

      const staleTime = cacheItem.staleTime || CACHE_DURATION * 0.8;
      const age = Date.now() - cacheItem.timestamp;
      const isStale = age > staleTime;

      return {
        data: cacheItem.data,
        isStale
      };
    } catch {
      return null;
    }
  }

  // Verificar si los datos están disponibles (frescos o stale)
  static hasData(key: string): boolean {
    try {
      const item = localStorage.getItem(key);
      if (!item) return false;

      const cacheItem: CacheItem<any> = JSON.parse(item);
      return !this.isExpired(cacheItem.timestamp);
    } catch {
      return false;
    }
  }

  // Verificar si los datos están frescos (no stale)
  static isFresh(key: string): boolean {
    try {
      const item = localStorage.getItem(key);
      if (!item) return false;

      const cacheItem: CacheItem<any> = JSON.parse(item);
      
      if (this.isExpired(cacheItem.timestamp)) {
        return false;
      }

      const staleTime = cacheItem.staleTime || CACHE_DURATION * 0.8;
      const age = Date.now() - cacheItem.timestamp;
      
      return age <= staleTime;
    } catch {
      return false;
    }
  }

  static clearOldItems(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            const cacheItem: CacheItem<any> = JSON.parse(item);
            if (this.isExpired(cacheItem.timestamp)) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}