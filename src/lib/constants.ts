// Tipos de Pokémon
export const POKEMON_TYPES_MAP = {
  colorless: "Colorless",
  darkness: "Darkness",
  dragon: "Dragon",
  fairy: "Fairy",
  fighting: "Fighting",
  fire: "Fire",
  grass: "Grass",
  lightning: "Lightning",
  metal: "Metal",
  psychic: "Psychic",
  water: "Water",
};

export type PokemonType = keyof typeof POKEMON_TYPES_MAP | "all";

// Supertipos de cartas
export const SUPERTYPE_MAP = {
  energy: "Energy",
  pokemon: "Pokémon",
  trainer: "Trainer",
};

export type CardSupertype = keyof typeof SUPERTYPE_MAP;

// Subtipos de cartas
export const SUBTYPE_MAP = {
  basic: "Basic",
  stage1: "Stage 1",
  stage2: "Stage 2",
  gx: "GX",
  ex: "EX",
  mega: "Mega",
  tagteam: "Tag Team",
  vmax: "VMAX",
  vstar: "VSTAR",
  v: "V",
  item: "Item",
  supporter: "Supporter",
  stadium: "Stadium",
  tool: "Tool",
  special: "Special",
  rapid: "Rapid Strike",
  single: "Single Strike",
  fusion: "Fusion Strike",
  radiant: "Radiant",
  legend: "Legend",
  restored: "Restored",
  levelup: "Level-Up",
  break: "BREAK",
  ace: "ACE SPEC",
};

export type CardSubtype = keyof typeof SUBTYPE_MAP;

// Rarezas de cartas
export const RARITY_MAP = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  rareHolo: "Rare Holo",
  rareUltra: "Rare Ultra",
  rareSecret: "Rare Secret",
  rareRainbow: "Rare Rainbow",
  rareHoloEX: "Rare Holo EX",
  rareHoloGX: "Rare Holo GX",
  rareHoloV: "Rare Holo V",
  rareHoloVMAX: "Rare Holo VMAX",
  rareHoloVSTAR: "Rare Holo VSTAR",
  rarePrism: "Rare Prism",
  rareShinyStar: "Rare Shiny Star",
  amazingRare: "Amazing Rare",
  classic: "Classic Collection",
  promo: "Promo",
  illustrator: "Illustrator Rare",
};

export type CardRarity = keyof typeof RARITY_MAP;

// Condiciones de las cartas
export const CONDITION_MAP = {
  mint: "Mint",
  nearMint: "Near Mint",
  excellent: "Excellent",
  good: "Good",
  lightPlayed: "Light Played",
  played: "Played",
  poor: "Poor",
};

export type CardCondition = keyof typeof CONDITION_MAP;

// Acabados de las cartas
export const FINISH_MAP = {
  regular: "Regular",
  foil: "Foil",
  holo: "Holo",
  reverseHolo: "Reverse Holo",
};

export type CardFinish = keyof typeof FINISH_MAP;

// Ediciones de las cartas
export const EDITION_MAP = {
  first: "1st Edition",
  unlimited: "Unlimited",
  limited: "Limited",
};

export type CardEdition = keyof typeof EDITION_MAP;
