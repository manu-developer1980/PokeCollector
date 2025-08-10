import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import type { 
  PokemonCard, 
  PokemonSet, 
  PokemonType, 
  PokemonRarity, 
  ApiResponse,
  SearchParams,
  SearchFilters,
  CacheEntry,
  ApiConfig,
  RateLimitConfig
} from "@/types";

// Pokemon TCG API specific types
interface PokemonCardSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  select?: string;
}

interface PokemonCardSearchResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

interface PokemonSetSearchResponse {
  data: PokemonSet[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

interface PokemonTypeSearchResponse {
  data: PokemonType[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

interface PokemonRaritySearchResponse {
  data: PokemonRarity[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

import { PokemonCache } from "./cache";
import { normalizeCardId } from "./utils";
import { pokemonApiCircuitBreaker, CircuitState } from "./circuitBreaker";
import { mockDataService } from "./mockData";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Request deduplication map with proper typing
const pendingRequests = new Map<string, Promise<any>>();

// Rate limiting class with TypeScript
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

// Enhanced axios configuration interface
interface RetryConfig extends AxiosRequestConfig {
  retry?: number;
  retryCount?: number;
  retryDelay?: number;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // Increased timeout to 60 seconds for Render cold starts
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Enhanced retry interceptor with exponential backoff and jitter
api.interceptors.response.use(undefined, async (err) => {
  const config = err.config as RetryConfig;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }

  // Don't retry 404 errors (Not Found) - they are definitive errors
  if (err.response?.status === 404) {
    return Promise.reject(err);
  }

  // Don't retry 400-499 errors (client errors)
  if (err.response?.status >= 400 && err.response?.status < 500) {
    return Promise.reject(err);
  }

  config.retryCount = config.retryCount || 0;

  if (config.retryCount >= config.retry) {
    return Promise.reject(err);
  }

  config.retryCount += 1;
  
  // Exponential backoff with jitter - reduced for better performance
  const baseDelay = config.retryDelay || 1000; // Reduced from 2000 to 1000
  const exponentialDelay = baseDelay * Math.pow(2, config.retryCount - 1);
  const jitter = Math.random() * 1000; // Reduced from 2000 to 1000
  const delay = Math.min(exponentialDelay + jitter, 30000); // Reduced from 60000 to 30000
  
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

// Default config for requests with proper typing
const defaultConfig: RetryConfig = {
  retry: 2, // Reduced from 3 to 2 for better performance
  retryDelay: 1000, // Reduced from 2000 to 1000 for faster responses
};

// Helper function for request deduplication with proper typing
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
      // Call backend instead of external API
      const { data }: AxiosResponse<{ data: string[] }> = await api.get("/pokemon/rarities", defaultConfig);

      if (!data || !Array.isArray(data.data)) {
        console.warn("Unexpected rarities data format:", data);
        return [];
      }

      PokemonCache.set(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error("Error fetching rarities:", error);
      // Use mock data as fallback
      console.warn('🔄 APIs unavailable, using mock data for rarities');
      return mockDataService.getRarities();
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
      // Try with circuit breaker
      const data = await pokemonApiCircuitBreaker.execute(async () => {
        const { data }: AxiosResponse<{
          data: PokemonCard[];
          page: number;
          pageSize: number;
          count: number;
          totalCount: number;
        }> = await api.get("/pokemon/cards", {
          ...defaultConfig,
          params: {
            q: params.q,
            page: params.page,
            pageSize: params.pageSize,
            orderBy: params.orderBy,
            set: params.set !== "all" ? params.set : undefined,
            rarity: params.rarity !== "all" ? params.rarity : undefined,
          },
        });
        return data;
      });

      const response: PokemonCardSearchResponse = {
        data: data.data || [],
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        count: data.count || 0,
        totalCount: data.totalCount || 0,
      };

      PokemonCache.setSearchResult(cacheKey, response); // Use optimized cache for searches
      return response;
    } catch (error) {
      console.error("Error searching cards:", error);
      
      // Try to get stale data from cache as fallback
      const staleData = PokemonCache.getStale<PokemonCardSearchResponse>(cacheKey);
      if (staleData) {
        console.warn('Using stale data as fallback for search');
        return staleData.data;
      }
      
      // If no cache data, use mock data as last resort
      console.warn('🔄 APIs unavailable, using mock data for search');
      return mockDataService.searchCards(params);
    }
  });
}

export async function getSets(): Promise<PokemonCardSet[]> {
  const cacheKey = "pokemon:sets";
  const cachedData = PokemonCache.get<PokemonCardSet[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      // Call backend instead of external API
      const { data }: AxiosResponse<{ data: PokemonCardSet[] }> = await api.get("/pokemon/sets", defaultConfig);
      const sets = data.data || [];
      PokemonCache.set(cacheKey, sets);
      return sets;
    } catch (error) {
      console.error("Error fetching sets:", error);
      // Use mock data as fallback
      console.warn('🔄 APIs unavailable, using mock data for sets');
      return mockDataService.getSets();
    }
  });
}

export async function getTypes(): Promise<string[]> {
  const cacheKey = "pokemon:types";
  const cachedData = PokemonCache.get<string[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      // Call backend instead of external API
      const { data }: AxiosResponse<{ data: string[] }> = await api.get("/pokemon/types", defaultConfig);
      const types = data.data || [];
      PokemonCache.set(cacheKey, types);
      return types;
    } catch (error) {
      console.error("Error fetching types:", error);
      // Use mock data as fallback
      console.warn('🔄 APIs unavailable, using mock data for types');
      return mockDataService.getTypes();
    }
  });
}

// Batch API call for filter data with proper typing
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

// Cache for not found cards to avoid repeated requests
const notFoundCardsCache = new Set<string>();

// List of known problematic card IDs that should never be queried
// Note: Keep IDs exactly as they appear in the API (case-sensitive)
const knownProblematicCardIds = new Set([
  // Cards that cause 404 errors even with correct normalization
  "xyp-XY62",
  "xyp-XY63",
  "xyp-XY64",
]);

// Function to create a placeholder card when not found
function createPlaceholderCard(id: string): PokemonCard {
  return {
    id: id, // Keep original ID with case
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

  // Check if card is known as problematic or already attempted and not found
  if (
    knownProblematicCardIds.has(normalizedId) ||
    notFoundCardsCache.has(normalizedId)
  ) {
    // Create a placeholder instead of returning null
    return createPlaceholderCard(normalizedId);
  }

  const cacheKey = PokemonCache.getCardKey(normalizedId);
  const cachedCard = PokemonCache.get<PokemonCard>(cacheKey);

  if (cachedCard) {
    return cachedCard;
  }

  return deduplicateRequest(cacheKey, async () => {
    try {
      // Try with circuit breaker
      const data = await pokemonApiCircuitBreaker.execute(async () => {
        const { data }: AxiosResponse<{ data: PokemonCard }> = await api.get(`/pokemon/cards/${id}`, defaultConfig);
        return data;
      });

      if (!data || !data.data) {
        // Save in not found cards cache
        notFoundCardsCache.add(normalizedId);
        // Create a placeholder for cards without data
        const placeholderCard = createPlaceholderCard(normalizedId);
        // Save in cache to avoid future requests
        PokemonCache.set(cacheKey, placeholderCard, 600000); // 10 minutes stale time
        return placeholderCard;
      }

      // Check if it's an unavailable card (placeholder)
      if (data.data.name === "Card Unavailable") {
        // Create a more complete card object to avoid UI errors
        const placeholderCard: PokemonCard = {
          ...data.data,
          id: normalizedId,
          number: "N/A",
          set: {
            name: "Unknown Set",
            printedTotal: 0,
          },
          // Add minimum properties needed for UI
          supertype: "Unknown",
          subtypes: [],
          types: [],
          images: {
            small: "/images/card-placeholder.svg",
            large: "/images/card-placeholder.svg",
          },
          rarity: "Unknown",
        };

        // Save in cache
        PokemonCache.set(cacheKey, placeholderCard, 600000); // 10 minutes stale time
        return placeholderCard;
      }

      PokemonCache.set(cacheKey, data.data, 600000); // 10 minutes stale time
      return data.data;
    } catch (error: any) {
      console.error(`Error fetching card ${normalizedId}:`, error);
      
      // Try to get stale data from cache as fallback
      const staleData = PokemonCache.getStale<PokemonCard>(cacheKey);
      if (staleData) {
        console.warn(`Using stale data as fallback for card ${normalizedId}`);
        return staleData.data;
      }
      
      // If error is 404, save in not found cards cache
      if (error.response && error.response.status === 404) {
        notFoundCardsCache.add(normalizedId);
        // Create a placeholder for not found cards
        const placeholderCard = createPlaceholderCard(normalizedId);
        // Save in cache to avoid future requests
        PokemonCache.set(cacheKey, placeholderCard, 600000); // 10 minutes stale time
        return placeholderCard;
      }

      if (process.env.NODE_ENV !== "production") {
        console.error(`Failed to fetch card details for ${normalizedId}:`, error);
      }
      
      // Try to get card from mock data
      const mockCard = mockDataService.getCardById(normalizedId);
      if (mockCard) {
        console.warn(`🔄 APIs unavailable, using mock data for card ${normalizedId}`);
        return mockCard;
      }
      
      // For other errors, return a generic placeholder
      return createPlaceholderCard(normalizedId);
    }
  });
}

// Function to clean cache periodically
setInterval(() => {
  PokemonCache.clearOldItems();
}, 60 * 60 * 1000); // Clean every hour
