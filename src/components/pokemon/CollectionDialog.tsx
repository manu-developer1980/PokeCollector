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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collection } from "@/types/pokemon";

interface CollectionDialogProps {
  collection?: Collection;
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Partial<Collection>) => void;
  collections: Collection[];
}

const CollectionDialog = ({
  collection,
  isOpen,
  onClose,
  onSave,
  collections,
}: CollectionDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || "");
      setMakeDefault(collection.is_default || false);
    } else {
      setName("");
      setDescription("");
      setMakeDefault(false);
    }
  }, [collection]);

  // Verificar si ya existe una colección predeterminada
  const hasDefaultCollection = collections?.some(
    (c) => c.is_default && c.id !== collection?.id
  );

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSave({
      id: collection?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      isDefault: makeDefault,
    });

    // Cerramos el modal después de guardar
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {collection ? "Editar Colección" : "Crear Colección"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Colección</Label>
            <Input
              id="name"
              placeholder="Mi Colección Increíble"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe tu colección..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={makeDefault}
              onCheckedChange={(checked) => setMakeDefault(checked as boolean)}
              disabled={hasDefaultCollection && !collection?.is_default}
            />
            <Label
              htmlFor="isDefault"
              className={`text-sm cursor-pointer ${
                hasDefaultCollection && !collection?.is_default
                  ? "text-gray-400"
                  : ""
              }`}
            >
              Establecer como colección predeterminada
            </Label>
          </div>
          {hasDefaultCollection && !collection?.is_default && (
            <p className="text-xs text-amber-600">
              Ya existe una colección predeterminada. Debes desmarcar la
              colección predeterminada actual antes de establecer otra.
            </p>
          )}
        </div>

        <DialogFooter>
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
            {collection ? "Guardar Cambios" : "Crear Colección"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDialog;
