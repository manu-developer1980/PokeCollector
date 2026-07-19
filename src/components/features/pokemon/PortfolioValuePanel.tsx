import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Collection } from "@/types/pokemon";
import { computePortfolioValue } from "@/lib/portfolioValue";

interface PortfolioValuePanelProps {
  collections: Collection[];
}

const TOP_CARDS_LIMIT = 20;

export default function PortfolioValuePanel({
  collections,
}: PortfolioValuePanelProps) {
  const { t } = useTranslation();
  const { totalValue, pricedCardCount, unpricedCardCount, cards } =
    computePortfolioValue(collections);

  if (pricedCardCount === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("portfolioValue.empty")}
      </div>
    );
  }

  const topCards = cards.slice(0, TOP_CARDS_LIMIT);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("portfolioValue.totalLabel")}
          </p>
          <p className="text-4xl font-bold text-emerald-600">
            {totalValue.toFixed(2)} €
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("portfolioValue.pricedCount", { count: pricedCardCount })}
            {unpricedCardCount > 0 &&
              ` · ${t("portfolioValue.unpricedCount", {
                count: unpricedCardCount,
              })}`}
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          {t("portfolioValue.topCardsTitle")}
        </h3>
        <div className="space-y-2">
          {topCards.map((card, index) => (
            <Card key={`${card.cardId}-${index}`}>
              <CardContent className="flex items-center gap-4 py-3">
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt=""
                    className="h-12 w-auto object-contain shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{card.name}</span>
                    <Badge variant="outline" className="shrink-0">
                      {card.collectionName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {card.quantity > 1
                      ? `${card.quantity} × ${card.unitPrice.toFixed(2)} €`
                      : `${card.unitPrice.toFixed(2)} €`}
                  </p>
                </div>
                <span className="font-bold text-emerald-600 shrink-0">
                  {card.totalPrice.toFixed(2)} €
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
