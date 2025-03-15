import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PokemonCard } from "@/types/pokemon";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: PokemonCard[];
  loading?: boolean;
  error?: string;
  onCardClick?: (card: PokemonCard) => void;
  onQuickAdd?: (card: PokemonCard) => void;
  onAddToWishlist?: (card: PokemonCard) => void;
  actions?: "search" | "collection" | "wishlist";
}

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="text-center text-red-600 p-4">
      <p>Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
    </div>
  );
};

const CardGrid = ({
  cards,
  loading,
  error,
  onCardClick,
  onQuickAdd,
  onAddToWishlist,
  actions = "search",
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

  if (!cards?.length) {
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
        <div className="flex flex-wrap gap-4 justify-center">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick?.(card)}
              onQuickAdd={() => onQuickAdd?.(card)}
              onAddToWishlist={() => onAddToWishlist?.(card)}
              actions={actions}
              showPrice={actions === "search"}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CardGrid;
