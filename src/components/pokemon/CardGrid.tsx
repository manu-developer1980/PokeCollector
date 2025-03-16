import React from "react";
import { PokemonCard } from "@/types/pokemon";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onQuickAdd?: (card: PokemonCard) => void;
  onRemove?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  actions?: "collection" | "wishlist" | "search";
  showPrice?: boolean; // Añadimos esta prop
}

const CardGrid = ({
  cards,
  onCardClick,
  onQuickAdd,
  onRemove,
  onAddToWishlist,
  actions = "search",
  showPrice = false, // Valor por defecto
}: CardGridProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={onCardClick}
          onQuickAdd={onQuickAdd}
          onRemove={onRemove}
          onAddToWishlist={onAddToWishlist}
          actions={actions}
          showPrice={showPrice}
        />
      ))}
    </div>
  );
};

export default CardGrid;
