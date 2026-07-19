// Import types from api
import type { PokemonCard as BasePokemonCard, PokemonSet, PokemonType, PokemonRarity, PriceData } from './api';

// Extended PokemonCard with collection-specific properties
export interface PokemonCard extends BasePokemonCard {
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
  // Extended properties for UI state
  searchTerm?: string;
  type?: string;
  supertype?: string;
  subtype?: string;
  sortBy?: string;
  rarity?: string;
  set?: string;
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

// Re-export for convenience
export type { PokemonSet, PokemonType, PokemonRarity } from './api';

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

export interface PriceAlert {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  card_image_url: string | null;
  target_price: number;
  is_active: boolean;
  last_checked_at: string | null;
  last_notified_at: string | null;
  created_at: string;
}
