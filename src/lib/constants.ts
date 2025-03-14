export const POKEMON_TYPES_MAP = {
  all: "Todos los tipos",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
  normal: "Normal",
} as const;

export const RARITY_MAP = {
  Common: "Común",
  Uncommon: "Poco común",
  Rare: "Rara",
  "Rare Holo": "Rara Holo",
  "Rare Holo V": "Rara Holo V",
  "Rare Holo VMAX": "Rara Holo VMAX",
  "Rare Holo GX": "Rara Holo GX",
  "Rare Holo EX": "Rara Holo EX",
  "Rare BREAK": "Rara BREAK",
  "Rare Prime": "Rara Prime",
  "Rare Prism Star": "Rara Prisma",
  "Rare Ultra": "Ultra Rara",
  "Rare Secret": "Rara Secreta",
  "Rare Rainbow": "Rara Arcoíris",
  "Amazing Rare": "Rara Asombrosa",
  "Rare Shining": "Rara Brillante",
  Promo: "Promocional",
} as const;

export const CONDITION_MAP = {
  Mint: "Perfecta",
  "Near Mint": "Casi Perfecta",
  Excellent: "Excelente",
  Good: "Buena",
  "Light Played": "Poco Usada",
  Played: "Usada",
  Poor: "Deteriorada",
} as const;

export const SUPERTYPE_MAP = {
  Pokémon: "Pokémon",
  Trainer: "Entrenador",
  Energy: "Energía",
} as const;

export const SUBTYPE_MAP = {
  BREAK: "BREAK",
  Baby: "Bebé",
  Basic: "Básico",
  EX: "EX",
  GX: "GX",
  LEGEND: "LEYENDA",
  "Level-Up": "Nivel-Up",
  MEGA: "MEGA",
  Restored: "Restaurada",
  "Stage 1": "Fase 1",
  "Stage 2": "Fase 2",
  "TAG TEAM": "EQUIPO TAG",
  "Team Plasma": "Equipo Plasma",
  V: "V",
  VMAX: "VMAX",
  VSTAR: "VSTAR",
  Item: "Objeto",
  "Pokémon Tool": "Herramienta Pokémon",
  Stadium: "Estadio",
  Supporter: "Apoyo",
  "Technical Machine": "Máquina Técnica",
  Special: "Especial",
  "Basic Energy": "Energía Básica",
  "Special Energy": "Energía Especial",
} as const;

export type PokemonType = keyof typeof POKEMON_TYPES_MAP;
export type CardRarity = keyof typeof RARITY_MAP;
export type CardCondition = keyof typeof CONDITION_MAP;
export type CardSupertype = keyof typeof SUPERTYPE_MAP;
export type CardSubtype = keyof typeof SUBTYPE_MAP;
