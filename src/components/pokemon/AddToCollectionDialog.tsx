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
      setSelectedCollection(collections[0] || null);
      setQuantity(DEFAULT_VALUES.quantity);
      setCondition(DEFAULT_VALUES.condition);
      setIsFoil(DEFAULT_VALUES.isFoil);
      setIsFirstEdition(DEFAULT_VALUES.isFirstEdition);
      setNotes(DEFAULT_VALUES.notes);
    }
  }, [isOpen, collections]);

  const handleAddToCollection = () => {
    if (!selectedCollection || !card) return;

    try {
      setIsLoading(true);

      // Instead of performing database operations here, we'll just pass the data to the parent component
      // which will handle the database operations

      // Prepare the card with wishlist_id if it exists
      const cardWithWishlistId = {
        ...card,
        wishlist_id: (card as any).wishlist_id,
      };

      // Notify the parent component
      onAddToCollection({
        card: cardWithWishlistId,
        collectionId: selectedCollection.id,
        quantity,
        condition,
        isFoil,
        isFirstEdition,
        notes,
      });

      // Clean up the form and close
      onClose();
    } catch (error) {
      console.error("Error preparing card data:", error);
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

  // Show message if no collections are available
  if (collections.length === 0) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={onClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("collection.addCard")}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-gray-600 mb-4">
              {t("collection.noCollectionsYet")}
            </p>
            <p className="text-sm text-gray-500">
              {t("collection.pleaseCreateDefault")}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
