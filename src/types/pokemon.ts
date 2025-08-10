export interface PokemonCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    name: string;
    printedTotal: number;
  };
  cardmarket?: {
    prices?: {
      averageSellPrice?: number;
    };
  };
  // Propiedades de precios
  tcgplayer?: {
    prices: {
      [key: string]: {
        market: number;
        low?: number;
        mid?: number;
        high?: number;
      };
    };
  };
  // Propiedades de detalles de carta
  types?: string[];
  hp?: string;
  supertype?: string;
  subtypes?: string[];
  attacks?: Array<{
    name: string;
    text?: string;
    damage?: string;
    convertedEnergyCost?: number;
    cost?: string[];
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  abilities?: Array<{
    name: string;
    text: string;
    type?: string;
  }>;
  rules?: string[];
  // Propiedades específicas de la colección
  quantity?: number;
  isFirstEdition?: boolean;
  isFoil?: boolean;
  condition?: string;
  // Propiedad para identificar la carta en la lista de deseos
  wishlist_id?: string;
}

export interface PokemonCardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

// Pokemon TCG API specific types
export interface PokemonCardSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  select?: string;
}

export interface PokemonCardSearchResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface PokemonSetSearchResponse {
  data: PokemonSet[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface PokemonTypeSearchResponse {
  data: PokemonType[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface PokemonRaritySearchResponse {
  data: PokemonRarity[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// Re-export from api types
export type { PokemonCard, PokemonSet, PokemonType, PokemonRarity } from './api';

export interface CollectionCard {
  id: string;
  collection_id: string;
  card_id: string;
  quantity: number;
  condition: string;
  is_foil: boolean;
  is_first_edition: boolean;
  notes: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  images?: {
    small: string;
    large: string;
  };
  set?: {
    id: string;
    name: string;
    images?: {
      symbol: string;
      logo: string;
    };
  };
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  cards?: CollectionCard[];
}

export interface Wishlist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  cards: CollectionCard[];
}

export interface CachedResponse<T> {
  data: T;
  fromCache: boolean;
}
