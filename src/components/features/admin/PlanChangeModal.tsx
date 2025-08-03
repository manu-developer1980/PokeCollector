import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

interface PlanChangeModalProps {
  isOpen: boolean;
  message?: string;
}

export function PlanChangeModal({ 
  isOpen, 
  message = "Actualizando plan..." 
}: PlanChangeModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            {message}
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      </DialogContent>
    </Dialog>
  );
}