import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface EditCardModalProps {
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

const EditCardModal = ({
  card,
  isOpen,
  onClose,
  onUpdate,
  onRemove,
}: EditCardModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<CardCondition>("Near Mint");
  const [isFoil, setIsFoil] = useState(false);
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && card) {
      setQuantity(card.quantity);
      setCondition((card.condition as CardCondition) || "Near Mint");
      setIsFoil(card.is_foil || false);
      setIsFirstEdition(card.is_first_edition || false);
      setNotes(card.notes || "");
    }
  }, [card, isOpen]);

  const handleSubmit = () => {
    if (!card) return;

    onUpdate({
      id: card.id,
      quantity,
      condition,
      isFoil,
      isFirstEdition,
      notes,
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
          <DialogTitle>Editar Carta - {card.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="condition">Condición</Label>
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
                      {value}
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
                Foil/Holo
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
                Primera Edición
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20"
              placeholder="Añade notas sobre la carta..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              Guardar Cambios
            </Button>
            <div className="space-x-2"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCardModal;
