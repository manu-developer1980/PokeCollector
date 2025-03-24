import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Heart } from "lucide-react";
import { PokemonCard } from "@/types/pokemon";
import { Badge } from "@/components/ui/badge";
import {
  POKEMON_TYPES_MAP,
  RARITY_MAP,
  CONDITION_MAP,
  FINISH_MAP,
  EDITION_MAP,
  type PokemonType,
  type CardRarity,
  type CardCondition,
} from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRarityBadgeStyle } from "@/lib/utils";

interface CardItemProps {
  card: CollectionCard;
  onClick?: (card: CollectionCard) => void;
  onRemove?: (cardId: string) => void;
  onQuickAdd?: (card: CollectionCard) => void;
  onAddToWishlist?: (card: CollectionCard) => void;
  actions?: "collection" | "wishlist" | "search";
  showPrice?: boolean; // Añadido showPrice como prop opcional
}

const CardItem = ({
  card,
  onClick,
  onQuickAdd,
  onAddToWishlist,
  onRemove,
  actions,
  showPrice = false,
}: CardItemProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Evita que el clic se propague al contenedor padre
    action();
  };

  const translateType = (type: string) => {
    const normalizedType = type.toLowerCase() as PokemonType;
    return POKEMON_TYPES_MAP[normalizedType] || type;
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
            {translateType(type)}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div
      className="relative group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
      onClick={() => onClick?.(card)}
    >
      <CardContent className="p-4">
        {/* Image container - mantener ancho fijo */}
        <div className="relative aspect-[2.5/3.5] rounded-lg mb-2">
          {!imageError ? (
            <img
              src={card.images?.small || card.images?.large}
              alt={card.name}
              className="object-contain w-full h-full max-w-[245px]"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
              <div className="text-center">
                <div className="mb-2">❓</div>
                <div className="text-sm">Who's that Pokémon?</div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-200">
            {actions === "search" && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                        onClick={(e) => handleAction(e, () => onQuickAdd(card))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Añadir a colección por defecto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {onAddToWishlist && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg"
                          onClick={(e) =>
                            handleAction(e, () => onAddToWishlist(card))
                          }
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Añadir a lista de deseos</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}

            {actions === "wishlist" && (
              <>
                {onQuickAdd && (
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                    onClick={(e) => handleAction(e, () => onQuickAdd(card))}
                    title="Añadir a Colección"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    onClick={(e) => handleAction(e, () => onRemove(card))}
                    title="Eliminar de Lista de Deseos"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}

            {actions === "collection" && onRemove && (
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                onClick={(e) => handleAction(e, () => onRemove(card.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Card info */}
        <div className="space-y-1.5">
          <h3 className="flex justify-between items-center text-sm">
            <span className="text-indigo-600 font-medium truncate max-w-[150px]">
              {card.set?.name}
            </span>
            <span className="text-gray-500 ml-1 shrink-0">
              {card.number}
              {card.set?.printedTotal ? `/${card.set.printedTotal}` : ""}
            </span>
          </h3>

          {/* Contenedor de badges - mejorar el wrapping */}
          <div className="mt-2 flex flex-wrap gap-1 min-h-[24px]">
            {/* Badge de Rareza */}
            {card.rarity && (
              <Badge
                variant="outline"
                className={`text-xs ${getRarityBadgeStyle(
                  card.rarity
                )} shrink-0`}
              >
                {RARITY_MAP[card.rarity as CardRarity] || card.rarity}
              </Badge>
            )}

            {/* Badges específicos de la colección */}
            {actions === "collection" && (
              <>
                {/* Badge de Cantidad */}
                {card.quantity > 1 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 text-xs shrink-0"
                  >
                    x{card.quantity}
                  </Badge>
                )}

                {/* Badge de Primera Edición */}
                {card.is_first_edition && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 text-xs shrink-0"
                    tooltip="1ª Edición"
                  >
                    1st
                  </Badge>
                )}

                {/* Badge de Foil */}
                {card.is_foil && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 text-xs shrink-0"
                    tooltip="Foil"
                  >
                    ✨
                  </Badge>
                )}

                {/* Badge de Condición */}
                {card.condition && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 text-xs shrink-0"
                  >
                    {CONDITION_MAP[card.condition as CardCondition] ||
                      card.condition}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Precio si está habilitado */}
          {showPrice && card.cardmarket?.prices?.averageSellPrice && (
            <div className="text-sm font-bold text-emerald-600 mt-2">
              ${card.cardmarket.prices.averageSellPrice.toFixed(2)}
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default CardItem;
