import React from "react";
import { PokemonCard } from "@/types/pokemon";
import CardItem from "./CardItem";
import { useTranslation } from "react-i18next";

interface CardGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onAddToCollection?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  onQuickAdd?: (card: PokemonCard) => void;
  onRemove?: (cardId: string) => void;
  isLoading?: boolean;
  actions?: "collection" | "wishlist" | "search";
  showPrice?: boolean;
  hasPriceAlerts?: boolean;
}

const CardGrid = ({
  cards,
  onCardClick,
  onAddToCollection,
  onAddToWishlist,
  onQuickAdd,
  onRemove,
  isLoading,
  actions = "search",
  showPrice = false,
  hasPriceAlerts = false,
}: CardGridProps) => {
  const { t } = useTranslation();

  if (cards.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {t("search.noResults", "No se encontraron cartas")}
        </h3>
        <p className="text-gray-500 max-w-md">
          {t(
            "search.noResultsDescription",
            "No hay cartas que coincidan con los parámetros de búsqueda. Intenta ajustar los filtros o buscar con términos diferentes."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-start">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={onCardClick}
          onQuickAdd={onQuickAdd || onAddToCollection}
          onAddToWishlist={onAddToWishlist}
          onRemove={onRemove}
          actions={actions}
          showPrice={showPrice}
          hasPriceAlerts={hasPriceAlerts}
        />
      ))}
    </div>
  );
};

export default CardGrid;
