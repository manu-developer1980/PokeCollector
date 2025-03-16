import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PokemonCard } from "@/types/pokemon";
import { PlusCircle, Heart, Trash2 } from "lucide-react";
import {
  POKEMON_TYPES_MAP,
  RARITY_MAP,
  SUPERTYPE_MAP,
  SUBTYPE_MAP,
  type PokemonType,
  type CardRarity,
  type CardSupertype,
  type CardSubtype,
} from "@/lib/constants";

interface CardDetailProps {
  card: PokemonCard | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCollection: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  onRemoveFromWishlist?: (cardId: string) => void;
  isInWishlist?: boolean;
  mode?: "search" | "wishlist" | "collection";
}

const CardDetail: React.FC<CardDetailProps> = ({
  card,
  isOpen,
  onClose,
  onAddToCollection,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist,
  mode = "search",
}) => {
  if (!card) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {card.name}
            <div className="flex gap-2 flex-wrap">
              {card.rarity && (
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700"
                >
                  {RARITY_MAP[card.rarity as CardRarity] || card.rarity}
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
              {card.isFirstEdition && (
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700"
                >
                  1ª Edición
                </Badge>
              )}
              {card.isFoil && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700"
                >
                  ✨ Foil
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {card.set.name} · {card.number}/{card.set.printedTotal}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6">
          <div>
            <img
              src={card.images.large}
              alt={card.name}
              className="rounded-lg max-w-[300px]"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Detalles de la Carta</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Tipo</div>
                <div>
                  {card.types
                    ? card.types.map(translateType).join(", ")
                    : "N/A"}
                </div>

                <div className="text-gray-500">PS</div>
                <div>{card.hp || "N/A"}</div>

                <div className="text-gray-500">Supertipo</div>
                <div>
                  {SUPERTYPE_MAP[card.supertype as CardSupertype] ||
                    card.supertype ||
                    "N/A"}
                </div>

                <div className="text-gray-500">Subtipos</div>
                <div>
                  {card.subtypes
                    ?.map(
                      (subtype) =>
                        SUBTYPE_MAP[subtype as CardSubtype] || subtype
                    )
                    .join(", ") || "N/A"}
                </div>

                {card.tcgplayer?.prices && (
                  <>
                    <div className="text-gray-500">Precio de Mercado</div>
                    <div>
                      {Object.entries(card.tcgplayer.prices).map(
                        ([key, value]) => (
                          <div key={key}>
                            {key}: ${value?.market?.toFixed(2) || "N/A"}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}

                {card.quantity && (
                  <>
                    <div className="text-gray-500">Cantidad</div>
                    <div>{card.quantity}</div>
                  </>
                )}

                {card.isFirstEdition !== undefined && (
                  <>
                    <div className="text-gray-500">Edición</div>
                    <div>
                      {card.isFirstEdition ? "Primera Edición" : "Ilimitada"}
                    </div>
                  </>
                )}

                {card.isFoil !== undefined && (
                  <>
                    <div className="text-gray-500">Acabado</div>
                    <div>{card.isFoil ? "Foil" : "Normal"}</div>
                  </>
                )}
              </div>
            </div>

            {card.attacks && card.attacks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Ataques</h3>
                <div className="space-y-2">
                  {card.attacks.map((attack, index) => (
                    <div
                      key={index}
                      className="text-sm"
                    >
                      <div className="font-medium">{attack.name}</div>
                      <div className="text-gray-500">{attack.text}</div>
                      <div className="text-gray-500">
                        Daño: {attack.damage || "N/A"} · Coste:{" "}
                        {attack.convertedEnergyCost}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {card.rules && card.rules.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Reglas</h3>
                <div className="text-sm text-gray-700">
                  {card.rules.map((rule, index) => (
                    <p key={index}>{rule}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <DialogFooter className="flex justify-between sm:justify-between">
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetail;
