const POKEMON_TCG_API_BASE = "https://api.pokemontcg.io/v2";

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function getPokemonCard(cardId: string) {
  try {
    const response = await fetchWithRetry(
      `${POKEMON_TCG_API_BASE}/cards/${cardId}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Failed to fetch card details for ${cardId}:`, error);
    // Return a minimal card object with the ID to prevent complete failure
    return {
      id: cardId,
      name: "Card Unavailable",
      images: {
        small: "/placeholder-card.png",
        large: "/placeholder-card.png",
      },
    };
  }
}
