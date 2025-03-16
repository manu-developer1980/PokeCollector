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
  id: string; // Este es el ID de la tabla collection_cards
  card_id: string; // Este es el ID de la carta de Pokémon
  collection_id: string;
  quantity: number;
  condition?: string;
  is_foil?: boolean;
  is_first_edition?: boolean;
  notes?: string;
  date_added?: string;
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
