import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Heart, FileText } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { normalizeTranslationKey } from "@/lib/utils";

interface CardItemProps {
  card: PokemonCard;
  onClick?: (card: PokemonCard) => void;
  onRemove?: (cardId: string) => void;
  onQuickAdd?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  actions?: "collection" | "wishlist" | "search";
  showPrice?: boolean;
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
  const { t } = useTranslation();

  const [imageError, setImageError] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const handleImageError = () => setImageError(true);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotesModalOpen(true);
  };

  const translateType = (type: string) => {
    const normalizedType = type.toLowerCase() as PokemonType;
    return t(
      `pokemonTypes.${normalizedType}`,
      POKEMON_TYPES_MAP[normalizedType] || type
    );
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
    <>
      <div
        className="relative group cursor-pointer w-full max-w-[270px] mx-auto bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 p-2 sm:p-0"
        onClick={() => onClick?.(card)}
      >
        <CardContent className="p-3 sm:p-4">
          {/* Image container - mantener ancho fijo */}
          <div className="relative aspect-[2.5/3.5] rounded-lg mb-2">
            {!imageError ? (
              <img
                src={card.images?.small || card.images?.large}
                alt={card.name}
                className="object-contain w-full h-full rounded-lg max-w-[245px]"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 rounded-lg">
                <div className="text-center">
                  <div className="mb-2">❓</div>
                  <div className="text-sm">{t("common.unknownCard")}</div>
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
                          onClick={(e) =>
                            handleAction(e, () => onQuickAdd(card))
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("collection.addToDefault")}</p>
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
                          <p>{t("wishlist.addCard")}</p>
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
                      title={t("collection.addCard")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {onRemove && (
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                      onClick={(e) => handleAction(e, () => onRemove(card.id))}
                      title={t("wishlist.removeCard")}
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
                  title={t("collection.removeCard")}
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
                {card.set?.name || t("common.unknownSet", "Unknown Set")}
              </span>
              <span className="text-gray-500 ml-1 shrink-0">
                {card.number}
                {card.set?.printedTotal && card.set.printedTotal > 0
                  ? `/${card.set.printedTotal}`
                  : ""}
              </span>
            </h3>
            {/* Si es una carta no disponible, mostrar un mensaje */}
            {card.name === "Card Unavailable" && (
              <div className="text-amber-600 text-xs font-medium mt-1">
                {t("common.cardUnavailable", "Card data unavailable")}
              </div>
            )}

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
                  {t(
                    `cardRarities.${normalizeTranslationKey(card.rarity)}`,
                    RARITY_MAP[card.rarity as CardRarity] || card.rarity
                  )}
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
                  {card.isFirstEdition && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 text-xs shrink-0"
                    >
                      1st
                    </Badge>
                  )}

                  {/* Badge de Foil */}
                  {card.isFoil && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 text-xs shrink-0"
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
                      {t(
                        `cardConditions.${normalizeTranslationKey(
                          card.condition
                        )}`,
                        CONDITION_MAP[card.condition as CardCondition] ||
                          card.condition
                      )}
                    </Badge>
                  )}

                  {/* Badge de Notas */}
                  {(card as any).notes && (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 text-xs shrink-0 cursor-pointer hover:bg-gray-100"
                      onClick={handleNotesClick}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {t("card.notes")}
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

      {/* Modal de Notas */}
      <Dialog
        open={isNotesModalOpen}
        onOpenChange={setIsNotesModalOpen}
      >
        <DialogContent className="mr-8 w-[280px] sm:w-[600px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("card.notes")} - {card.name}
            </DialogTitle>
            <DialogDescription>{t("card.personalNotes")}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
            {(card as any).notes}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CardItem;
