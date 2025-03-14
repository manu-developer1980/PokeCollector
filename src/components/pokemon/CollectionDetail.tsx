import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collection, CollectionCard } from "@/types/pokemon";
import { Search, ArrowLeft, Edit, Trash } from "lucide-react";

interface CollectionDetailProps {
  collection: Collection;
  onBack: () => void;
  onEditCollection: (collection: Collection) => void;
  onRemoveCard: (cardId: string) => void;
  onCardClick: (card: CollectionCard) => void;
}

const CollectionDetail = ({
  collection,
  onBack,
  onEditCollection,
  onRemoveCard,
  onCardClick,
}: CollectionDetailProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCards =
    collection.cards?.filter((card) =>
      card.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">{collection.name}</h2>
          {collection.is_default && (
            <Badge variant="secondary">Default Collection</Badge>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => onEditCollection(collection)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Collection
        </Button>
      </div>

      {collection.description && (
        <p className="text-gray-600">{collection.description}</p>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search cards in this collection"
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Collection Stats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Total Cards</div>
              <div className="text-2xl font-bold">
                {collection.cards?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-4">Cards in Collection</h3>
        {filteredCards.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {searchTerm
                ? "No cards match your search"
                : "No cards in this collection yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="relative"
              >
                <Card
                  className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
                  onClick={() => onCardClick(card)}
                >
                  <div className="aspect-[0.716] relative">
                    {card.images?.small && (
                      <img
                        src={card.images.small}
                        alt={card.name || "Pokemon Card"}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm truncate">
                      {card.name || "Unnamed Card"}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1">
                      {card.set && <p className="truncate">{card.set}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          Qty: {card.quantity || 1}
                        </Badge>
                        {card.is_foil && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            Foil
                          </Badge>
                        )}
                        {card.is_first_edition && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            1st Ed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute bottom-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCard(card.id);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetail;
