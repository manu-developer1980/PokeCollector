import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CollectionCard } from "@/types/pokemon";
import { Trash } from "lucide-react";

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
  const [quantity, setQuantity] = useState(card?.quantity || 1);
  const [condition, setCondition] = useState(card?.condition || "Near Mint");
  const [isFoil, setIsFoil] = useState(card?.isFoil || false);
  const [isFirstEdition, setIsFirstEdition] = useState(
    card?.isFirstEdition || false,
  );
  const [notes, setNotes] = useState(card?.notes || "");

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
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
              {card.rarity && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {card.rarity}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mint">Mint</SelectItem>
                <SelectItem value="Near Mint">Near Mint</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Light Played">Light Played</SelectItem>
                <SelectItem value="Played">Played</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
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
              <Label htmlFor="foil" className="text-sm cursor-pointer">
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
              <Label htmlFor="firstEdition" className="text-sm cursor-pointer">
                First Edition
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this card..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onRemove(card.id)}
            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="h-4 w-4" /> Remove
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailDialog;
