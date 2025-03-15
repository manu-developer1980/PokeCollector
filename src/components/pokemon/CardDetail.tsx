import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PokemonCard } from "@/types/pokemon";
import { PlusCircle, Heart, Trash2 } from "lucide-react";

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

const CardDetail = ({
  card,
  isOpen,
  onClose,
  onAddToCollection,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist = false,
  mode = "search",
}: CardDetailProps) => {
  if (!card) return null;

  const renderFooterButtons = () => {
    switch (mode) {
      case "wishlist":
        return (
          <>
            <Button
              variant="outline"
              onClick={() => {
                onRemoveFromWishlist?.(card.id);
                onClose();
              }}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar de Lista de Deseos
            </Button>
            <Button
              onClick={() => onAddToCollection(card)}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <PlusCircle className="h-4 w-4" />
              Añadir a Colección
            </Button>
          </>
        );
      case "collection":
        return null; // La colección maneja sus propias acciones
      default: // caso 'search'
        return (
          <>
            {!isInWishlist && onAddToWishlist && (
              <Button
                variant="outline"
                onClick={() => {
                  onAddToWishlist(card);
                  onClose();
                }}
                className="gap-2"
              >
                <Heart className="h-4 w-4" />
                Añadir a Lista de Deseos
              </Button>
            )}
            <Button
              onClick={() => onAddToCollection(card)}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <PlusCircle className="h-4 w-4" />
              Añadir a Colección
            </Button>
          </>
        );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {card.name}
            {card.rarity && (
              <Badge
                variant="outline"
                className="ml-2"
              >
                {card.rarity}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {card.set.name} · {card.number}/{card.set.printedTotal}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={card.images.large}
              alt={card.name}
              className="rounded-lg w-full"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Detalles de la Carta</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Tipo</div>
                <div>{card.types?.join(", ") || "N/A"}</div>

                <div className="text-gray-500">PS</div>
                <div>{card.hp || "N/A"}</div>

                <div className="text-gray-500">Supertipo</div>
                <div>{card.supertype}</div>

                <div className="text-gray-500">Subtipos</div>
                <div>{card.subtypes?.join(", ") || "N/A"}</div>

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

            {card.flavorText && (
              <div>
                <h3 className="text-sm font-medium mb-1">Texto de Ambiente</h3>
                <div className="text-sm italic text-gray-600">
                  {card.flavorText}
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
