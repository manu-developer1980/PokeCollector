import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { CollectionCard } from "@/types/pokemon";
import { CONDITION_MAP, CardCondition } from "@/lib/constants";
import { useTranslation } from "react-i18next";

interface EditCardModalProps {
  card: CollectionCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: {
    id: string;
    quantity: number;
    condition?: string;
    is_foil?: boolean;
    is_first_edition?: boolean;
    notes?: string;
  }) => void;
}

const EditCardModal = ({
  card,
  isOpen,
  onClose,
  onSave,
}: EditCardModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<CardCondition>("nearMint");
  const [isFoil, setIsFoil] = useState(false);
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [notes, setNotes] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (card) {
      setQuantity(card.quantity);
      setCondition((card.condition as CardCondition) || "nearMint");
      setIsFoil(card.is_foil || false);
      setIsFirstEdition(card.is_first_edition || false);
      setNotes(card.notes || "");
    }
  }, [card, isOpen]);

  const handleSubmit = () => {
    if (!card) return;

    // Asegurarnos de usar el ID correcto de collection_cards
    const collectionCardId = (card as CollectionCard).id;

    onSave({
      id: collectionCardId, // Usar el ID correcto de collection_cards
      quantity,
      condition,
      is_foil: isFoil,
      is_first_edition: isFirstEdition,
      notes: notes,
    });

    onClose();
  };

  if (!card) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("card.edit")} - {card.name}
          </DialogTitle>
          <DialogDescription>{t("card.editDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">{t("card.quantity")}</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="condition">{t("card.condition")}</Label>
              <Select
                value={condition}
                onValueChange={(value) => setCondition(value as CardCondition)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_MAP).map(([key, value]) => (
                    <SelectItem
                      key={key}
                      value={key}
                    >
                      {t(`cardConditions.${key.toLowerCase()}`, {
                        defaultValue: value,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="foil"
                checked={isFoil}
                onCheckedChange={(checked) => setIsFoil(checked as boolean)}
              />
              <Label
                htmlFor="foil"
                className="text-sm"
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
                className="text-sm"
              >
                {t("card.firstEdition")}
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{t("card.notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20"
              placeholder={t("card.notesPlaceholder")}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("common.save")}
            </Button>
            <div className="space-x-2"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCardModal;
