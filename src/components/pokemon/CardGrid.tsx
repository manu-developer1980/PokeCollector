import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PokemonCard } from "@/types/pokemon";

interface CardGridProps {
  cards: PokemonCard[];
  onCardClick?: (card: PokemonCard) => void;
  isLoading?: boolean;
}

const CardGrid = ({
  cards = [],
  onCardClick = () => {},
  isLoading = false,
}: CardGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card
            key={index}
            className="overflow-hidden h-80 animate-pulse bg-gray-100"
          >
            <div className="h-full"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No cards found. Try adjusting your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick(card)}
        >
          <div className="relative pb-[140%]">
            <img
              src={card.images.small}
              alt={card.name}
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-sm truncate">{card.name}</h3>
              <Badge variant="outline" className="text-xs">
                {card.rarity}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{card.set.name}</span>
              <span>
                {card.number}/{card.set.printedTotal}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardGrid;
