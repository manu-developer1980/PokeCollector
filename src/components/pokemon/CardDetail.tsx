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
import { PlusCircle, Heart } from "lucide-react";

interface CardDetailProps {
  card: PokemonCard | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCollection: (card: PokemonCard) => void;
  onAddToWishlist: (card: PokemonCard) => void;
}

const CardDetail = ({
  card,
  isOpen,
  onClose,
  onAddToCollection,
  onAddToWishlist,
}: CardDetailProps) => {
  if (!card) return null;

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
          <div className="flex justify-center">
            <img
              src={card.images.large}
              alt={card.name}
              className="rounded-lg max-h-[400px] object-contain"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Card Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Type</div>
                <div>{card.types?.join(", ") || "N/A"}</div>

                <div className="text-gray-500">HP</div>
                <div>{card.hp || "N/A"}</div>

                <div className="text-gray-500">Supertype</div>
                <div>{card.supertype}</div>

                <div className="text-gray-500">Subtypes</div>
                <div>{card.subtypes?.join(", ") || "N/A"}</div>

                {card.tcgplayer?.prices && (
                  <>
                    <div className="text-gray-500">Market Price</div>
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
                <h3 className="text-sm font-medium mb-1">Attacks</h3>
                <div className="space-y-2">
                  {card.attacks.map((attack, index) => (
                    <div
                      key={index}
                      className="text-sm"
                    >
                      <div className="font-medium">{attack.name}</div>
                      <div className="text-gray-500">{attack.text}</div>
                      <div className="text-gray-500">
                        Damage: {attack.damage || "N/A"} · Cost:{" "}
                        {attack.convertedEnergyCost}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {card.rules && card.rules.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Rules</h3>
                <div className="text-sm text-gray-700">
                  {card.rules.map((rule, index) => (
                    <p key={index}>{rule}</p>
                  ))}
                </div>
              </div>
            )}

            {card.flavorText && (
              <div>
                <h3 className="text-sm font-medium mb-1">Flavor Text</h3>
                <div className="text-sm italic text-gray-600">
                  {card.flavorText}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onAddToWishlist(card)}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Add to Wishlist
          </Button>
          <Button
            onClick={() => onAddToCollection(card)}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <PlusCircle className="h-4 w-4" />
            Add to Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetail;
