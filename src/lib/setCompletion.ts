import type { Collection } from "@/types/pokemon";

export interface SetProgress {
  setId: string;
  setName: string;
  setSymbol?: string;
  ownedCount: number;
  totalCount: number;
  percentage: number;
}

interface CardSetInfo {
  id: string;
  name: string;
  total?: number;
  printedTotal?: number;
  images?: { symbol?: string; logo?: string };
}

// Agrupa las cartas de todas las colecciones por set y calcula el progreso
// (cartas distintas poseídas / total del set). El campo `set` de cada carta
// ya viene enriquecido desde la Pokemon TCG API al cargar la colección, así
// que esto no requiere ninguna llamada adicional.
export function computeSetProgress(collections: Collection[]): SetProgress[] {
  const bySet = new Map<
    string,
    { name: string; symbol?: string; total: number; owned: Set<string> }
  >();

  for (const collection of collections) {
    for (const card of collection.cards || []) {
      const set = card.set as CardSetInfo | undefined;
      if (!set?.id) continue;

      if (!bySet.has(set.id)) {
        bySet.set(set.id, {
          name: set.name,
          symbol: set.images?.symbol,
          total: set.total ?? set.printedTotal ?? 0,
          owned: new Set(),
        });
      }

      bySet.get(set.id)!.owned.add(card.card_id);
    }
  }

  return Array.from(bySet.entries())
    .map(([setId, data]) => ({
      setId,
      setName: data.name,
      setSymbol: data.symbol,
      ownedCount: data.owned.size,
      totalCount: data.total,
      percentage:
        data.total > 0 ? Math.round((data.owned.size / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}
