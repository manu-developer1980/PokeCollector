import React from "react";
import { PokemonCard } from "@/types/pokemon";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onAddToCollection?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  onQuickAdd?: (card: PokemonCard) => void;
  onRemove?: (card: PokemonCard) => void;
  isLoading?: boolean;
  actions?: "collection" | "wishlist" | "search";
  showPrice?: boolean;
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
}: CardGridProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {cards.map((card) => (
        <CardItem
          key={card.id || `${card.pokemon_card_id}-${card.collection_id}`}
          card={card}
          onClick={onCardClick}
          onQuickAdd={onQuickAdd || onAddToCollection}
          onAddToWishlist={onAddToWishlist}
          onRemove={onRemove}
          actions={actions}
          showPrice={showPrice}
        />
      ))}
    </div>
  );
};

export default CardGrid;
