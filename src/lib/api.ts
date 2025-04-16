import axios from "axios";
import {
  PokemonCardSearchParams,
  PokemonCardSearchResponse,
  PokemonCard,
  PokemonCardSet,
} from "@/types/pokemon";
import { PokemonCache } from "./cache";
import { normalizeCardId } from "./utils";

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
  const delay = config.retryDelay || 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return api(config);
});

// Default config for requests
const defaultConfig: any = {
  retry: 3,
  retryDelay: 5000,
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
}

// Función para limpiar la caché periódicamente
setInterval(() => {
  PokemonCache.clearOldItems();
}, 60 * 60 * 1000); // Limpiar cada hora
