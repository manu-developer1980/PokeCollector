import { useState, useEffect } from "react";
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
import EditCardModal from "./EditCardModal";
import { Trash, Plus } from "lucide-react";
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
import { getRarityBadgeStyle } from "@/lib/utils";
// import { useTranslation } from "react-i18next";
interface CardDetailDialogProps {
  card: PokemonCard | CollectionCard;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (card: CollectionCard) => void;
  onRemove?: (card: CollectionCard) => void;
  onAddToCollection?: (card: PokemonCard) => void;
  onRemoveFromWishlist?: (card: PokemonCard) => void;
  mode?: "search" | "collection" | "wishlist";
}

const CardDetailDialog = ({
  card,
  isOpen,
  onClose,
  onUpdate,
  onRemove,
  onAddToCollection,
  onRemoveFromWishlist,
  mode = "search",
}: CardDetailDialogProps) => {
  const [cardDetails, setCardDetails] = useState<PokemonCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Usamos useTranslation para mantener la consistencia con el resto del código

  useEffect(() => {
    const loadCardDetails = async () => {
      if (!card) return;

      try {
        // En modo wishlist, la carta ya tiene todos los detalles
        if (mode === "wishlist") {
          setCardDetails(card as PokemonCard);
        } else {
          // En modo collection, necesitamos usar card.card_id en lugar de card.id
          const cardId =
            mode === "collection" ? (card as CollectionCard).card_id : card.id;
          const details = await getCardById(cardId);
          setCardDetails(details);
        }
      } catch (error) {
        console.error("Error loading card details:", error);
      }
    };

    if (isOpen && card) {
      loadCardDetails();
    }
  }, [card, isOpen, mode]);

  if (!card || !cardDetails) return null;

  // La función renderActions ya no es necesaria porque los botones se han movido debajo de la imagen

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto">
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
                    {card.quantity > 1 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs shrink-0"
                      >
                        x{card.quantity}
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
              </span>
            </DialogTitle>
            <DialogDescription>
              {cardDetails.set?.name} · {cardDetails.number}/
              {cardDetails.set?.printedTotal}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-6 wrap flex-wrap justify-center">
            <div className="flex flex-col gap-4">
              <img
                src={cardDetails.images?.large || cardDetails.images?.small}
                alt={cardDetails.name}
                className="rounded-lg xxs:max-w-[300px] w-auto"
              />
              {mode === "wishlist" && cardDetails && (
                <div className="flex flex-col gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Asegurarse de que cardDetails tenga toda la información necesaria, incluido wishlist_id
                      const completeCard: PokemonCard = {
                        ...cardDetails,
                        wishlist_id:
                          mode === "wishlist"
                            ? (card as any).wishlist_id
                            : undefined, // Asegurarse de pasar el wishlist_id solo si estamos en modo wishlist
                      };
                      onAddToCollection?.(completeCard);
                      onClose(); // Cerrar el modal después de añadir a la colección
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Añadir a Colección
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (cardDetails) {
                        onRemoveFromWishlist?.(cardDetails);
                        onClose();
                      }
                    }}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-2" /> Eliminar de Lista de
                    Deseos
                  </Button>
                </div>
              )}
              {mode === "collection" && (
                <Button
                  variant="outline"
                  onClick={() => onRemove?.(card as CollectionCard)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full mt-2"
                >
                  <Trash className="h-4 w-4 mr-2" /> Eliminar
                </Button>
              )}
            </div>

            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex-1 space-y-4">
                {/* Detalles de la carta */}
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    Detalles de la Carta
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {cardDetails.types?.length > 0 && (
                      <>
                        <div className="text-gray-500">Tipo</div>
                        <div className="flex items-center gap-2">
                          {cardDetails.types.map((type, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1"
                            >
                              <img
                                src={`/images/energy/${type.toLowerCase()}.png`}
                                alt={type}
                                className="w-4 h-4"
                              />
                              <span>
                                {POKEMON_TYPES_MAP[
                                  type.toLowerCase() as PokemonType
                                ] || type}
                              </span>
                              {index < cardDetails.types.length - 1 && ", "}
                            </div>
                          ))}
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

                {/* Ataques */}
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
                          <div className="flex items-center gap-2 text-gray-500">
                            {attack.damage && (
                              <span>Daño: {attack.damage}</span>
                            )}
                            {attack.damage &&
                              attack.convertedEnergyCost &&
                              " · "}
                            {attack.convertedEnergyCost && (
                              <div className="flex items-center gap-1">
                                <span>Coste:</span>
                                {attack.cost?.map(
                                  (energyType: string, idx: number) => (
                                    <img
                                      key={idx}
                                      src={`/images/energy/${energyType.toLowerCase()}.png`}
                                      alt={energyType}
                                      className="w-4 h-4 mr-1"
                                    />
                                  )
                                ) || <span>{attack.convertedEnergyCost}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reglas */}
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

              {/* Los botones de acción se han movido debajo de la imagen */}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {mode === "collection" && (
        <EditCardModal
          card={card as CollectionCard}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedCard) => {
            // Convertir el objeto updatedCard a CollectionCard
            const collectionCard: CollectionCard = {
              ...(card as CollectionCard),
              quantity: updatedCard.quantity,
              condition: updatedCard.condition || "",
              is_foil: updatedCard.is_foil || false,
              is_first_edition: updatedCard.is_first_edition || false,
              notes: updatedCard.notes || "",
            };
            onUpdate?.(collectionCard);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CardDetailDialog;
