import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collection } from '@/types/collection';

interface NoDefaultCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onSetDefault: (collection: Collection) => void;
  existingCollections: Collection[];
}

export const NoDefaultCollectionDialog = ({
  isOpen,
  onClose,
  onCreateNew,
  onSetDefault,
  existingCollections,
}: NoDefaultCollectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>No hay colección predeterminada</DialogTitle>
          <DialogDescription>
            Para usar la función de añadir rápido, necesitas tener una colección predeterminada.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {existingCollections.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Puedes establecer una de tus colecciones existentes como predeterminada:
              </p>
              <div className="space-y-2">
                {existingCollections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => onSetDefault(collection)}
                  >
                    {collection.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No tienes ninguna colección. Crea una nueva para empezar.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={onCreateNew}
            className="bg-red-600 hover:bg-red-700"
          >
            Crear Nueva Colección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};