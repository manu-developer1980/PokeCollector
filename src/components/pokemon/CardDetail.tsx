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
import { Edit2, Trash, Plus, Heart, FileText } from "lucide-react";
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

const CardDetail: React.FC<CardDetailProps> = ({
  card,
  isOpen,
  onClose,
  mode = "search",
  onAddToCollection,
  onRemoveFromWishlist,
  onUpdate,
  onRemove,
}) => {
  const [cardDetails, setCardDetails] = useState<PokemonCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localCard, setLocalCard] = useState<CollectionCard | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotesModalOpen(true);
  };

  useEffect(() => {
    const loadCardDetails = async () => {
      if (!card) {
        setCardDetails(null);
        return;
      }

      try {
        if (mode === "collection") {
          const collectionCard = card as CollectionCard;
          const cardId = collectionCard.card_id;

          if (!cardId) {
            console.warn("Missing card_id for collection card:", card);
            return;
          }

          const details = await getCardById(cardId);
          if (!details) {
            console.error("No se pudieron cargar los detalles de la carta");
            return;
          }

          setCardDetails({
            ...details,
            id: collectionCard.id,
            collection_id: collectionCard.collection_id,
            quantity: collectionCard.quantity,
            condition: collectionCard.condition,
            is_foil: collectionCard.is_foil,
            is_first_edition: collectionCard.is_first_edition,
            notes: collectionCard.notes,
          });
          setLocalCard(collectionCard);
        } else {
          const pokemonCard = card as PokemonCard;
          const details = pokemonCard.id
            ? await getCardById(pokemonCard.id)
            : null;
          if (!details && !pokemonCard) {
            console.error("No se pudieron cargar los detalles de la carta");
            return;
          }
          setCardDetails(details || pokemonCard);
        }
      } catch (error) {
        console.error("Error loading card details:", error);
        setCardDetails(null);
      }
    };

    if (isOpen && card) {
      loadCardDetails();
    } else {
      setCardDetails(null);
      setLocalCard(null);
    }
  }, [card, isOpen, mode]);

  const handleRemove = (cardId: string) => {
    onRemove?.(cardId);
    onClose();
  };

  const handleAddToCollection = (card: PokemonCard) => {
    onAddToCollection?.(card);
    onClose();
  };

  const handleAddToWishlist = (card: PokemonCard) => {
    onAddToWishlist?.(card);
    onClose();
  };

  const handleRemoveFromWishlist = (card: PokemonCard) => {
    onRemoveFromWishlist?.(card);
    onClose();
  };

  const handleUpdate = async (cardData: {
    id: string;
    quantity: number;
    condition?: string;
    is_foil?: boolean;
    is_first_edition?: boolean;
    notes?: string;
  }) => {
    if (!onUpdate || !localCard) return;

    try {
      const updatedCard = await onUpdate({
        ...cardData,
        id: localCard.id,
      });

      if (updatedCard) {
        // Actualizar cardDetails
        setCardDetails((prev) => ({
          ...prev!,
          quantity: updatedCard.quantity,
          condition: updatedCard.condition,
          is_foil: updatedCard.is_foil,
          is_first_edition: updatedCard.is_first_edition,
          notes: updatedCard.notes,
        }));

        // Actualizar localCard
        setLocalCard((prev) => ({
          ...prev!,
          quantity: updatedCard.quantity,
          condition: updatedCard.condition,
          is_foil: updatedCard.is_foil,
          is_first_edition: updatedCard.is_first_edition,
          notes: updatedCard.notes,
        }));
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const renderActions = () => {
    switch (mode) {
      case "search":
        return (
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleAddToCollection(cardDetails)}
            >
              <Plus className="h-4 w-4 mr-2" /> Añadir a Colección
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAddToWishlist(cardDetails)}
              className="w-full"
            >
              <Heart className="h-4 w-4 mr-2 text-red-500 fill-current" />{" "}
              Añadir a Lista de Deseos
            </Button>
          </div>
        );

      case "wishlist":
        return (
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button
              variant="outline"
              onClick={() => handleAddToCollection(cardDetails)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Añadir a Colección
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRemoveFromWishlist(card)}
              className="w-full"
            >
              <Trash className="h-4 w-4 mr-2" /> Eliminar de Lista de Deseos
            </Button>
          </div>
        );

      case "collection":
        return null; // Eliminamos el botón de aquí
    }
  };

  // Agregar una validación temprana
  if (!cardDetails) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-3xl h-auto max-h-[90vh] overflow-y-auto">
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
                {mode === "collection" && localCard && (
                  <>
                    {localCard.quantity > 1 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs shrink-0"
                      >
                        x{localCard.quantity}
                      </Badge>
                    )}
                    {localCard.is_first_edition && (
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 text-xs shrink-0"
                      >
                        1st
                      </Badge>
                    )}
                    {localCard.is_foil && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 text-xs shrink-0"
                      >
                        ✨
                      </Badge>
                    )}
                    {localCard.notes && (
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 text-xs shrink-0 cursor-pointer hover:bg-gray-100"
                        onClick={handleNotesClick}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Notas
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
                  className="hover:font-bold w-full"
                  onClick={() => handleRemove(card.id)}
                >
                  <Trash className="h-4 w-4 mr-2" /> Eliminar
                </Button>
              )}
            </div>

            <div className="flex-1 flex flex-col ">
              {mode === "collection" && localCard && (
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
                    <div>{localCard.quantity}</div>
                    <div className="text-gray-500">Condición:</div>
                    <div>
                      {CONDITION_MAP[localCard.condition as CardCondition] ||
                        "Casi Perfecta"}
                    </div>
                    <div className="text-gray-500">Foil/Holo:</div>
                    <div>{localCard.is_foil ? "Sí" : "No"}</div>
                    <div className="text-gray-500">Primera Edición:</div>
                    <div>{localCard.is_first_edition ? "Sí" : "No"}</div>
                    {localCard.notes && (
                      <>
                        <div className="text-gray-500">Notas:</div>
                        <div>{localCard.notes}</div>
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

      {/* Modal de Notas */}
      <Dialog
        open={isNotesModalOpen}
        onOpenChange={setIsNotesModalOpen}
      >
        <DialogContent className="mr-8 w-[280px] sm:w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notas - {cardDetails.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
            {(card as CollectionCard).notes}
          </div>
        </DialogContent>
      </Dialog>

      {isEditModalOpen && cardDetails && localCard && (
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          card={localCard} // Pasar la carta de la colección completa
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default CardDetail;
