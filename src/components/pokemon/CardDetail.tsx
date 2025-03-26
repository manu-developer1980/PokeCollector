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
import { useTranslation } from "react-i18next";
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

// Función para normalizar claves de traducción
const normalizeTranslationKey = (key: string): string => {
  if (!key) return "";

  // Elimina espacios y convierte a minúsculas
  return key
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, ""); // Elimina caracteres especiales
};

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
  userPlan?: string;
}

const CardDetail: React.FC<CardDetailProps> = ({
  card,
  isOpen,
  onClose,
  onAddToCollection,
  onAddToWishlist,
  onRemoveFromWishlist,
  onUpdate,
  onRemove,
  mode = "search",
  userPlan = "aprendiz",
}) => {
  const [cardDetails, setCardDetails] = useState<PokemonCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localCard, setLocalCard] = useState<CollectionCard | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const { t } = useTranslation();

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
    if (onAddToCollection && cardDetails) {
      // Asegurarse de que cardDetails tenga toda la información necesaria
      const completeCard: PokemonCard = {
        ...cardDetails,
        id: cardDetails.id,
        name: cardDetails.name,
        images: cardDetails.images,
        set: cardDetails.set,
      };
      onAddToCollection(completeCard);
      onClose();
    }
  };

  const handleAddToWishlist = (card: PokemonCard) => {
    if (onAddToWishlist) {
      onAddToWishlist(card);
      onClose();
    }
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
              onClick={() => cardDetails && handleAddToCollection(cardDetails)}
            >
              <Plus className="h-4 w-4 mr-2" /> {t("card.addToCollection")}
            </Button>
            <Button
              variant="outline"
              onClick={() => cardDetails && handleAddToWishlist(cardDetails)}
              className="w-full"
            >
              <Heart className="h-4 w-4 mr-2 text-red-500 fill-current" />
              {t("card.addToWishlist")}
            </Button>
          </div>
        );

      case "wishlist":
        return (
          <div className="flex flex-col gap-2 mt-auto pt-4">
            <Button
              variant="outline"
              onClick={() => cardDetails && handleAddToCollection(cardDetails)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("card.addToCollection")}
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                cardDetails && handleRemoveFromWishlist(cardDetails)
              }
              className="w-full"
            >
              <Trash className="h-4 w-4 mr-2" /> {t("card.removeFromWishlist")}
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
            <DialogTitle>{t("common.loading")}</DialogTitle>
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
                    {t(
                      `cardRarities.${normalizeTranslationKey(
                        cardDetails.rarity
                      )}`,
                      {
                        defaultValue:
                          RARITY_MAP[cardDetails.rarity as CardRarity] ||
                          cardDetails.rarity,
                      }
                    )}
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
                        {t("card.notes")}
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
                  <Trash className="h-4 w-4 mr-2" /> {t("common.remove")}
                </Button>
              )}
            </div>

            <div className="flex-1 flex flex-col ">
              {mode === "collection" && localCard && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">
                      {t("collection.collectionDetails")}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditModalOpen(true)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" /> {t("common.edit")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">{t("card.quantity")}:</div>
                    <div>{localCard.quantity}</div>
                    <div className="text-gray-500">{t("card.condition")}:</div>
                    <div>
                      {t(
                        `cardConditions.${normalizeTranslationKey(
                          localCard.condition
                        )}`,
                        {
                          defaultValue:
                            CONDITION_MAP[
                              localCard.condition as CardCondition
                            ] || t("card.conditionNearMint"),
                        }
                      )}
                    </div>
                    <div className="text-gray-500">{t("card.foil")}:</div>
                    <div>
                      {localCard.is_foil ? t("common.yes") : t("common.no")}
                    </div>
                    <div className="text-gray-500">
                      {t("card.firstEdition")}:
                    </div>
                    <div>
                      {localCard.is_first_edition
                        ? t("common.yes")
                        : t("common.no")}
                    </div>
                    {localCard.notes && (
                      <>
                        <div className="text-gray-500">{t("card.notes")}:</div>
                        <div>{localCard.notes}</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">
                    {t("card.details")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {cardDetails.types && cardDetails.types.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("card.type")}
                        </p>
                        <p className="font-medium">
                          {cardDetails.types
                            .map((type) =>
                              t(`pokemonTypes.${type.toLowerCase()}`, {
                                defaultValue:
                                  POKEMON_TYPES_MAP[type as PokemonType] ||
                                  type,
                              })
                            )
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {cardDetails.supertype && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("card.supertype")}
                        </p>
                        <p className="font-medium">
                          {t(
                            `cardSupertypes.${cardDetails.supertype.toLowerCase()}`,
                            { defaultValue: cardDetails.supertype }
                          )}
                        </p>
                      </div>
                    )}

                    {cardDetails.subtypes &&
                      cardDetails.subtypes.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("card.subtype")}
                          </p>
                          <p className="font-medium">
                            {cardDetails.subtypes
                              .map((subtype) =>
                                t(
                                  `cardSubtypes.${subtype
                                    .toLowerCase()
                                    .replace(/\s+/g, "")}`,
                                  { defaultValue: subtype }
                                )
                              )
                              .join(", ")}
                          </p>
                        </div>
                      )}

                    {cardDetails.rarity && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("card.rarity")}
                        </p>
                        <p className="font-medium">
                          {t(
                            `cardRarities.${cardDetails.rarity
                              .toLowerCase()
                              .replace(/\s+/g, "")}`,
                            { defaultValue: cardDetails.rarity }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {cardDetails.abilities && cardDetails.abilities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("card.abilities")}
                    </h3>
                    <div className="space-y-2">
                      {cardDetails.abilities.map((ability, index) => (
                        <div
                          key={index}
                          className="p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ability.name}</span>
                            {ability.type && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {ability.type}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">{ability.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cardDetails.attacks && cardDetails.attacks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("card.attacks")}
                    </h3>
                    <div className="space-y-2">
                      {cardDetails.attacks.map((attack, index) => (
                        <div
                          key={index}
                          className="p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{attack.name}</span>
                              {attack.damage && (
                                <span className="text-red-600 font-bold">
                                  {attack.damage}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              {attack.cost &&
                                attack.cost.map((type, i) => (
                                  <span
                                    key={i}
                                    className="inline-block w-5 h-5 mr-1"
                                  >
                                    <img
                                      src={`/images/energy/${type.toLowerCase()}.png`}
                                      alt={type}
                                      className="w-full h-full object-contain"
                                    />
                                  </span>
                                ))}
                            </div>
                          </div>
                          {attack.text && (
                            <p className="text-sm mt-1">{attack.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cardDetails.rules && cardDetails.rules.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("card.rules")}
                    </h3>
                    <div className="space-y-2">
                      {cardDetails.rules.map((rule, index) => (
                        <p
                          key={index}
                          className="text-sm p-2 bg-gray-50 rounded-md"
                        >
                          {rule}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {cardDetails.weaknesses &&
                  cardDetails.weaknesses.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">
                        {t("card.weaknesses")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {cardDetails.weaknesses.map((weakness, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-red-50 text-red-700"
                          >
                            <img
                              src={`/images/energy/${weakness.type.toLowerCase()}.png`}
                              alt={weakness.type}
                              className="w-4 h-4 mr-1"
                            />
                            {weakness.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {cardDetails.resistances &&
                  cardDetails.resistances.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">
                        {t("card.resistances")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {cardDetails.resistances.map((resistance, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            <img
                              src={`/images/energy/${resistance.type.toLowerCase()}.png`}
                              alt={resistance.type}
                              className="w-4 h-4 mr-1"
                            />
                            {resistance.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {cardDetails.retreatCost &&
                  cardDetails.retreatCost.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">
                        {t("card.retreatCost")}
                      </h3>
                      <div className="flex items-center">
                        {cardDetails.retreatCost.map((type, index) => (
                          <img
                            key={index}
                            src={`/images/energy/${type.toLowerCase()}.png`}
                            alt={type}
                            className="w-5 h-5 mr-1"
                          />
                        ))}
                        <span className="ml-2">
                          ({cardDetails.retreatCost.length})
                        </span>
                      </div>
                    </div>
                  )}

                {renderActions()}
              </div>
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

      {mode === "collection" && localCard && (
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          card={localCard}
          onSave={handleUpdate}
        />
      )}
    </>
  );
};

export default CardDetail;
