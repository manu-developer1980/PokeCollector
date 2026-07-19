import type { Collection } from "@/types/pokemon";
import { getConditionAdjustedPrice } from "@/lib/utils";

export interface CardValuation {
  cardId: string;
  name: string;
  imageUrl?: string;
  collectionName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PortfolioSummary {
  totalValue: number;
  pricedCardCount: number;
  unpricedCardCount: number;
  cards: CardValuation[];
}

interface CardWithMarketData {
  card_id: string;
  name?: string;
  images?: { small?: string; large?: string };
  quantity?: number;
  condition?: string;
  cardmarket?: { prices?: { averageSellPrice?: number } };
}

// Suma el valor de mercado (Cardmarket, en euros, ajustado a la condición de
// cada carta) de todas las colecciones del usuario. Los datos de precio ya
// vienen enriquecidos en cada carta al cargar la colección (misma fuente que
// usa CardItem para mostrar el precio individual), así que esto no requiere
// ninguna llamada ni columna de precio adicional.
export function computePortfolioValue(
  collections: Collection[]
): PortfolioSummary {
  const cards: CardValuation[] = [];
  let unpricedCardCount = 0;

  for (const collection of collections) {
    for (const rawCard of collection.cards || []) {
      const card = rawCard as unknown as CardWithMarketData;
      const basePrice = card.cardmarket?.prices?.averageSellPrice;

      if (typeof basePrice !== "number") {
        unpricedCardCount++;
        continue;
      }

      const quantity = card.quantity ?? 1;
      const unitPrice = getConditionAdjustedPrice(basePrice, card.condition);

      cards.push({
        cardId: card.card_id,
        name: card.name || "",
        imageUrl: card.images?.small,
        collectionName: collection.name,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      });
    }
  }

  cards.sort((a, b) => b.totalPrice - a.totalPrice);

  return {
    totalValue: cards.reduce((sum, c) => sum + c.totalPrice, 0),
    pricedCardCount: cards.length,
    unpricedCardCount,
    cards,
  };
}
