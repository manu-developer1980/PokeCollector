const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2';

export async function getPokemonCard(cardId: string) {
  const response = await fetch(`${POKEMON_TCG_API_BASE}/cards/${cardId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch card details for ${cardId}`);
  }
  const data = await response.json();
  return data.data;
}