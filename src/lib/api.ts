import axios from "axios";
import {
  PokemonCardSearchParams,
  PokemonCardSearchResponse,
  PokemonCard,
  PokemonCardSet,
} from "@/types/pokemon";
import { PokemonCache } from "./cache";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://pokecollect-backend.onrender.com/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add retry interceptor
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
  const delay = config.retryDelay || 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return api(config);
});

// Default config for requests
const defaultConfig = {
  retry: 3,
  retryDelay: 1000,
};

export async function getRarities(): Promise<string[]> {
  try {
    const { data } = await api.get("/pokemon/rarities", defaultConfig);

    if (!data || !Array.isArray(data.data)) {
      console.warn("Unexpected rarities data format:", data);
      return [];
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching rarities:", error);
    return [];
  }
}

export async function searchCards(
  params: PokemonCardSearchParams
): Promise<PokemonCardSearchResponse> {
  const cacheKey = PokemonCache.getSearchKey(params);
  const cachedData = PokemonCache.get<PokemonCardSearchResponse>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

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
}

export async function getSets(): Promise<PokemonCardSet[]> {
  try {
    const { data } = await api.get("/pokemon/sets", defaultConfig);
    return data.data || [];
  } catch (error) {
    console.error("Error fetching sets:", error);
    return [];
  }
}

export async function getTypes(): Promise<string[]> {
  try {
    const { data } = await api.get("/pokemon/types", defaultConfig);
    return data.data || [];
  } catch (error) {
    console.error("Error fetching types:", error);
    return [];
  }
}

export async function getCardById(id: string): Promise<PokemonCard | null> {
  const cacheKey = PokemonCache.getCardKey(id);
  const cachedCard = PokemonCache.get<PokemonCard>(cacheKey);

  if (cachedCard) {
    return cachedCard;
  }

  try {
    // Volvemos a la URL original
    const { data } = await api.get(`/pokemon/cards/${id}`, defaultConfig);

    if (!data || !data.data) {
      console.warn(`Invalid response format for card ${id}:`, data);
      return null;
    }

    PokemonCache.set(cacheKey, data.data);
    return data.data;
  } catch (error) {
    console.error(`Failed to fetch card details for ${id}:`, error);
    return null;
  }
}

// Función para limpiar la caché periódicamente
setInterval(() => {
  PokemonCache.clearOldItems();
}, 60 * 60 * 1000); // Limpiar cada hora
