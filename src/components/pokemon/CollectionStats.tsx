import { RARITY_MAP } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

// Importamos la función getRarityBadgeStyle
const getRarityBadgeStyle = (rarity: string) => {
  switch (rarity) {
    case "Rare Rainbow":
      return "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white border-none shadow-md";
    case "Rare Secret":
      return "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-md";
    case "Rare Ultra":
      return "bg-gradient-to-r from-yellow-400 to-amber-600 text-white border-none shadow-md";
    case "Rare Holo":
      return "bg-gradient-to-r from-blue-400 to-cyan-300 text-white border-none shadow-md";
    case "Rare Shining":
      return "bg-gradient-to-r from-slate-300 to-slate-100 text-slate-800 border-none shadow-md";
    case "Amazing Rare":
      return "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-none shadow-md";
    case "Classic Collection":
      return "bg-gradient-to-r from-amber-700 to-yellow-600 text-white border-none shadow-md";
    case "Promo":
      return "bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-none shadow-md";
    case "Rare":
      return "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-none shadow-md";
    case "Uncommon":
      return "bg-gradient-to-r from-slate-600 to-slate-400 text-white border-none shadow-md";
    case "Common":
      return "bg-gradient-to-r from-slate-400 to-slate-300 text-slate-700 border-none shadow-md";
    default:
      return "bg-indigo-50 text-indigo-700";
  }
};

const CollectionStats = ({ collection }) => {
  const stats = useMemo(() => {
    return {
      totalCards: collection.length,
      totalValue: collection.reduce((sum, card) => sum + (card.price || 0), 0),
      byRarity: collection.reduce((acc, card) => {
        acc[card.rarity] = (acc[card.rarity] || 0) + 1;
        return acc;
      }, {}),
      byType: collection.reduce((acc, card) => {
        card.types?.forEach((type) => {
          acc[type] = (acc[type] || 0) + 1;
        });
        return acc;
      }, {}),
    };
  }, [collection]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total de Cartas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCards}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalValue.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por Rareza</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(stats.byRarity).map(([rarity, count]) => (
              <li
                key={rarity}
                className="flex justify-between items-center"
              >
                <Badge
                  variant="outline"
                  className={`text-xs ${getRarityBadgeStyle(rarity)}`}
                >
                  {RARITY_MAP[rarity as CardRarity] || rarity}
                </Badge>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <li
                key={type}
                className="flex justify-between"
              >
                <span>{type}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionStats;

