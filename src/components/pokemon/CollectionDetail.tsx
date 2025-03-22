import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collection, CollectionCard } from "@/types/pokemon";
import { Search, ArrowLeft, Edit, X } from "lucide-react";
import { navigateToSearch } from "@/lib/navigation";
import CardGrid from "./CardGrid";
import LoadingSpinner from "../ui/LoaderSpinner";

interface CollectionDetailProps {
  collection: Collection;
  onBack: () => void;
  onEdit: (collection: Collection) => void;
  onRemove: (cardId: string) => void;
  onCardClick: (card: CollectionCard) => void;
  isLoading?: boolean;
}

const CollectionDetail = ({
  collection,
  onBack,
  onEdit,
  onRemove,
  onCardClick,
  isLoading = false,
}: CollectionDetailProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCards = useMemo(() => {
    if (!collection.cards) return [];
    return collection.cards.filter((card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [collection.cards, searchTerm]);

  if (!collection.cards || collection.cards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <Button
              variant="ghost"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h2 className="text-2xl font-bold">{collection.name}</h2>
            {collection.is_default && (
              <Badge variant="secondary">Predeterminada</Badge>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => onEdit(collection)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Colección
          </Button>
        </div>

        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              Esta colección está vacía. ¡Comienza a añadir cartas desde el
              buscador!
            </p>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => navigateToSearch()}
            >
              <Search className="h-4 w-4 mr-1" /> Buscar Cartas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {isLoading && <LoadingSpinner message="Cargando colección..." />}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-wrap">
          <Button
            variant="ghost"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-2xl font-bold">{collection.name}</h2>
          {collection.is_default && (
            <Badge variant="secondary">Predeterminada</Badge>
          )}
          <Badge variant="collection">
            {collection.cards?.length || 0} cartas
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => onEdit(collection)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Colección
        </Button>
      </div>

      {collection.description && (
        <p className="text-gray-600">{collection.description}</p>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar cartas en esta colección"
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Separator />

      {filteredCards.length > 0 ? (
        <CardGrid
          cards={filteredCards}
          onCardClick={onCardClick}
          onRemove={onRemove}
          actions="collection"
          showPrice={false}
        />
      ) : (
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              No se encontraron cartas que coincidan con tu búsqueda.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar búsqueda
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollectionDetail;
