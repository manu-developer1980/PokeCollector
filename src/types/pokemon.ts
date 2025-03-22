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
  }>;
  rules?: string[];
  // Propiedades específicas de la colección
  quantity?: number;
  isFirstEdition?: boolean;
  isFoil?: boolean;
  condition?: string;
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

export interface PokemonCardSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  name?: string;
  types?: string;
  subtypes?: string;
  supertype?: string;
  set?: string;
  rarity?: string;
}

export interface PokemonCardSearchResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface CollectionCard extends PokemonCard {
  id: string; // ID único de la carta en la colección
  collection_id: string; // ID de la colección a la que pertenece
  pokemon_card_id: string; // ID de la carta de Pokémon original
  quantity: number;
  condition?: string;
  isFoil?: boolean;
  isFirstEdition?: boolean;
  notes?: string;
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
