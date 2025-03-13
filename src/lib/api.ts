import {
  PokemonCardSearchParams,
  PokemonCardSearchResponse,
  PokemonCard,
  PokemonCardSet,
} from "@/types/pokemon";

const API_URL = "/api/pokemon";
const API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY;

const headers = {
  "Content-Type": "application/json",
  "X-Api-Key": API_KEY,
};

export async function searchCards(
  params: PokemonCardSearchParams
): Promise<PokemonCardSearchResponse> {
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.append("q", params.q);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params.orderBy) queryParams.append("orderBy", params.orderBy);

  const url = `${API_URL}/cards?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...headers,
        Accept: "application/json",
      },
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure we return properly structured data
    return {
      data: data.data || [],
      page: parseInt(data.page) || 1,
      pageSize: parseInt(data.pageSize) || 20,
      count: parseInt(data.count) || 0,
      totalCount: parseInt(data.totalCount) || 0,
    };
  } catch (error) {
    console.error("API request failed:", error);
    // Return default values on error
    return {
      data: [],
      page: 1,
      pageSize: 20,
      count: 0,
      totalCount: 0,
    };
  }
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
  try {
    const response = await fetch(`${API_URL}/rarities`, {
      method: "GET",
      headers: {
        ...headers,
        Accept: "application/json",
      },
      credentials: "same-origin",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Rarities API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch rarities:", error);
    throw error;
  }
}
