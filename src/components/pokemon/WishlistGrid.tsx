import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToSearch } from "@/lib/navigation";
import CardGrid from "./CardGrid";
import { useState } from "react";
import type { PokemonCard } from "@/types/pokemon";
import LoadingSpinner from "../ui/LoaderSpinner";

interface WishlistGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onQuickAdd?: (card: PokemonCard) => void;
  onRemove?: (card: PokemonCard) => void;
  isLoading?: boolean;
}

const WishlistGrid = ({
  cards,
  onCardClick,
  onQuickAdd,
  onRemove,
  isLoading,
}: WishlistGridProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner message="Cargando lista de deseos..." />;
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
            onClick={() => navigateToSearch(navigate)}
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
          onCardClick={onCardClick}
          onQuickAdd={onQuickAdd}
          onRemove={onRemove}
          actions="wishlist"
        />
      </div>
    </div>
  );
};

export default WishlistGrid;
