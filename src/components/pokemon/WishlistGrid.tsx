import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PokemonCard } from "@/types/pokemon";
import CardGrid from "./CardGrid";

interface WishlistGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onRemove: (card: PokemonCard) => void;
  onQuickAdd: (card: PokemonCard) => void;
  isLoading?: boolean; // Añadimos esta prop
}

const WishlistGrid = ({ 
  cards, 
  onCardClick, 
  onRemove,
  onQuickAdd,
  isLoading = false // Valor por defecto
}: WishlistGridProps) => {
  if (isLoading) {
    return (
      <div className="fixed top-[4rem] left-[calc(256px+24px)] right-6 bottom-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center justify-center">
          <div className="pokeball mb-4" />
          <p className="text-base font-bold text-muted-foreground animate-pulse">
            Cargando lista de deseos...
          </p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">
            Tu lista de deseos está vacía. ¡Comienza a añadir las cartas que
            deseas conseguir!
          </p>
          <Link
            to="/dashboard"
            state={{ activeSection: "Search Cards" }}
          >
            <Button className="bg-red-600 hover:bg-red-700">
              <Search className="h-4 w-4 mr-1" /> Buscar Cartas
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <CardGrid
      cards={cards}
      onCardClick={onCardClick}
      onAddToCollection={onQuickAdd}
      onRemove={onRemove}
      actions="wishlist"
    />
  );
};

export default WishlistGrid;
