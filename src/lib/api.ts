import axios from "axios";
import {
  PokemonCardSearchParams,
  PokemonCardSearchResponse,
  PokemonCard,
  PokemonCardSet,
} from "@/types/pokemon";
import { PokemonCache } from "./cache";
import { normalizeCardId } from "./utils";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Rate limiting
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number = 100; // Max requests per minute
  private readonly timeWindow: number = 60 * 1000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.timeWindow - (Date.now() - oldestRequest));
  }
}

const rateLimiter = new RateLimiter();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Enhanced retry interceptor with exponential backoff and jitter
api.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }

  config.retryCount = config.retryCount || 0;

  if (config.retryCount >= config.retry) {
    return Promise.reject(err);
  }

  config.retryCount += 1;
  
  // Exponential backoff with jitter
  const baseDelay = config.retryDelay || 1000;
  const exponentialDelay = baseDelay * Math.pow(2, config.retryCount - 1);
  const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
  const delay = Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  
  await new Promise((resolve) => setTimeout(resolve, delay));

  return api(config);
});

// Request interceptor for rate limiting
api.interceptors.request.use(async (config) => {
  // Check rate limit
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return config;
});

// Default config for requests
const defaultConfig: any = {
  retry: 3,
  retryDelay: 1000,
};

// Helper function for request deduplication
function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

export async function getRarities(): Promise<string[]> {
  const cacheKey = 'rarities';
  const cached = PokemonCache.get<string[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      const { data } = await api.get("/pokemon/rarities", defaultConfig);

      if (!data || !Array.isArray(data.data)) {
        console.warn("Unexpected rarities data format:", data);
        return [];
      }

      PokemonCache.set(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error("Error fetching rarities:", error);
      return [];
    }
  });
}

export async function searchCards(
  params: PokemonCardSearchParams
): Promise<PokemonCardSearchResponse> {
  const cacheKey = PokemonCache.getSearchKey(params);
  const cachedData = PokemonCache.get<PokemonCardSearchResponse>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      const { data } = await api.get("/pokemon/cards", {
        ...defaultConfig,
        params: {
          q: params.q,
          page: params.page,
          pageSize: params.pageSize,
          orderBy: params.orderBy,
          set: params.set !== "all" ? params.set : undefined,
        },
      });

      const response = {
        data: data.data || [],
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        count: data.count || 0,
        totalCount: data.totalCount || 0,
      };

      PokemonCache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error("Error searching cards:", error);
      return {
        data: [],
        page: 1,
        pageSize: 20,
        count: 0,
        totalCount: 0,
      };
    }
  });
}

export async function getSets(): Promise<PokemonCardSet[]> {
  const cacheKey = 'sets';
  const cached = PokemonCache.get<PokemonCardSet[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      const { data } = await api.get("/pokemon/sets", defaultConfig);
      const sets = data.data || [];
      PokemonCache.set(cacheKey, sets);
      return sets;
    } catch (error) {
      console.error("Error fetching sets:", error);
      return [];
    }
  });
}

export async function getTypes(): Promise<string[]> {
  const cacheKey = 'types';
  const cached = PokemonCache.get<string[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      const { data } = await api.get("/pokemon/types", defaultConfig);
      const types = data.data || [];
      PokemonCache.set(cacheKey, types);
      return types;
    } catch (error) {
      console.error("Error fetching types:", error);
      return [];
    }
  });
}

// Batch API call for filter data
export async function getFilterData(): Promise<{
  sets: PokemonCardSet[];
  types: string[];
  rarities: string[];
}> {
  const cacheKey = 'filter-data';
  const cached = PokemonCache.get<{
    sets: PokemonCardSet[];
    types: string[];
    rarities: string[];
  }>(cacheKey);
  
  if (cached) {
    return cached;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [setsResult, typesResult, raritiesResult] = await Promise.allSettled([
        getSets(),
        getTypes(),
        getRarities()
      ]);

      const result = {
        sets: setsResult.status === 'fulfilled' ? setsResult.value : [],
        types: typesResult.status === 'fulfilled' ? typesResult.value : [],
        rarities: raritiesResult.status === 'fulfilled' ? raritiesResult.value : [],
      };

      // Cache the combined result
      PokemonCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching filter data:", error);
      return {
        sets: [],
        types: [],
        rarities: [],
      };
    }
  });
}

// Caché para cartas no encontradas para evitar peticiones repetidas
const notFoundCardsCache = new Set<string>();

// Lista de IDs de cartas conocidas como problemáticas que nunca deberían consultarse
// Nota: Mantener los IDs exactamente como aparecen en la API (sensible a mayúsculas/minúsculas)
const knownProblematicCardIds = new Set([
  // Cartas que causan errores 404 incluso con la normalización correcta
  "xyp-XY62",
  "xyp-XY63",
  "xyp-XY64",
]);

// Función para crear una carta placeholder cuando no se encuentra
function createPlaceholderCard(id: string): PokemonCard {
  return {
    id: id, // Mantener el ID original con mayúsculas/minúsculas
    name: "Card Unavailable",
    number: "N/A",
    set: {
      name: "Unknown Set",
      printedTotal: 0,
    },
    supertype: "Unknown",
    subtypes: [],
    types: [],
    images: {
      small: "/images/card-placeholder.svg",
      large: "/images/card-placeholder.svg",
    },
    rarity: "Unknown",
  };
}

export async function getCardById(id: string): Promise<PokemonCard | null> {
  if (!id) return null;

  const normalizedId = normalizeCardId(id);

  // Verificar si la carta es conocida como problemática o ya se intentó buscar y no se encontró
  if (
    knownProblematicCardIds.has(normalizedId) ||
    notFoundCardsCache.has(normalizedId)
  ) {
    // Crear un placeholder en lugar de devolver null
    return createPlaceholderCard(normalizedId);
  }

  const cacheKey = PokemonCache.getCardKey(normalizedId);
  const cachedCard = PokemonCache.get<PokemonCard>(cacheKey);

  if (cachedCard) {
    return cachedCard;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      // Importante: Usar el ID original para la petición a la API
      // La API de Pokémon TCG es sensible a mayúsculas/minúsculas
      const { data } = await api.get(`/pokemon/cards/${id}`, defaultConfig);

      if (!data || !data.data) {
        // Guardar en caché de cartas no encontradas
        notFoundCardsCache.add(normalizedId);
        // Crear un placeholder para cartas sin datos
        const placeholderCard = createPlaceholderCard(normalizedId);
        // Guardar en caché para evitar futuras peticiones
        PokemonCache.set(cacheKey, placeholderCard);
        return placeholderCard;
      }

      // Verificar si es una carta no disponible (placeholder)
      if (data.data.name === "Card Unavailable") {
        // Crear un objeto de carta más completo para evitar errores en la UI
        const placeholderCard: PokemonCard = {
          ...data.data,
          id: normalizedId,
          number: "N/A",
          set: {
            name: "Unknown Set",
            printedTotal: 0,
          },
          // Añadir propiedades mínimas necesarias para la UI
          supertype: "Unknown",
          subtypes: [],
          types: [],
          images: {
            small: "/images/card-placeholder.svg",
            large: "/images/card-placeholder.svg",
          },
          rarity: "Unknown",
        };

        // Guardar en caché
        PokemonCache.set(cacheKey, placeholderCard);
        return placeholderCard;
      }

      PokemonCache.set(cacheKey, data.data);
      return data.data;
    } catch (error: any) {
      // Si el error es 404, guardar en caché de cartas no encontradas
      if (error.response && error.response.status === 404) {
        notFoundCardsCache.add(normalizedId);
        // Crear un placeholder para cartas no encontradas
        const placeholderCard = createPlaceholderCard(normalizedId);
        // Guardar en caché para evitar futuras peticiones
        PokemonCache.set(cacheKey, placeholderCard);
        return placeholderCard;
      }

      if (process.env.NODE_ENV !== "production") {
        console.error(`Failed to fetch card details for ${normalizedId}:`, error);
      }
      // Para otros errores, devolver un placeholder genérico
      return createPlaceholderCard(normalizedId);
    }
  });
}

// Función para limpiar la caché periódicamente
setInterval(() => {
  PokemonCache.clearOldItems();
}, 60 * 60 * 1000); // Limpiar cada hora
