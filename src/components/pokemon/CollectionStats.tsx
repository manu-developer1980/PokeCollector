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
                className="flex justify-between"
              >
                <span>{rarity}</span>
                <span>{count}</span>
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
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
