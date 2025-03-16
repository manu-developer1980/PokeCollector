import {
  PokemonCardSearchParams,
  PokemonCardSearchResponse,
  PokemonCard,
  PokemonCardSet,
} from "@/types/pokemon";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const headers = {
  "Content-Type": "application/json",
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

  try {
    const response = await fetch(
      `${API_BASE}/pokemon/cards?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
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
  const response = await fetch(`${API_BASE}/pokemon/cards/${id}`, {
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
  const response = await fetch(`${API_BASE}/pokemon/sets`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching sets: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getTypes(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/pokemon/types`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching types: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getRarities(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/pokemon/rarities`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching rarities: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getCollections() {
  const response = await fetch(`${API_BASE}/collections`, {
    headers: {
      ...headers,
      Authorization: `Bearer ${await getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching collections: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function addCardToCollection(collectionId: string, cardData: any) {
  const response = await fetch(
    `${API_BASE}/collections/${collectionId}/cards`,
    {
      method: "POST",
      headers: {
        ...headers,
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(cardData),
    }
  );

  if (!response.ok) {
    throw new Error(`Error adding card to collection: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

// Añade funciones similares para el resto de operaciones de colección y wishlist
