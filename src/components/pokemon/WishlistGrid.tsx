import React from "react";
import { PokemonCard } from "@/types/pokemon";
import CardGrid from "./CardGrid";

interface WishlistGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onRemoveFromWishlist?: (card: PokemonCard) => void;
  onAddToCollection?: (card: PokemonCard) => void;
}

const WishlistGrid = ({
  cards,
  onCardClick,
  onRemoveFromWishlist,
  onAddToCollection,
}: WishlistGridProps) => {
  return (
    <CardGrid
      cards={cards}
      onCardClick={onCardClick}
      onQuickAdd={onAddToCollection}
      onRemove={onRemoveFromWishlist}
      actions="wishlist"
    />
  );
};

export default WishlistGrid;
