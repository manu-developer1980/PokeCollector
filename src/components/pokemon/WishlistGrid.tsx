import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import CardGrid from "./CardGrid";
import LoadingSpinner from "../ui/LoaderSpinner";
import type { PokemonCard } from "@/types/pokemon";
import { useTranslation } from "react-i18next";

interface WishlistGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onQuickAdd?: (card: PokemonCard) => void;
  onRemove?: (card: PokemonCard) => void;
  isLoading?: boolean;
  onSectionChange: (section: string) => void;
}

const WishlistGrid = ({
  cards,
  onCardClick,
  onQuickAdd,
  onRemove,
  isLoading,
  onSectionChange,
}: WishlistGridProps) => {
  const { t } = useTranslation();

  const handleSearchClick = () => {
    // Usamos el ID de sección "Search Cards" que es el que espera la aplicación
    // Este ID se usa en toda la aplicación para identificar la sección de búsqueda
    onSectionChange("Search Cards");
  };

  if (isLoading) {
    return <LoadingSpinner message={t("wishlist.loading")} />;
  }

  if (!cards || cards.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">
            {t("wishlist.empty")} {t("wishlist.emptyDescription")}
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSearchClick}
          >
            <Search className="h-4 w-4 mr-1" /> {t("wishlist.searchCards")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="mt-8 space-y-6 w-full">
        <CardGrid
          cards={cards}
          onCardClick={(card) => {
            // Asegurarse de que la carta tenga la propiedad wishlist_id
            const cardWithWishlistId = {
              ...card,
              wishlist_id: (card as any).wishlist_id,
            };
            onCardClick(cardWithWishlistId);
          }}
          onQuickAdd={(card) => {
            // Asegurarse de que la carta tenga la propiedad wishlist_id
            const cardWithWishlistId = {
              ...card,
              wishlist_id: (card as any).wishlist_id,
            };
            onQuickAdd?.(cardWithWishlistId);
          }}
          onRemove={(cardId) => {
            // Find the card by ID and pass it to onRemove
            const card = cards.find(c => c.id === cardId);
            if (card && onRemove) {
              onRemove(card);
            }
          }}
          actions="wishlist"
        />
      </div>
    </div>
  );
};

export default WishlistGrid;
