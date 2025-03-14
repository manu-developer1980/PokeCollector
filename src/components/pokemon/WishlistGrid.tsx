import React from "react";
import { PokemonCard } from "@/types/pokemon";
import CardItem from "./CardItem";

interface WishlistCardType extends PokemonCard {
  wishlist_id: string;
  notes?: string;
  date_added: string;
}

interface WishlistGridProps {
  cards: WishlistCardType[];
  onCardClick: (card: WishlistCardType) => void;
  onRemoveFromWishlist: (cardId: string) => void;
  onAddToCollection: (card: WishlistCardType) => void;
}

const WishlistGrid = ({
  cards,
  onCardClick,
  onRemoveFromWishlist,
  onAddToCollection,
}: WishlistGridProps) => {
  return (
    <div className="px-2 sm:px-4">
      <div className="flex flex-wrap gap-4 justify-center">
        {cards.map((card) => (
          <CardItem
            key={card.wishlist_id}
            card={card}
            onClick={() => onCardClick(card)}
            onQuickAdd={() => onAddToCollection(card)}
            onRemove={() => onRemoveFromWishlist(card.wishlist_id)}
            actions="wishlist"
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistGrid;
