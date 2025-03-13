import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Heart } from "lucide-react";
import { PokemonCard } from "@/types/pokemon";

interface CardGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onAddToCollection: (card: PokemonCard) => void;
  onAddToWishlist: (card: PokemonCard) => void;
  isInCollection?: (cardId: string) => boolean;
  isInWishlist?: (cardId: string) => boolean;
}

const CardGrid = ({
  cards,
  onCardClick,
  onAddToCollection,
  onAddToWishlist,
  isInCollection = () => false,
  isInWishlist = () => false,
}: CardGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const inCollection = isInCollection(card.id);
        const inWishlist = isInWishlist(card.id);

        return (
          <Card
            key={card.id}
            className="relative group overflow-hidden cursor-pointer"
            onClick={() => onCardClick(card)}
          >
            <div className="aspect-[7/10] relative">
              <img
                src={card.images.small}
                alt={card.name}
                className="w-full h-full object-cover"
              />

              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200" />

              {/* Quick action buttons positioned at the top right */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <Button
                  size="icon"
                  className={`h-8 w-8 shadow-md hover:scale-110 transition-transform ${
                    inCollection
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCollection(card);
                  }}
                >
                  {inCollection ? (
                    <Minus className="h-4 w-4 text-white" />
                  ) : (
                    <Plus className="h-4 w-4 text-white" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant={inWishlist ? "default" : "outline"}
                  className={`h-8 w-8 shadow-md hover:scale-110 transition-transform ${
                    inWishlist
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToWishlist(card);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      inWishlist ? "text-white fill-current" : "text-gray-700"
                    }`}
                  />
                </Button>
              </div>
            </div>

            <div className="p-2 bg-white">
              <h3 className="font-medium text-sm truncate">{card.name}</h3>
              <p className="text-xs text-gray-500">
                {card.set.name} · {card.number}/{card.set.printedTotal}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CardGrid;
