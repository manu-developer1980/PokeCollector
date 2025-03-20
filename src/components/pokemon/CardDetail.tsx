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
import { CollectionCard, PokemonCard } from "@/types/pokemon";
import { Edit2, Trash, Plus, Heart } from "lucide-react";
import EditCardModal from "./EditCardModal";
import { getRarityBadgeStyle } from "@/lib/utils";
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

interface CardDetailProps {
  card: PokemonCard | CollectionCard | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCollection?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  onRemoveFromWishlist?: (card: PokemonCard) => void;
  onUpdate?: (cardData: any) => void;
  onRemove?: (cardId: string) => void;
  mode: "search" | "collection" | "wishlist";
}

const CardDetail = ({
  card,
  isOpen,
  onClose,
  onAddToCollection,
  onAddToWishlist,
  onRemoveFromWishlist,
  onUpdate,
  onRemove,
  mode,
}: CardDetailProps) => {
  const [cardDetails, setCardDetails] = useState<PokemonCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadCardDetails = async () => {
      if (card?.id) {
        try {
          if (mode === "collection") {
            const details = await getCardById((card as CollectionCard).card_id);
            if (details) {
              // Combinar los detalles de la API con los datos de la colección
              setCardDetails({
                ...details,
                quantity: (card as CollectionCard).quantity,
                condition: (card as CollectionCard).condition,
                isFoil: (card as CollectionCard).isFoil,
                isFirstEdition: (card as CollectionCard).isFirstEdition,
                notes: (card as CollectionCard).notes,
              });
            }
          } else if (mode === "wishlist") {
            setCardDetails(card as PokemonCard);
          } else {
            const details = await getCardById(card.id);
            setCardDetails(details);
          }
        } catch (error) {
          console.error("Error loading card details:", error);
        }
      }
    };

    if (isOpen && card) {
      loadCardDetails();
    } else {
      setCardDetails(null);
    }
  }, [card, isOpen, mode]); // Dependencias del useEffect

  if (!card || !cardDetails) return null;

  const renderActions = () => {
    switch (mode) {
      case "search":
        return (
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onAddToCollection?.(cardDetails)}
            >
              <Plus className="h-4 w-4 mr-2" /> Añadir a Colección
            </Button>
            <Button
              variant="outline"
              onClick={() => onAddToWishlist?.(cardDetails)}
              className="w-full"
            >
              <Heart className="h-4 w-4 mr-2" /> Añadir a Lista de Deseos
            </Button>
          </div>
        );

      case "wishlist":
        return (
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button
              variant="outline"
              onClick={() => onAddToCollection?.(cardDetails)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Añadir a Colección
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (card && onRemoveFromWishlist) {
                  onRemoveFromWishlist(card);
                }
                onClose();
              }}
              className="w-full"
            >
              <Trash className="h-4 w-4 mr-2" /> Eliminar de Lista de Deseos
            </Button>
          </div>
        );
    }
  };

  const handleUpdate = async (cardData: any) => {
    if (!onUpdate || !card) return;

    try {
      await onUpdate({
        id: (card as CollectionCard).id,
        quantity: cardData.quantity,
        condition: cardData.condition,
        isFoil: cardData.isFoil,
        isFirstEdition: cardData.isFirstEdition,
        notes: cardData.notes,
      });

      // Después de la actualización, volvemos a cargar los detalles
      if (mode === "collection" && card) {
        const details = await getCardById((card as CollectionCard).card_id);
        if (details) {
          setCardDetails({
            ...details,
            quantity: cardData.quantity,
            condition: cardData.condition,
            isFoil: cardData.isFoil,
            isFirstEdition: cardData.isFirstEdition,
            notes: cardData.notes,
          });
        }
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

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
            <DialogTitle>
              <span className="flex items-center gap-2">
                {cardDetails.name}
                {cardDetails.rarity && (
                  <Badge
                    variant="outline"
                    className={getRarityBadgeStyle(cardDetails.rarity)}
                  >
                    {RARITY_MAP[cardDetails.rarity as CardRarity] ||
                      cardDetails.rarity}
                  </Badge>
                )}
                {mode === "collection" && (
                  <>
                    {(card as CollectionCard).quantity > 1 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs shrink-0"
                      >
                        x{(card as CollectionCard).quantity}
                      </Badge>
                    )}
                    {(card as CollectionCard).is_first_edition && (
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 text-xs shrink-0"
                      >
                        1st
                      </Badge>
                    )}
                    {(card as CollectionCard).is_foil && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 text-xs shrink-0"
                      >
                        ✨
                      </Badge>
                    )}
                    {(card as CollectionCard).condition && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 text-xs shrink-0"
                      >
                        {CONDITION_MAP[
                          (card as CollectionCard).condition as CardCondition
                        ] || (card as CollectionCard).condition}
                      </Badge>
                    )}
                  </>
                )}
              </span>
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
                className="rounded-lg xxs:max-w-[300px] w-auto"
              />
              {mode === "collection" && (
                <Button
                  className=" hover:font-bold w-full"
                  onClick={() => onRemove?.(card.id)}
                >
                  <Trash className="h-4 w-4 mr-2" /> Eliminar
                </Button>
              )}
            </div>

            <div className="flex-1 flex flex-col min-h-full">
              {mode === "collection" && (
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
                    <div>{(card as CollectionCard).quantity}</div>
                    <div className="text-gray-500">Condición:</div>
                    <div>
                      {CONDITION_MAP[
                        (card as CollectionCard).condition as CardCondition
                      ] || "Casi Perfecta"}
                    </div>
                    <div className="text-gray-500">Foil/Holo:</div>
                    <div>{(card as CollectionCard).is_foil ? "Sí" : "No"}</div>
                    <div className="text-gray-500">Primera Edición:</div>
                    <div>
                      {(card as CollectionCard).is_first_edition ? "Sí" : "No"}
                    </div>
                    {(card as CollectionCard).notes && (
                      <>
                        <div className="text-gray-500">Notas:</div>
                        <div>{(card as CollectionCard).notes}</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-4">
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
                            {attack.damage &&
                              attack.convertedEnergyCost &&
                              " · "}
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

              {/* Los botones siempre estarán al final */}
              {renderActions()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {mode === "collection" && onUpdate && (
        <EditCardModal
          card={card as CollectionCard}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdate}
          onRemove={onRemove}
        />
      )}
    </>
  );
};

export default CardDetail;
