import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Collection, PokemonCard } from "@/types/pokemon";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

interface AddToCollectionDialogProps {
  card: PokemonCard | null;
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCollection: (cardData: {
    card: PokemonCard;
    collectionId: string;
    quantity: number;
    condition?: string;
    isFoil?: boolean;
    isFirstEdition?: boolean;
    notes?: string;
  }) => void;
}

const AddToCollectionDialog = ({
  card,
  collections,
  isOpen,
  onClose,
  onAddToCollection,
}: AddToCollectionDialogProps) => {
  const { t } = useTranslation();

  // Valores iniciales por defecto
  const DEFAULT_VALUES = {
    quantity: 1,
    condition: "Near Mint",
    isFoil: false,
    isFirstEdition: false,
    notes: "",
  };

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(collections[0] || null);
  const [quantity, setQuantity] = useState(DEFAULT_VALUES.quantity);
  const [condition, setCondition] = useState(DEFAULT_VALUES.condition);
  const [isFoil, setIsFoil] = useState(DEFAULT_VALUES.isFoil);
  const [isFirstEdition, setIsFirstEdition] = useState(
    DEFAULT_VALUES.isFirstEdition
  );
  const [notes, setNotes] = useState(DEFAULT_VALUES.notes);
  const [isLoading, setIsLoading] = useState(false);

  // Resetear el formulario cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      console.log("AddToCollectionDialog opened with card:", card);
      setSelectedCollection(collections[0] || null);
      setQuantity(DEFAULT_VALUES.quantity);
      setCondition(DEFAULT_VALUES.condition);
      setIsFoil(DEFAULT_VALUES.isFoil);
      setIsFirstEdition(DEFAULT_VALUES.isFirstEdition);
      setNotes(DEFAULT_VALUES.notes);
    }
  }, [isOpen, collections]);

  const handleAddToCollection = async () => {
    if (!selectedCollection || !card) return;

    try {
      setIsLoading(true);

      // Modificamos la consulta para evitar el error 406
      const { data: existingCards, error: checkError } = await supabase
        .from("collection_cards")
        .select("id, quantity")
        .match({
          collection_id: selectedCollection.id,
          card_id: card.id,
        });

      if (checkError) throw checkError;

      const existingCard = existingCards?.[0];

      if (existingCard) {
        const { error: updateError } = await supabase
          .from("collection_cards")
          .update({
            quantity: existingCard.quantity + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingCard.id);

        if (updateError) throw updateError;
      } else {
        // Crear objeto con solo los campos existentes en la tabla
        const newCard = {
          collection_id: selectedCollection.id,
          card_id: card.id,
          quantity,
          condition,
          is_foil: isFoil,
          is_first_edition: isFirstEdition,
          notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("collection_cards")
          .insert(newCard);

        if (insertError) throw insertError;
      }

      // Si la carta proviene de la lista de deseos (tiene wishlist_id), eliminarla de la lista de deseos
      console.log("Card in AddToCollectionDialog:", card);
      console.log(
        "Wishlist ID in AddToCollectionDialog:",
        (card as any).wishlist_id
      );

      if ((card as any).wishlist_id) {
        try {
          console.log(
            "Deleting wishlist card with ID:",
            (card as any).wishlist_id
          );
          const { error: removeError } = await supabase
            .from("wishlist_cards")
            .delete()
            .eq("id", (card as any).wishlist_id);

          console.log("Delete result:", removeError ? "Error" : "Success");

          if (removeError) {
            console.error("Error removing card from wishlist:", removeError);
          } else {
            toast({
              title: t("wishlist.cardRemoved"),
              description: t("wishlist.removedAfterAdding"),
            });
          }
        } catch (error) {
          console.error("Error removing card from wishlist:", error);
        }
      }

      toast({
        title: t("toasts.success"),
        description: t("collection.cardAdded"),
      });

      // Notificar al componente padre
      const cardWithWishlistId = {
        ...card,
        // Asegurarse de pasar el wishlist_id si existe
        wishlist_id: (card as any).wishlist_id,
      };
      console.log(
        "AddToCollectionDialog sending card with wishlist_id:",
        cardWithWishlistId
      );
      onAddToCollection({
        card: cardWithWishlistId,
        collectionId: selectedCollection.id,
        quantity,
        condition,
        isFoil,
        isFirstEdition,
        notes,
      });

      // Limpiar el formulario y cerrar
      onClose();
    } catch (error) {
      console.error("Error adding card to collection:", error);
      toast({
        title: t("common.error"),
        description: t("collection.errors.saveFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("collection.addCard")}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <img
              src={card.images.small}
              alt={card.name}
              className="w-24 rounded-md"
            />
            <div>
              <h3 className="font-medium">{card.name}</h3>
              <p className="text-sm text-gray-500">
                {card.set.name} · {card.number}/{card.set.printedTotal}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="collection">{t("collection.title")}</Label>
              <Select
                value={selectedCollection?.id}
                onValueChange={(id) =>
                  setSelectedCollection(
                    collections.find((c) => c.id === id) || null
                  )
                }
              >
                <SelectTrigger id="collection">
                  <SelectValue placeholder={t("collection.selectCollection")} />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem
                      key={collection.id}
                      value={collection.id}
                    >
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">{t("card.quantity")}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">{t("card.condition")}</Label>
            <Select
              value={condition}
              onValueChange={setCondition}
            >
              <SelectTrigger id="condition">
                <SelectValue placeholder={t("card.selectCondition")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mint">{t("cardConditions.mint")}</SelectItem>
                <SelectItem value="Near Mint">
                  {t("cardConditions.nearmint")}
                </SelectItem>
                <SelectItem value="Excellent">
                  {t("cardConditions.excellent")}
                </SelectItem>
                <SelectItem value="Good">{t("cardConditions.good")}</SelectItem>
                <SelectItem value="Light Played">
                  {t("cardConditions.lightplayed")}
                </SelectItem>
                <SelectItem value="Played">
                  {t("cardConditions.played")}
                </SelectItem>
                <SelectItem value="Poor">{t("cardConditions.poor")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="foil"
                checked={isFoil}
                onCheckedChange={(checked) => setIsFoil(checked as boolean)}
              />
              <Label
                htmlFor="foil"
                className="text-sm cursor-pointer"
              >
                {t("card.foil")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="firstEdition"
                checked={isFirstEdition}
                onCheckedChange={(checked) =>
                  setIsFirstEdition(checked as boolean)
                }
              />
              <Label
                htmlFor="firstEdition"
                className="text-sm cursor-pointer"
              >
                {t("card.firstEdition")}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("card.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("card.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAddToCollection}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? t("collection.adding") : t("collection.addCard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;
