import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collection } from "@/types/pokemon";
import { Plus, Edit, Trash, Database, MoreVertical } from "lucide-react";
import LoadingSpinner from "../ui/LoaderSpinner";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CollectionListProps {
  collections: Collection[];
  selectedCollection?: Collection | null;
  onCollectionSelect: (collection: Collection) => void;
  onCreateCollection: () => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (collectionId: string) => void;
  isLoading?: boolean;
}

export default function CollectionList({
  collections,
  selectedCollection,
  onCollectionSelect,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  isLoading,
}: CollectionListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingSpinner message={t("common.loading")} />;
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          {t("collection.empty")}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t("collection.emptyDescription")}
        </p>
        <div className="mt-6">
          <Button onClick={onCreateCollection}>
            <Plus className="mr-2 h-4 w-4" />
            {t("collection.createFirst")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card
          key={collection.id}
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            selectedCollection?.id === collection.id
              ? "border-2 border-red-500"
              : ""
          }`}
          onClick={() => onCollectionSelect(collection)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {collection.name}
                  {collection.is_default && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {t("collection.default")}
                    </Badge>
                  )}
                </CardTitle>
                {collection.description && (
                  <CardDescription className="mt-1">
                    {collection.description}
                  </CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t("common.openMenu")}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCollection(collection);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCollection(collection.id);
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {collection.cards.length} {t("collection.cards")}
              </span>
              <span>
                {new Date(collection.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card
        className="cursor-pointer border-dashed border-2 hover:border-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
        onClick={onCreateCollection}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Plus className="h-12 w-12 text-gray-400" />
          <p className="mt-2 font-medium text-gray-900">
            {t("collection.create")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
