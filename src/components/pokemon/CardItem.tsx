import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Heart } from "lucide-react";
import { PokemonCard } from "@/types/pokemon";
import { Badge } from "@/components/ui/badge";
import { POKEMON_TYPES_MAP, RARITY_MAP, CONDITION_MAP } from "@/lib/constants";

interface CardItemProps {
  card: PokemonCard & {
    is_foil?: boolean;
    is_first_edition?: boolean;
    condition?: string;
    quantity?: number;
  };
  onQuickAdd?: (card: PokemonCard) => void;
  onRemove?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  onClick?: (card: PokemonCard) => void;
  fallbackImage?: string;
  showPrice?: boolean;
  actions?: "collection" | "wishlist" | "search";
}

const CardItem = ({
  card,
  onQuickAdd,
  onRemove,
  onAddToWishlist,
  onClick,
  fallbackImage = "/placeholder-card.png",
  showPrice = true,
  actions = "search",
}: CardItemProps) => {
  const [imageError, setImageError] = useState(false);

  if (!card) return null;

  const handleImageError = () => setImageError(true);
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const renderTypes = () => {
    if (!card.types) return null;

    return (
      <div className="flex gap-1 flex-wrap">
        {card.types.map((type) => (
          <Badge
            key={type}
            variant="outline"
            className="text-xs"
          >
            {POKEMON_TYPES_MAP[type.toLowerCase() as PokemonType] || type}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card
      className="group relative cursor-pointer w-[235px] transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:-translate-y-1"
      onClick={() => onClick?.(card)}
    >
      <CardContent className="p-2 sm:p-4">
        {/* Image container */}
        <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-lg mb-2 bg-gradient-to-br from-blue-50 to-indigo-50">
          {!imageError ? (
            <img
              src={card.images?.small || card.images?.large}
              alt={card.name}
              className="object-contain w-[235px] h-full transform transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="w-[235px] h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
              <div className="text-center">
                <div className="mb-2">❓</div>
                <div className="text-sm">Who's that Pokémon?</div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            {actions === "search" && onQuickAdd && (
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                onClick={(e) => handleAction(e, () => onQuickAdd(card))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {actions === "search" && onAddToWishlist && (
              <Button
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg"
                onClick={(e) => handleAction(e, () => onAddToWishlist(card))}
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
            {(actions === "collection" || actions === "wishlist") &&
              onRemove && (
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  onClick={(e) => handleAction(e, () => onRemove(card))}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
          </div>
        </div>

        {/* Card info */}
        <div className="space-y-1.5">
          <h3 className="font-medium text-sm truncate text-blue-900">
            {card.name}
          </h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-indigo-600 font-medium">
              {card.set?.name}
            </span>
            <span className="text-gray-500">
              {card.number}
              {card.set?.printedTotal ? `/${card.set.printedTotal}` : ""}
            </span>
          </div>

          {/* Badges para atributos de colección */}
          <div className="flex flex-wrap gap-1">
            {card.rarity && (
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700"
              >
                {RARITY_MAP[card.rarity as CardRarity] || card.rarity}
              </Badge>
            )}
            {actions === "collection" && (
              <>
                {card.is_foil && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700"
                  >
                    Foil
                  </Badge>
                )}
                {card.is_first_edition && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700"
                  >
                    1ª Ed
                  </Badge>
                )}
                {card.condition && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    {CONDITION_MAP[card.condition as CardCondition] ||
                      card.condition}
                  </Badge>
                )}
                {card.quantity && card.quantity > 1 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700"
                  >
                    x{card.quantity}
                  </Badge>
                )}
              </>
            )}
          </div>

          {showPrice && card.cardmarket?.prices?.averageSellPrice && (
            <div className="text-sm font-bold text-emerald-600">
              ${card.cardmarket.prices.averageSellPrice.toFixed(2)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardItem;
