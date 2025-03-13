import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collection } from "@/types/pokemon";
import { Plus, Edit, Trash } from "lucide-react";

interface CollectionListProps {
  collections: Collection[];
  onSelectCollection: (collection: Collection) => void;
  onCreateCollection: () => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (collectionId: string) => void;
  selectedCollectionId?: string;
}

const CollectionList = ({
  collections = [],
  onSelectCollection = () => {},
  onCreateCollection = () => {},
  onEditCollection = () => {},
  onDeleteCollection = () => {},
  selectedCollectionId,
}: CollectionListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Collections</h2>
        <Button
          onClick={onCreateCollection}
          size="sm"
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-1" /> New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              You don't have any collections yet.
            </p>
            <Button
              onClick={onCreateCollection}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Create Your First Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCollectionId === collection.id ? "ring-2 ring-red-500" : ""}`}
              onClick={() => onSelectCollection(collection)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{collection.name}</CardTitle>
                  {collection.isDefault && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 text-xs"
                    >
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {collection.description || "No description"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {collection.cards?.length || 0} cards
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCollection(collection);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!collection.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCollection(collection.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionList;
