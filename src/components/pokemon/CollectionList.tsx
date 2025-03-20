import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collection } from "@/types/pokemon";
import { Plus, Edit, Trash } from "lucide-react";

interface CollectionListProps {
  collections: Collection[];
  selectedCollection?: Collection | null;
  onCollectionSelect: (collection: Collection) => void;
  onCreateCollection: () => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (collectionId: string) => void;
  showCreateButton?: boolean;
  isLoading?: boolean;
}

const CollectionList = ({
  collections,
  selectedCollection,
  onCollectionSelect,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  isLoading,
}: CollectionListProps) => {
  const showCreateButton = collections.length > 0 || isLoading;

  return (
    <div className="space-y-4">
      {!isLoading && collections.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              No tienes colecciones aún. ¡Crea tu primera colección para empezar
              a guardar tus cartas!
            </p>
            <Button
              onClick={onCreateCollection}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Crear Mi Primera Colección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className={`hover:shadow-md transition-shadow ${
                selectedCollection?.id === collection.id
                  ? "ring-2 ring-red-500"
                  : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div
                    className="cursor-pointer flex-grow"
                    onClick={() => onCollectionSelect(collection)}
                  >
                    <CardTitle className="text-base">
                      {collection.name}
                    </CardTitle>
                    {collection.is_default && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs"
                      >
                        Predeterminada
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCollection(collection);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!collection.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCollection(collection.id);
                        }}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {collection.description || "Sin descripción"}
                </p>
                <p className="text-sm text-gray-500">
                  Cartas: {collection.cards?.length || 0}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionList;
