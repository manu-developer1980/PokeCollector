// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  count?: number;
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Pokemon TCG API Types
export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  level?: string;
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  ancientTrait?: {
    name: string;
    text: string;
  };
  abilities?: Array<{
    name: string;
    text: string;
    type: string;
  }>;
  attacks?: Array<{
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
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
  convertedRetreatCost?: number;
  set: PokemonSet;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  regulationMark?: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      holofoil?: PriceData;
      reverseHolofoil?: PriceData;
      normal?: PriceData;
      "1stEditionHolofoil"?: PriceData;
      "1stEditionNormal"?: PriceData;
      unlimitedHolofoil?: PriceData;
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
}

export interface PriceData {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

export interface PokemonSet {
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

export interface PokemonType {
  id: string;
  name: string;
}

export interface PokemonRarity {
  id: string;
  name: string;
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_default?: boolean;
  created_at: string;
  updated_at?: string;
  cards?: (CollectionCard & { card?: PokemonCard })[];
}

export interface CollectionCard {
  id: string;
  collection_id: string;
  card_id: string;
  quantity?: number;
  condition?: string;
  is_foil?: boolean;
  is_first_edition?: boolean;
  notes?: string;
  date_added?: string;
}

// User Types
export interface User {
  id: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  image?: string;
  subscription?: string;
  credits?: string;
  has_seen_onboarding?: boolean;
  token_identifier: string;
  created_at: string;
  updated_at?: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  user_id?: string;
  customer_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  canceled_at?: number;
  ended_at?: number;
  started_at?: number;
  metadata?: any;
  custom_field_data?: any;
  customer_cancellation_reason?: string;
  customer_cancellation_comment?: string;
  created_at: string;
  updated_at: string;
}

// Search and Filter Types
export interface SearchFilters {
  name?: string;
  types?: string[];
  subtypes?: string[];
  supertypes?: string[];
  rarity?: string[];
  set?: string[];
  artist?: string;
  hp?: {
    min?: number;
    max?: number;
  };
  attackDamage?: {
    min?: number;
    max?: number;
  };
  retreatCost?: {
    min?: number;
    max?: number;
  };
  nationalPokedexNumbers?: number[];
  legalities?: {
    standard?: string;
    expanded?: string;
    unlimited?: string;
  };
}

export interface SearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  select?: string;
}

// API Configuration Types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Cache Types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  checkPeriod: number;
}

// Error Types
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

// Utility Types
export type SortOrder = 'asc' | 'desc';
export type CardCondition = 'mint' | 'near_mint' | 'excellent' | 'good' | 'light_played' | 'played' | 'poor';
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
export type SubscriptionPlan = 'APRENDIZ' | 'ENTRENADOR' | 'MAESTRO';