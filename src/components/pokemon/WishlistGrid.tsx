import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PokemonCard } from "@/types/pokemon";
import { Trash, Plus } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.wishlist_id}
          className="relative group"
        >
          <div
            className="cursor-pointer"
            onClick={() => onCardClick(card)}
          >
            <img
              src={card.images.small}
              alt={card.name}
              className="w-full rounded-t-lg"
            />
            <div className="p-4">
              <h3 className="font-medium">{card.name}</h3>
              <p className="text-sm text-gray-500">{card.set.name}</p>
              <div className="flex items-center gap-2 mt-2">
                {card.rarity && <Badge variant="outline">{card.rarity}</Badge>}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white hover:bg-red-50"
              onClick={() => onAddToCollection(card)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white hover:bg-red-50"
              onClick={() => onRemoveFromWishlist(card.wishlist_id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default WishlistGrid;
