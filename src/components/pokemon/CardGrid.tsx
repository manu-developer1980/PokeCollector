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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cards...</span>
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
    return <div className="text-center text-gray-500 p-4">No cards found</div>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onClick={onCardClick}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default CardGrid;
