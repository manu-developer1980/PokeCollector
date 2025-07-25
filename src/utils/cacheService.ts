// Servicio de caché global para reducir peticiones a la base de datos

// Tipo para los datos en caché
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

// Clase para gestionar la caché
class CacheService {
  private cache: Record<string, CacheEntry<any>> = {};
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutos por defecto
  private maxCacheSize: number = 1000; // Máximo número de entradas
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly cleanupIntervalTime = 2 * 60 * 1000; // 2 minutos

  constructor() {
    // Configurar limpieza automática cada 2 minutos
    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalTime);
  }

  private stopCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

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

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  // Guardar datos en la caché
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    
    // Verificar si necesitamos limpiar espacio
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      this.evictLeastUsed();
    }

    this.cache[key] = {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    };
  }

  // Guardar múltiples entradas en lote
  setMultiple<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    const now = Date.now();
    
    // Verificar si necesitamos limpiar espacio
    const currentSize = Object.keys(this.cache).length;
    const newEntriesCount = entries.length;
    
    if (currentSize + newEntriesCount > this.maxCacheSize) {
      const entriesToEvict = Math.max(newEntriesCount, Math.floor(this.maxCacheSize * 0.1));
      this.evictLeastUsed(entriesToEvict);
    }

    entries.forEach(({ key, data }) => {
      this.cache[key] = {
        data,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now,
      };
    });
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

  // Eliminar entradas menos utilizadas
  private evictLeastUsed(count: number = 1): void {
    const entries = Object.entries(this.cache)
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => {
        // Ordenar por frecuencia de acceso y tiempo de último acceso
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount;
        }
        return a.lastAccessed - b.lastAccessed;
      });

    // Eliminar las entradas menos utilizadas
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      delete this.cache[entries[i].key];
    }
  }

  // Limpiar entradas expiradas
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    Object.entries(this.cache).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.defaultTTL) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      delete this.cache[key];
    });

    // Si aún tenemos demasiadas entradas, eliminar las menos utilizadas
    if (Object.keys(this.cache).length > this.maxCacheSize * 0.9) {
      this.evictLeastUsed(Math.floor(this.maxCacheSize * 0.1));
    }

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries, cache size: ${Object.keys(this.cache).length}`);
    }
  }

  // Invalidar una entrada específica
  invalidate(key: string): void {
    delete this.cache[key];
  }

  // Invalidar todas las entradas que coincidan con un patrón
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    Object.keys(this.cache).forEach((key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      delete this.cache[key];
    });
    
    console.log(`Cache invalidated for pattern "${pattern}": ${keysToDelete.length} keys removed`);
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
  getStats(): { 
    size: number; 
    keys: string[];
    maxSize: number;
    hitRate?: number;
    memoryUsage: string;
  } {
    const entries = Object.values(this.cache);
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalHits = entries.length > 0 ? totalAccesses : 0;
    
    // Estimar uso de memoria (aproximado)
    const memoryUsageBytes = JSON.stringify(this.cache).length * 2; // UTF-16
    const memoryUsageMB = (memoryUsageBytes / (1024 * 1024)).toFixed(2);

    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache),
      maxSize: this.maxCacheSize,
      hitRate: totalHits > 0 ? (totalHits / (totalHits + entries.length)) * 100 : 0,
      memoryUsage: `${memoryUsageMB} MB`,
    };
  }

  // Configurar el tamaño máximo de la caché
  setMaxSize(size: number): void {
    this.maxCacheSize = size;
    
    // Si el tamaño actual excede el nuevo límite, limpiar
    if (Object.keys(this.cache).length > size) {
      this.evictLeastUsed(Object.keys(this.cache).length - size);
    }
  }

  // Destruir el servicio de caché
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
    console.log('Cache service destroyed');
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
