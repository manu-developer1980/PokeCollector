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

  console.log("WishlistGrid cards:", cards);
  const handleSearchClick = () => {
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
            Tu lista de deseos está vacía. ¡Comienza a añadir cartas desde el
            buscador!
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSearchClick}
          >
            <Search className="h-4 w-4 mr-1" /> Buscar Cartas
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
            console.log("WishlistGrid onCardClick with card:", card);
            // Asegurarse de que la carta tenga la propiedad wishlist_id
            const cardWithWishlistId = {
              ...card,
              wishlist_id: (card as any).wishlist_id,
            };
            onCardClick(cardWithWishlistId);
          }}
          onQuickAdd={(card) => {
            console.log("WishlistGrid onQuickAdd with card:", card);
            // Asegurarse de que la carta tenga la propiedad wishlist_id
            const cardWithWishlistId = {
              ...card,
              wishlist_id: (card as any).wishlist_id,
            };
            onQuickAdd?.(cardWithWishlistId);
          }}
          onRemove={onRemove}
          actions="wishlist"
        />
      </div>
    </div>
  );
};

export default WishlistGrid;
