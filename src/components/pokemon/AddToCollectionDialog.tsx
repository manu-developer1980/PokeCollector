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
import { Collection, PokemonCard } from "@/types/pokemon";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";

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
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(collections[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("Near Mint");
  const [isFoil, setIsFoil] = useState(false);
  const [isFirstEdition, setIsFirstEdition] = useState(false);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCollection = async () => {
    if (!selectedCollection || !card) return;

    try {
      setIsLoading(true);

      const { data: existingCard, error: checkError } = await supabase
        .from("collection_cards")
        .select("*")
        .eq("collection_id", selectedCollection.id)
        .eq("card_id", card.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingCard) {
        // Actualizar cantidad si ya existe
        const { error: updateError } = await supabase
          .from("collection_cards")
          .update({ quantity: existingCard.quantity + quantity })
          .eq("id", existingCard.id);

        if (updateError) throw updateError;
      } else {
        // Insertar nueva carta
        const { error: insertError } = await supabase
          .from("collection_cards")
          .insert({
            collection_id: selectedCollection.id,
            card_id: card.id,
            quantity: quantity,
            condition: condition,
            is_foil: isFoil,
            is_first_edition: isFirstEdition,
            notes: notes,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "¡Éxito!",
        description: "Carta añadida a la colección correctamente",
      });
      onClose();
    } catch (error) {
      console.error("Error adding card to collection:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir la carta a la colección",
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
          <DialogTitle>Añadir a Colección</DialogTitle>
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
              <Label htmlFor="collection">Colección</Label>
              <Select
                value={selectedCollection?.id}
                onValueChange={(id) =>
                  setSelectedCollection(
                    collections.find((c) => c.id === id) || null
                  )
                }
              >
                <SelectTrigger id="collection">
                  <SelectValue placeholder="Seleccionar colección" />
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
              <Label htmlFor="quantity">Cantidad</Label>
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
                className="text-sm cursor-pointer"
              >
                Primera Edición
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Añade notas sobre esta carta..."
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
            Cancelar
          </Button>
          <Button
            onClick={handleAddToCollection}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? "Añadiendo..." : "Añadir a Colección"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;
