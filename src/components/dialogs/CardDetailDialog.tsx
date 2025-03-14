import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CardDetailDialog({
  isOpen,
  onClose,
  card,
  // ... otros props
}) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent
        className="max-w-3xl"
        aria-describedby="card-detail-description"
      >
        <DialogHeader>
          <DialogTitle>{card?.name}</DialogTitle>
        </DialogHeader>
        <p
          id="card-detail-description"
          className="sr-only"
        >
          Detalles de la carta Pokémon {card?.name}
        </p>

        {/* Resto del contenido del diálogo */}
      </DialogContent>
    </Dialog>
  );
}
