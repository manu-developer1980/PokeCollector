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
  isDefault?: boolean;
}

const CollectionDialog = ({
  collection,
  isOpen,
  onClose,
  onSave,
  isDefault = false,
}: CollectionDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || "");
      setMakeDefault(collection.isDefault || false);
    } else {
      setName("");
      setDescription("");
      setMakeDefault(isDefault);
    }
  }, [collection, isDefault]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSave({
      id: collection?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      isDefault: makeDefault,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {collection ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="default"
              checked={makeDefault}
              onCheckedChange={(checked) => setMakeDefault(checked as boolean)}
              disabled={collection?.isDefault}
            />
            <Label htmlFor="default" className="text-sm cursor-pointer">
              Make this my default collection
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700"
          >
            {collection ? "Save Changes" : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDialog;
