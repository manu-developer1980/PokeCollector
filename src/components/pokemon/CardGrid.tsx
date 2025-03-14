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
      <p>Algo salió mal:</p>
      <pre className="text-sm">{error.message}</pre>
      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
        onClick={resetErrorBoundary}
      >
        Intentar de nuevo
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-blue-500 font-medium">
          Capturando Pokémon...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-xl border-2 border-red-200">
        <div className="text-red-600 font-medium">
          ¡El Team Rocket se interpuso en el camino!
        </div>
        <div className="text-red-500 text-sm mt-2">{error}</div>
      </div>
    );
  }

  if (!cards?.length) {
    return (
      <div className="text-center p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <div className="text-yellow-600 font-medium">
          ¡No se encontraron Pokémon en esta área!
        </div>
        <div className="text-yellow-500 text-sm mt-2">
          Intenta buscar en otra ubicación
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="text-center p-6 bg-red-50 rounded-xl border-2 border-red-200">
          <div className="text-red-600 font-medium">
            ¡Ha aparecido un error salvaje!
          </div>
          <div className="text-red-500 text-sm mt-2">{error.message}</div>
          <button
            onClick={resetErrorBoundary}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    >
      <div className="px-2 sm:px-4 relative">
        <div className="flex flex-wrap gap-4 justify-center">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={onCardClick}
              onQuickAdd={onQuickAdd}
              fallbackImage="/placeholder-card.png"
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CardGrid;
