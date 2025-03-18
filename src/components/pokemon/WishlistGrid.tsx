import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Añadimos useNavigate
import { PokemonCard } from "@/types/pokemon";

interface WishlistGridProps {
  cards: PokemonCard[];
  onCardClick: (card: PokemonCard) => void;
  onRemove: (card: PokemonCard) => void;
  onQuickAdd: (card: PokemonCard) => void;
  isLoading?: boolean;
}

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center py-12">
    <div className="flex flex-col items-center">
      <div className="pokeball mb-4" />
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  </div>
);

const WishlistGrid = ({
  cards,
  onCardClick,
  onRemove,
  onQuickAdd,
  isLoading = false,
}: WishlistGridProps) => {
  const navigate = useNavigate();

  const handleNavigateToSearch = () => {
    navigate("/dashboard", {
      replace: true, // Usar replace para evitar problemas con el historial
      state: { activeSection: "Search Cards" },
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando lista de deseos..." />;
  }

  if (!cards || cards.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">
            Tu lista de deseos está vacía. ¡Comienza a añadir las cartas que
            deseas conseguir!
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleNavigateToSearch}
          >
            <Search className="h-4 w-4 mr-1" /> Buscar Cartas
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card
          key={card.wishlist_id}
          className="relative group"
        >
          <CardContent className="p-2">
            <div className="relative">
              <img
                src={card.images.small}
                alt={card.name}
                className="w-full h-auto rounded cursor-pointer"
                onClick={() => onCardClick(card)}
              />
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(card)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onQuickAdd(card)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WishlistGrid;
