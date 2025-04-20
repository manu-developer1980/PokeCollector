// Servicio de caché global para reducir peticiones a la base de datos

// Tipo para los datos en caché
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Clase para gestionar la caché
class CacheService {
  private cache: Record<string, CacheEntry<any>> = {};
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutos por defecto

  // Obtener datos de la caché
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTTL) {
      // La entrada ha expirado
      delete this.cache[key];
      return null;
    }

    return entry.data;
  }

  // Guardar datos en la caché
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  // Verificar si una clave existe y es válida
  has(key: string): boolean {
    const entry = this.cache[key];
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTTL) {
      // La entrada ha expirado
      delete this.cache[key];
      return false;
    }

    return true;
  }

  // Invalidar una entrada específica
  invalidate(key: string): void {
    delete this.cache[key];
  }

  // Invalidar todas las entradas que coincidan con un patrón
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    Object.keys(this.cache).forEach((key) => {
      if (regex.test(key)) {
        delete this.cache[key];
      }
    });
  }

  // Invalidar todas las entradas relacionadas con un usuario
  invalidateUserData(userId: string): void {
    this.invalidatePattern(`^user:${userId}`);
  }

  // Invalidar todas las entradas relacionadas con una colección
  invalidateCollectionData(collectionId: string): void {
    this.invalidatePattern(`^collection:${collectionId}`);
  }

  // Limpiar toda la caché
  clear(): void {
    this.cache = {};
  }

  // Obtener estadísticas de la caché
  getStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache),
    };
  }
}

// Exportar una instancia única del servicio de caché
export const cacheService = new CacheService();

// Función de utilidad para crear claves de caché
export const createCacheKey = (prefix: string, ...parts: (string | number | null | undefined)[]): string => {
  const validParts = parts.filter(part => part !== null && part !== undefined);
  return `${prefix}:${validParts.join(':')}`;
};

// Función para implementar debounce
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Función para implementar throttle
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Función de utilidad para esperar un tiempo determinado
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
