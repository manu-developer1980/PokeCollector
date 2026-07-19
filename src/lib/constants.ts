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
  Common: "Común",
  Uncommon: "Poco común",
  Rare: "Rara",
  RareHolo: "Rara Holo",
  RareUltra: "Rara Ultra",
  rareultra: "Rara Ultra",
  RareSecret: "Rara Secreta",
  RareRainbow: "Rara Arcoíris",
  RareHoloEX: "Rara Holo EX",
  RareHoloV: "Rara Holo V",
  RareHoloVMAX: "Rara Holo VMAX",
  RareHoloVSTAR: "Rara Holo VSTAR",
  RarePrism: "Rara Prisma",
  RarePrismStar: "Rara Prisma Estrella",
  RareShinyGX: "Rara Brillante GX",
  AmazingRare: "Rara Asombrosa",
  ClassicCollection: "Colección Clásica",
  Promo: "Promocional",
  IllustratorRare: "Rara Ilustrador",
  IllustrationRare: "Ilustración Rara",
  ShinyRare: "Rara Brillante",
  TrainerGalleryRareHolo: "Galería Entrenador Rara Holo",
  "RareHoloLV.X": "Rara Holo LV.X",
  UltraRare: "Ultra Rara",
  DoubleRare: "Doble Rara",
  RareHoloGX: "Rara Holo GX",
  ShinyUltraRare: "Ultra Rara Brillante",
  SpecialIllustrationRare: "Ilustración Rara Especial",
  RareHoloStar: "Rara Holo Estrella",
  RareShiny: "Rara Brillante",
  ACESPECRare: "Rara ACE SPEC",
  HyperRare: "Hiper Rara",
  LEGEND: "LEYENDA",
  RadiantRare: "Rara Radiante",
  RareACE: "Rara ACE",
  RareBREAK: "Rara BREAK",
  RarePrime: "Rara Prime",
  RareShining: "Rara Brillante",
  common: "Común",
  uncommon: "Poco común",
  rare: "Rara",
  rareholo: "Rara Holo",
  raresecret: "Rara Secreta",
  rarerainbow: "Rara Arcoíris",
  rareholoex: "Rara Holo EX",
  rareholov: "Rara Holo V",
  rareholovmax: "Rara Holo VMAX",
  rareholovstar: "Rara Holo VSTAR",
  rareprism: "Rara Prisma",
  rareprismstar: "Rara Prisma Estrella",
  rareshinygx: "Rara Brillante GX",
  amazingrare: "Rara Asombrosa",
  classiccollection: "Colección Clásica",
  promo: "Promocional",
  illustratorrare: "Rara Ilustrador",
  illustrationrare: "Ilustración Rara",
  shinyrare: "Rara Brillante",
  trainergalleryrareholo: "Galería Entrenador Rara Holo",
  rarehololvx: "Rara Holo LV.X",
  ultrarare: "Ultra Rara",
  doublerare: "Doble Rara",
  rarehologx: "Rara Holo GX",
  shinyultrarare: "Ultra Rara Brillante",
  specialillustrationrare: "Ilustración Rara Especial",
  rareholostar: "Rara Holo Estrella",
  rareshiny: "Rara Brillante",
  acespecrare: "Rara ACE SPEC",
  hyperrare: "Hiper Rara",
  legend: "LEYENDA",
  radiantrare: "Rara Radiante",
  rareace: "Rara ACE",
  rarebreak: "Rara BREAK",
  rareprime: "Rara Prime",
  rareshining: "Rara Brillante",
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

// Multiplicador aplicado al precio de mercado (Cardmarket, sin gradar) según
// la condición física declarada por el usuario. Aproximación orientativa,
// no una tasación: Mint/Near Mint se toman como el precio de mercado base.
export const CONDITION_PRICE_MULTIPLIER: Record<string, number> = {
  mint: 1,
  nearmint: 1,
  excellent: 0.85,
  good: 0.7,
  lightplayed: 0.55,
  played: 0.4,
  poor: 0.25,
};

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
