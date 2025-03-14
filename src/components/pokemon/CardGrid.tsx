import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Heart, Loader2 } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { PokemonCard } from "@/types/pokemon";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: PokemonCard[];
  loading?: boolean;
  error?: string;
  onCardClick?: (card: PokemonCard) => void;
  onQuickAdd?: (card: PokemonCard) => void;
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="text-center text-red-600 p-4">
      <p>Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}

const CardGrid = ({
  cards,
  loading,
  error,
  onCardClick,
  onQuickAdd,
}: CardGridProps) => {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="pokeball mb-4"></div>
        <span className="text-blue-500 font-medium animate-pulse">
          ¡Lanzando Pokéball...!
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading cards: {error}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No se encontraron cartas que coincidan con tu búsqueda
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="px-2 sm:px-4">
        <div className="flex flex-wrap justify-center gap-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              className="relative group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-2 border-transparent hover:border-primary/20"
            >
              <CardItem
                key={card.id}
                card={card}
                onClick={onCardClick}
                onQuickAdd={onQuickAdd}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-secondary/90 hover:bg-secondary text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWishlist(card);
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-primary/90 hover:bg-primary text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCollection(card);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CardGrid;
