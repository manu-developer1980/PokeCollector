import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collection } from "@/types/pokemon";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("collection.noDefaultCollection")}</DialogTitle>
          <DialogDescription>
            {t("collection.defaultCollectionNeeded")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {existingCollections.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {t("collection.setExistingAsDefault")}
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
              {t("collection.noCollectionsYet")}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onCreateNew}
            className="bg-red-600 hover:bg-red-700"
          >
            {t("collection.createNew")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
