import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PokemonCard } from "@/types/pokemon";

interface CardItemProps {
  card: PokemonCard;
  onQuickAdd?: (card: PokemonCard) => void;
  onClick?: (card: PokemonCard) => void;
}

const CardItem = ({ card, onQuickAdd, onClick }: CardItemProps) => {
  const [imageError, setImageError] = useState(false);

  if (!card) {
    return null;
  }

  const handleImageError = () => {
    setImageError(true);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd?.(card);
  };

  return (
    <Card
      className="group relative cursor-pointer hover:shadow-lg transition-shadow w-full max-w-[287px]"
      onClick={() => onClick?.(card)}
    >
      <CardContent className="p-2 sm:p-4">
        {/* Image */}
        <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-lg mb-2">
          {!imageError ? (
            <img
              src={card.images?.small || card.images?.large}
              alt={card.name}
              className="object-contain w-full h-full transform transition-transform group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              Image not available
            </div>
          )}

          {/* Quick add button */}
          {onQuickAdd && (
            <Button
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleQuickAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Card info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm truncate">{card.name}</h3>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{card.set?.name}</span>
            <span>
              {card.number}/{card.set?.printedTotal}
            </span>
          </div>
          {card.cardmarket?.prices?.averageSellPrice && (
            <div className="text-sm font-medium text-green-600">
              ${card.cardmarket.prices.averageSellPrice.toFixed(2)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardItem;
