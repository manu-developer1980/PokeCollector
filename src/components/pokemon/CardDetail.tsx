import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PokemonCard } from "@/types/pokemon";

interface CardDetailProps {
  card: PokemonCard;
  isOpen: boolean;
  onClose: () => void;
}

const CardDetail = ({ card, isOpen, onClose }: CardDetailProps) => {
  // Verificar si la carta existe
  if (!card) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={onClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              No se pudo cargar la información de la carta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Función para renderizar los botones del footer
  const renderFooterButtons = () => {
    return (
      <>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cerrar
        </Button>
        <Button onClick={() => console.log("Añadir a colección", card.id)}>
          Añadir a colección
        </Button>
      </>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{card.name || "Carta sin nombre"}</DialogTitle>
          <DialogDescription>
            {card.set
              ? `${card.set.name} - ${card.number || "?"}/${
                  card.set.printedTotal || "?"
                }`
              : "Información no disponible"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-center">
            <img
              src={card.images?.large || "/placeholder-card.png"}
              alt={card.name || "Carta Pokémon"}
              className="rounded-lg max-h-96 object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Detalles</h3>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Tipo:</dt>
                <dd>{card.types?.join(", ") || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium">Rareza:</dt>
                <dd>{card.rarity || "N/A"}</dd>
              </div>
              {card.tcgplayer?.prices && (
                <div>
                  <dt className="font-medium">Precio:</dt>
                  <dd>
                    {Object.entries(card.tcgplayer.prices).map(
                      ([key, value]) => (
                        <div key={key}>
                          {key}: ${value.market || value.mid || "N/A"}
                        </div>
                      )
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <DialogFooter>{renderFooterButtons()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetail;
