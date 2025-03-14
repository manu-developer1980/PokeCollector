import React, { useState, useEffect } from "react";
import { getPokemonCard } from "@/lib/pokemon-api";
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
import { CollectionCard, PokemonCard } from "@/types/pokemon";
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
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("Near Mint");
  const [isFoil, setIsFoil] = useState(false);
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [notes, setNotes] = useState("");
  const [cardDetails, setCardDetails] = useState<PokemonCard | null>(null);

  useEffect(() => {
    const loadCardDetails = async () => {
      if (card) {
        try {
          const details = await getPokemonCard(card.card_id);
          setCardDetails(details);
        } catch (error) {
          console.error("Error loading card details:", error);
        }
      }
    };

    if (isOpen && card) {
      loadCardDetails();
      setQuantity(card.quantity);
      setCondition(card.condition || "Near Mint");
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

  if (!card || !cardDetails) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Carta</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Columna izquierda - Imagen y botón eliminar */}
          <div className="flex flex-col">
            <div className="flex justify-center flex-grow">
              <img
                src={cardDetails.images.large || cardDetails.images.small}
                alt={cardDetails.name}
                className="rounded-lg h-[500px] object-contain"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => onRemove(card.id)}
              className="mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4 mr-2" /> Eliminar
            </Button>
          </div>

          {/* Columna derecha - Información y formulario */}
          <div className="space-y-4">
            {/* Información básica */}
            <div>
              <h3 className="font-medium text-lg">{cardDetails.name}</h3>
              <p className="text-sm text-gray-500">
                {cardDetails.set.name} · {cardDetails.number}/
                {cardDetails.set.printedTotal}
              </p>
              {cardDetails.rarity && (
                <Badge
                  variant="outline"
                  className="mt-1"
                >
                  {cardDetails.rarity}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Detalles de la carta en formato grid compacto */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-gray-500">Tipo:</div>
              <div>{cardDetails.types?.join(", ") || "N/A"}</div>

              <div className="text-gray-500">PS:</div>
              <div>{cardDetails.hp || "N/A"}</div>

              <div className="text-gray-500">Supertipo:</div>
              <div>{cardDetails.supertype}</div>

              <div className="text-gray-500">Subtipos:</div>
              <div>{cardDetails.subtypes?.join(", ") || "N/A"}</div>

              {cardDetails.tcgplayer?.prices && (
                <>
                  <div className="text-gray-500">Precio:</div>
                  <div>
                    {Object.entries(cardDetails.tcgplayer.prices).map(
                      ([key, value]) => (
                        <div key={key}>
                          {key}: ${value?.market?.toFixed(2) || "N/A"}
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {cardDetails.rules && cardDetails.rules.length > 0 && (
              <div className="text-sm">
                <h4 className="font-medium mb-1">Reglas</h4>
                <div className="text-gray-700">
                  {cardDetails.rules.map((rule, index) => (
                    <p
                      key={index}
                      className="mb-1"
                    >
                      {rule}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Formulario en formato más compacto */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="condition">Estado</Label>
                <Select
                  value={condition}
                  onValueChange={setCondition}
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mint">Perfecta</SelectItem>
                    <SelectItem value="Near Mint">Casi Perfecta</SelectItem>
                    <SelectItem value="Excellent">Excelente</SelectItem>
                    <SelectItem value="Good">Buena</SelectItem>
                    <SelectItem value="Light Played">Poco Usada</SelectItem>
                    <SelectItem value="Played">Usada</SelectItem>
                    <SelectItem value="Poor">Deteriorada</SelectItem>
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
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end pt-4 space-x-2">
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailDialog;
