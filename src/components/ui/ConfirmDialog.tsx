import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import LoadingSpinner from "./LoaderSpinner";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  showCancel?: boolean;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isLoading = false,
  loadingMessage,
  showCancel = true,
  confirmVariant = "default",
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isLoading && !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {isLoading ? (
            <div className="w-full flex justify-center items-center py-2">
              <LoadingSpinner message={loadingMessage || t("common.processing")} />
            </div>
          ) : (
            <>
              {showCancel && (
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  {cancelText || t("common.cancel")}
                </Button>
              )}
              <Button
                onClick={handleConfirm}
                variant={confirmVariant}
              >
                {confirmText || t("common.confirm")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
