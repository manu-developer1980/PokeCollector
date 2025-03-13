import {
  PokemonCardSearchParams,
  PokemonCardSearchResponse,
  PokemonCard,
  PokemonCardSet,
} from "@/types/pokemon";

const API_URL = "https://api.pokemontcg.io/v2";
// Use environment variable or fallback to empty string if not available
const API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY || "";

const headers = {
  "Content-Type": "application/json",
  ...(API_KEY ? { "X-Api-Key": API_KEY } : {}),
};

export async function searchCards(
  params: PokemonCardSearchParams,
): Promise<PokemonCardSearchResponse> {
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.append("q", params.q);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params.orderBy) queryParams.append("orderBy", params.orderBy);

  const response = await fetch(`${API_URL}/cards?${queryParams.toString()}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching cards: ${response.statusText}`);
  }

  return await response.json();
}

export async function getCardById(id: string): Promise<PokemonCard> {
  const response = await fetch(`${API_URL}/cards/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching card: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getSets(): Promise<PokemonCardSet[]> {
  const response = await fetch(`${API_URL}/sets`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching sets: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getSetById(id: string): Promise<PokemonCardSet> {
  const response = await fetch(`${API_URL}/sets/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching set: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getTypes(): Promise<string[]> {
  const response = await fetch(`${API_URL}/types`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching types: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getSubtypes(): Promise<string[]> {
  const response = await fetch(`${API_URL}/subtypes`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching subtypes: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getSupertypes(): Promise<string[]> {
  const response = await fetch(`${API_URL}/supertypes`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching supertypes: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getRarities(): Promise<string[]> {
  const response = await fetch(`${API_URL}/rarities`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching rarities: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}
