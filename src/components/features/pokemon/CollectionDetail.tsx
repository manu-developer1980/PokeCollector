import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Search, X } from "lucide-react";
import { Collection, CollectionCard } from "@/types/pokemon";
import { useState, useMemo } from "react";
import CardGrid from "./CardGrid";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CollectionDetailProps {
  collection: Collection;
  onBack: () => void;
  onEdit: (collection: Collection) => void;
  onRemove: (cardId: string) => void;
  onCardClick: (card: CollectionCard) => void;
  isLoading?: boolean;
  onSectionChange: (section: string) => void;
}

const CollectionDetail = ({
  collection,
  onBack,
  onEdit,
  onRemove,
  onCardClick,
  isLoading = false,
  onSectionChange,
}: CollectionDetailProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCards = useMemo(() => {
    if (!collection.cards) return [];
    return collection.cards
      .filter((card) =>
        card.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((collectionCard) => ({
        id: collectionCard.card_id,
        name: collectionCard.name || 'Unknown Card',
        number: collectionCard.set?.id || '',
        images: collectionCard.images || { small: '', large: '' },
        set: {
          name: collectionCard.set?.name || 'Unknown Set',
          printedTotal: 0
        },
        quantity: collectionCard.quantity,
        condition: collectionCard.condition,
        isFirstEdition: collectionCard.is_first_edition,
        isFoil: collectionCard.is_foil,
        notes: collectionCard.notes,
        collection_card_id: collectionCard.id // Store original ID for removal
      }));
  }, [collection.cards, searchTerm]);

  const handleSearchClick = () => {
    onSectionChange("Search Cards");
  };

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
              {t("common.back")}
            </Button>
            <h2 className="text-2xl font-bold">{collection.name}</h2>
            {collection.is_default && (
              <Badge variant="secondary">{t("collection.default")}</Badge>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => onEdit(collection)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("collection.edit")}
          </Button>
        </div>

        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              {t("collection.emptyDescription")}
            </p>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSearchClick}
            >
              <Search className="h-4 w-4 mr-1" /> {t("search.searchCards")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {isLoading && <LoadingSpinner message={t("collection.loading")} />}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-wrap">
          <Button
            variant="ghost"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
          <h2 className="text-2xl font-bold">{collection.name}</h2>
          {collection.is_default && (
            <Badge variant="secondary">{t("collection.default")}</Badge>
          )}
          <Badge variant="collection">
            {collection.cards?.length || 0} {t("collection.cards")}
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => onEdit(collection)}
        >
          <Edit className="h-4 w-4 mr-2" />
          {t("collection.edit")}
        </Button>
      </div>

      {collection.description && (
        <p className="text-gray-600">{collection.description}</p>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder={t("collection.searchInCollection")}
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Separator />

      {filteredCards.length > 0 ? (
        <CardGrid
          cards={filteredCards}
          onCardClick={(card) => {
            // Find the original CollectionCard
            const originalCard = collection.cards?.find(c => c.card_id === card.id);
            if (originalCard) {
              onCardClick(originalCard);
            }
          }}
          onRemove={(cardId) => {
            // Find the collection card ID from the transformed card
            const transformedCard = filteredCards.find(c => c.id === cardId);
            if (transformedCard && (transformedCard as any).collection_card_id) {
              onRemove((transformedCard as any).collection_card_id);
            }
          }}
          actions="collection"
          showPrice={false}
        />
      ) : (
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              {t("collection.noSearchResults")}
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              {t("search.clearFilters")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollectionDetail;
