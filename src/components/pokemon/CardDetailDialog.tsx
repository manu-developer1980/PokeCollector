import React, { useState, useEffect } from "react";
import { getCardById } from "@/lib/api";
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
import { CollectionCard, PokemonCard } from "@/types/pokemon";
import { Edit2 } from "lucide-react";
import EditCardModal from "./EditCardModal";
import { Trash } from "lucide-react";
import {
  POKEMON_TYPES_MAP,
  RARITY_MAP,
  CONDITION_MAP,
  SUPERTYPE_MAP,
  SUBTYPE_MAP,
  type PokemonType,
  type CardRarity,
  type CardCondition,
  type CardSupertype,
  type CardSubtype,
} from "@/lib/constants";

interface CardDetailDialogProps {
  card: CollectionCard | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardData: {
    id: string;
    quantity: number;
    condition?: string;
    isFoil?: boolean;
    isFirstEdition?: boolean;
    notes?: string;
  }) => void;
  onRemove: (cardId: string) => void;
}

const CardDetailDialog = ({
  card,
  isOpen,
  onClose,
  onUpdate,
  onRemove,
}: CardDetailDialogProps) => {
  const [cardDetails, setCardDetails] = useState<PokemonCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadCardDetails = async () => {
      if (card) {
        try {
          const details = await getCardById(card.card_id);
          setCardDetails(details);
        } catch (error) {
          console.error("Error loading card details:", error);
        }
      }
    };

    if (isOpen && card) {
      loadCardDetails();
    }
  }, [card, isOpen]);

  if (!card || !cardDetails) return null;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {cardDetails.name}
              {cardDetails.rarity && (
                <Badge
                  variant="outline"
                  className="ml-2"
                >
                  {RARITY_MAP[cardDetails.rarity as CardRarity] ||
                    cardDetails.rarity}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {cardDetails.set?.name} · {cardDetails.number}/
              {cardDetails.set?.printedTotal}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-6 wrap flex-wrap">
            <div className="flex flex-col gap-4">
              <img
                src={cardDetails.images?.large || cardDetails.images?.small}
                alt={cardDetails.name}
                className="rounded-lg max-w-[300px]"
              />
              <Button
                variant="outline"
                onClick={() => onRemove(card.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
              >
                <Trash className="h-4 w-4 mr-2" /> Eliminar
              </Button>
            </div>

            <div className="space-y-4 flex-1">
              {/* Información de la colección con botón de editar */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Detalles en Colección</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" /> Editar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Cantidad:</div>
                  <div>{card.quantity}</div>
                  <div className="text-gray-500">Condición:</div>
                  <div>
                    {CONDITION_MAP[card.condition as CardCondition] ||
                      "Casi Perfecta"}
                  </div>
                  <div className="text-gray-500">Foil/Holo:</div>
                  <div>{card.is_foil ? "Sí" : "No"}</div>
                  <div className="text-gray-500">Primera Edición:</div>
                  <div>{card.is_first_edition ? "Sí" : "No"}</div>
                  {card.notes && (
                    <>
                      <div className="text-gray-500">Notas:</div>
                      <div>{card.notes}</div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">
                  Detalles de la Carta
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {cardDetails.types?.length > 0 && (
                    <>
                      <div className="text-gray-500">Tipo</div>
                      <div>
                        {cardDetails.types
                          .map(
                            (type) =>
                              POKEMON_TYPES_MAP[
                                type.toLowerCase() as PokemonType
                              ] || type
                          )
                          .join(", ")}
                      </div>
                    </>
                  )}

                  {cardDetails.hp && (
                    <>
                      <div className="text-gray-500">PS</div>
                      <div>{cardDetails.hp}</div>
                    </>
                  )}

                  {cardDetails.supertype && (
                    <>
                      <div className="text-gray-500">Supertipo</div>
                      <div>
                        {SUPERTYPE_MAP[
                          cardDetails.supertype as CardSupertype
                        ] || cardDetails.supertype}
                      </div>
                    </>
                  )}

                  {cardDetails.subtypes?.length > 0 && (
                    <>
                      <div className="text-gray-500">Subtipos</div>
                      <div>
                        {cardDetails.subtypes
                          .map(
                            (subtype) =>
                              SUBTYPE_MAP[subtype as CardSubtype] || subtype
                          )
                          .join(", ")}
                      </div>
                    </>
                  )}

                  {cardDetails.tcgplayer?.prices &&
                    Object.entries(cardDetails.tcgplayer.prices).some(
                      ([_, value]) => value?.market
                    ) && (
                      <>
                        <div className="text-gray-500">Precio de Mercado</div>
                        <div>
                          {Object.entries(cardDetails.tcgplayer.prices)
                            .filter(([_, value]) => value?.market)
                            .map(([key, value]) => (
                              <div key={key}>
                                {key}: ${value.market.toFixed(2)}
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                </div>
              </div>

              {cardDetails.attacks?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Ataques</h3>
                  <div className="space-y-2">
                    {cardDetails.attacks.map((attack, index) => (
                      <div
                        key={index}
                        className="text-sm"
                      >
                        <div className="font-medium">{attack.name}</div>
                        {attack.text && (
                          <div className="text-gray-500">{attack.text}</div>
                        )}
                        <div className="text-gray-500">
                          {attack.damage && `Daño: ${attack.damage}`}
                          {attack.damage && attack.convertedEnergyCost && " · "}
                          {attack.convertedEnergyCost &&
                            `Coste: ${attack.convertedEnergyCost}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cardDetails.rules && cardDetails.rules.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Reglas</h3>
                  <div className="text-sm text-gray-700">
                    {cardDetails.rules.map((rule, index) => (
                      <p key={index}>{rule}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditCardModal
        card={card}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </>
  );
};

export default CardDetailDialog;
