import { PokemonCard, PokemonCardSearchResponse } from "@/types/pokemon";

const CACHE_PREFIX = 'pokemon_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

interface CacheItem<T> {
  timestamp: number;
  data: T;
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

  static set<T>(key: string, data: T): void {
    const cacheItem: CacheItem<T> = {
      timestamp: Date.now(),
      data,
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