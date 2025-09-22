/**
 * Mock data service for Pokemon cards when APIs are unavailable
 */

import type { PokemonCard, PokemonCardSearchResponse, PokemonCardSet } from '@/types/pokemon';

// Mock Pokemon cards data
const mockCards: any[] = [
  {
    id: "smp-SM114",
    name: "Charizard",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    hp: "150",
    types: ["Fire"],
    attacks: [
      {
        name: "Fire Blast",
        cost: ["Fire", "Fire", "Colorless"],
        convertedEnergyCost: 3,
        damage: "120",
        text: "Discard an Energy from this Pokémon."
      }
    ],
    weaknesses: [
      {
        type: "Water",
        value: "×2"
      }
    ],
    retreatCost: ["Colorless", "Colorless"],
    convertedRetreatCost: 2,
    set: {
      id: "smp",
      name: "SM Promos",
      series: "Sun & Moon",
      printedTotal: 250,
      total: 250,
      legalities: {
        unlimited: "Legal",
        standard: "Legal",
        expanded: "Legal"
      },
      ptcgoCode: "SMP",
      releaseDate: "2017/02/03",
      updatedAt: "2023/01/01 00:00:00",
      images: {
        symbol: "https://images.pokemontcg.io/smp/symbol.png",
        logo: "https://images.pokemontcg.io/smp/logo.png"
      }
    },
    number: "SM114",
    artist: "Mitsuhiro Arita",
    rarity: "Promo",
    nationalPokedexNumbers: [6],
    images: {
      small: "https://images.pokemontcg.io/smp/SM114.png",
      large: "https://images.pokemontcg.io/smp/SM114_hires.png"
    },
    tcgplayer: {
      url: "https://prices.pokemontcg.io/tcgplayer/smp-SM114",
      updatedAt: "2023/01/01",
      prices: {
        holofoil: {
          low: 5.0,
          mid: 8.0,
          high: 15.0,
          market: 7.5,
          directLow: null
        }
      }
    },
    cardmarket: {
      url: "https://prices.pokemontcg.io/cardmarket/smp-SM114",
      updatedAt: "2023/01/01",
      prices: {
        averageSellPrice: 6.5,
        lowPrice: 4.0,
        trendPrice: 7.0,
        germanProLow: null,
        suggestedPrice: null,
        reverseHoloSell: null,
        reverseHoloLow: null,
        reverseHoloTrend: null,
        lowPriceExPlus: 4.5,
        avg1: 6.0,
        avg7: 6.8,
        avg30: 7.2
      }
    },
    legalities: {
      unlimited: "Legal"
    }
  },
  {
    id: "base1-4",
    name: "Charizard",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    hp: "120",
    types: ["Fire"],
    attacks: [
      {
        name: "Fire Spin",
        cost: ["Fire", "Fire", "Fire", "Fire"],
        convertedEnergyCost: 4,
        damage: "100",
        text: "Discard 2 Energy cards attached to Charizard in order to use this attack."
      }
    ],
    weaknesses: [
      {
        type: "Water",
        value: "×2"
      }
    ],
    retreatCost: ["Colorless", "Colorless", "Colorless"],
    convertedRetreatCost: 3,
    set: {
      id: "base1",
      name: "Base",
      series: "Base",
      printedTotal: 102,
      total: 102,
      legalities: {
        unlimited: "Legal"
      },
      ptcgoCode: "BS",
      releaseDate: "1999/01/09",
      updatedAt: "2023/01/01 00:00:00",
      images: {
        symbol: "https://images.pokemontcg.io/base1/symbol.png",
        logo: "https://images.pokemontcg.io/base1/logo.png"
      }
    },
    number: "4",
    artist: "Mitsuhiro Arita",
    rarity: "Rare Holo",
    nationalPokedexNumbers: [6],
    images: {
      small: "https://images.pokemontcg.io/base1/4.png",
      large: "https://images.pokemontcg.io/base1/4_hires.png"
    },
    tcgplayer: {
      url: "https://prices.pokemontcg.io/tcgplayer/base1-4",
      updatedAt: "2023/01/01",
      prices: {
        holofoil: {
          low: 150.0,
          mid: 300.0,
          high: 500.0,
          market: 275.0,
          directLow: null
        }
      }
    }
  },
  {
    id: "xy1-1",
    name: "Venusaur-EX",
    supertype: "Pokémon",
    subtypes: ["Basic", "EX"],
    hp: "180",
    types: ["Grass"],
    attacks: [
      {
        name: "Frog Hop",
        cost: ["Grass", "Colorless", "Colorless"],
        convertedEnergyCost: 3,
        damage: "60",
        text: ""
      }
    ],
    weaknesses: [
      {
        type: "Fire",
        value: "×2"
      }
    ],
    retreatCost: ["Colorless", "Colorless", "Colorless", "Colorless"],
    convertedRetreatCost: 4,
    set: {
      id: "xy1",
      name: "XY",
      series: "XY",
      printedTotal: 146,
      total: 146,
      legalities: {
        unlimited: "Legal",
        expanded: "Legal"
      },
      ptcgoCode: "XY",
      releaseDate: "2014/02/05",
      updatedAt: "2023/01/01 00:00:00",
      images: {
        symbol: "https://images.pokemontcg.io/xy1/symbol.png",
        logo: "https://images.pokemontcg.io/xy1/logo.png"
      }
    },
    number: "1",
    artist: "Eske Yoshinob",
    rarity: "Rare Holo EX",
    nationalPokedexNumbers: [3],
    images: {
      small: "https://images.pokemontcg.io/xy1/1.png",
      large: "https://images.pokemontcg.io/xy1/1_hires.png"
    },
    tcgplayer: {
      url: "https://prices.pokemontcg.io/tcgplayer/xy1-1",
      updatedAt: "2023/01/01",
      prices: {
        holofoil: {
          low: 8.0,
          mid: 12.0,
          high: 20.0,
          market: 11.0,
          directLow: null
        }
      }
    }
  }
];

// Mock sets data
const mockSets: PokemonCardSet[] = [
  {
    id: "base1",
    name: "Base",
    series: "Base",
    printedTotal: 102,
    total: 102,
    legalities: {
      unlimited: "Legal"
    },
    ptcgoCode: "BS",
    releaseDate: "1999/01/09",
    updatedAt: "2023/01/01 00:00:00",
    images: {
      symbol: "https://images.pokemontcg.io/base1/symbol.png",
      logo: "https://images.pokemontcg.io/base1/logo.png"
    }
  },
  {
    id: "xy1",
    name: "XY",
    series: "XY",
    printedTotal: 146,
    total: 146,
    legalities: {
      unlimited: "Legal",
      expanded: "Legal"
    },
    ptcgoCode: "XY",
    releaseDate: "2014/02/05",
    updatedAt: "2023/01/01 00:00:00",
    images: {
      symbol: "https://images.pokemontcg.io/xy1/symbol.png",
      logo: "https://images.pokemontcg.io/xy1/logo.png"
    }
  },
  {
    id: "smp",
    name: "SM Promos",
    series: "Sun & Moon",
    printedTotal: 250,
    total: 250,
    legalities: {
      unlimited: "Legal",
      standard: "Legal",
      expanded: "Legal"
    },
    ptcgoCode: "SMP",
    releaseDate: "2017/02/03",
    updatedAt: "2023/01/01 00:00:00",
    images: {
      symbol: "https://images.pokemontcg.io/smp/symbol.png",
      logo: "https://images.pokemontcg.io/smp/logo.png"
    }
  }
];

// Mock rarities
const mockRarities = [
  "Common",
  "Uncommon", 
  "Rare",
  "Rare Holo",
  "Rare Holo EX",
  "Rare Holo GX",
  "Rare Holo V",
  "Rare Holo VMAX",
  "Promo"
];

// Mock types
const mockTypes = [
  "Grass",
  "Fire", 
  "Water",
  "Lightning",
  "Psychic",
  "Fighting",
  "Darkness",
  "Metal",
  "Fairy",
  "Dragon",
  "Colorless"
];

export const mockDataService = {
  searchCards: (params: any): PokemonCardSearchResponse => {
    console.warn('🔄 Using mock data - APIs are currently unavailable');
    console.log('🎭 Mock searchCards called with params:', params);
    
    let filteredCards = [...mockCards];
    console.log('🎭 Starting with', filteredCards.length, 'mock cards');
    
    // Simple filtering based on query
    if (params.q) {
      const query = params.q.toLowerCase();
      console.log('🔍 Applying search query:', query);
      filteredCards = filteredCards.filter(card => 
        card.name.toLowerCase().includes(query) ||
        card.set.name.toLowerCase().includes(query) ||
        card.types?.some(type => type.toLowerCase().includes(query)) ||
        card.rarity?.toLowerCase().includes(query)
      );
      console.log('🔍 After search filter:', filteredCards.length, 'cards');
    }
    
    // Set filtering
    if (params.set && params.set !== 'all') {
      console.log('🎯 Applying set filter:', params.set);
      filteredCards = filteredCards.filter(card => card.set.id === params.set);
      console.log('🎯 After set filter:', filteredCards.length, 'cards');
    }
    
    // Rarity filtering
    if (params.rarity && params.rarity !== 'all') {
      console.log('💎 Applying rarity filter:', params.rarity);
      filteredCards = filteredCards.filter(card => card.rarity === params.rarity);
      console.log('💎 After rarity filter:', filteredCards.length, 'cards');
    }
    
    // Type filtering
    if (params.type && params.type !== 'all') {
      console.log('🏷️ Applying type filter:', params.type);
      filteredCards = filteredCards.filter(card => 
        card.types?.includes(params.type)
      );
      console.log('🏷️ After type filter:', filteredCards.length, 'cards');
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedCards = filteredCards.slice(startIndex, endIndex);
    
    const result = {
      data: paginatedCards,
      page,
      pageSize,
      count: paginatedCards.length,
      totalCount: filteredCards.length
    };
    
    console.log('🎭 Mock search result:', {
      totalFiltered: filteredCards.length,
      returnedCards: paginatedCards.length,
      page,
      pageSize,
      cardNames: paginatedCards.map(c => c.name)
    });
    
    return result;
  },
  
  getCardById: (id: string): PokemonCard | null => {
    console.warn('🔄 Using mock data - APIs are currently unavailable');
    return mockCards.find(card => card.id === id) || null;
  },
  
  getSets: (): PokemonCardSet[] => {
    console.warn('🔄 Using mock data - APIs are currently unavailable');
    return mockSets;
  },
  
  getRarities: (): string[] => {
    console.warn('🔄 Using mock data - APIs are currently unavailable');
    return mockRarities;
  },
  
  getTypes: (): string[] => {
    console.warn('🔄 Using mock data - APIs are currently unavailable');
    return mockTypes;
  }
};