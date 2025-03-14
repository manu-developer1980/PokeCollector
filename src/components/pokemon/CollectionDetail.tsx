import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collection, CollectionCard } from "@/types/pokemon";
import { Search, ArrowLeft, Edit } from "lucide-react";
import CardItem from "./CardItem";

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

      <div className="px-2 sm:px-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {filteredCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              onRemove={() => onRemoveCard(card.id)}
              actions="collection"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;
