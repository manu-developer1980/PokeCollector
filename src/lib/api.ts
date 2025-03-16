import {
  PokemonCardSearchParams,
  PokemonCardSearchResponse,
  PokemonCard,
  PokemonCardSet,
} from "@/types/pokemon";

// Asegúrate de que API_BASE apunte a tu backend en Render
const https: //pokecollect-backend.onrender.com/api/health

API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://pokecollect-backend.onrender.com/api";
console.log("API Base URL:", API_BASE); // Esto mostrará la URL que se está utilizando
const headers = {
  "Content-Type": "application/json",
};

// Función de utilidad para manejar errores de fetch
async function fetchApi(url: string, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

// Función para obtener el token de autenticación
async function getAuthToken() {
  // Implementa tu lógica para obtener el token
  return localStorage.getItem("authToken");
}

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
    return await fetchApi(
      `${API_BASE}/pokemon/cards?${queryParams.toString()}`,
      { method: "GET", headers }
    );
  } catch (error) {
    console.error("Search cards failed:", error);
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
  try {
    const response = await fetch(`${API_BASE}/pokemon/cards/${id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error fetching card: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Failed to fetch card details for ${id}:`, error);
    // Devolver un objeto de carta mínimo con el ID para prevenir fallos completos
    return {
      id,
      name: "Card Unavailable",
      images: {
        small: "/placeholder-card.png",
        large: "/placeholder-card.png",
      },
    };
  }
}
export async function getSets(): Promise<PokemonCardSet[]> {
  const data = await fetchApi(`${API_BASE}/pokemon/sets`, {
    method: "GET",
    headers,
  });
  return data.data;
}

export async function getTypes(): Promise<string[]> {
  const data = await fetchApi(`${API_BASE}/pokemon/types`, {
    method: "GET",
    headers,
  });
  return data.data;
}

export async function getRarities(): Promise<string[]> {
  const data = await fetchApi(`${API_BASE}/pokemon/rarities`, {
    method: "GET",
    headers,
  });
  return data.data;
}

export async function getCollections() {
  const data = await fetchApi(`${API_BASE}/collections`, {
    headers: {
      ...headers,
      Authorization: `Bearer ${await getAuthToken()}`,
    },
  });
  return data.data;
}

export async function addCardToCollection(collectionId: string, cardData: any) {
  const data = await fetchApi(`${API_BASE}/collections/${collectionId}/cards`, {
    method: "POST",
    headers: {
      ...headers,
      Authorization: `Bearer ${await getAuthToken()}`,
    },
    body: JSON.stringify(cardData),
  });
  return data.data;
}

// Puedes añadir el resto de funciones para operaciones de colección y wishlist
