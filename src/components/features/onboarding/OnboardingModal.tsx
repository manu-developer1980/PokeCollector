import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import GetStartedGuide from "./GetStartedGuide";
import { useAuth } from "../../../../supabase/auth";
import { useTranslation } from "react-i18next";
import { useUserData } from "../../../hooks/useUserData";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userData, updateUserData, fetchUserData } = useUserData();
  const [shouldShowModal, setShouldShowModal] = useState(isOpen);

  useEffect(() => {
    if (user && isOpen) {
      checkOnboardingStatus();
    }
  }, [user, isOpen, fetchUserData]);

  const checkOnboardingStatus = async () => {
    if (!user?.id) return;

    try {
      // Usar el hook useUserData para obtener los datos del usuario
      const data = await fetchUserData();

      // Si tenemos datos, verificar si el usuario ha visto el onboarding
      if (data) {
        setShouldShowModal(!data.has_seen_onboarding);
      } else {
        // Si no hay datos, asumimos que el usuario necesita ver el onboarding
        setShouldShowModal(true);
      }
    } catch (error) {
      console.error(t("errors.generic"), error);
      // A pesar del error, asumimos que el usuario necesita ver el onboarding
      setShouldShowModal(true);
    }
  };

  const handleClose = async () => {
    if (!user?.id) {
      onClose();
      return;
    }

    try {
      // Actualizar el estado de onboarding usando el hook useUserData
      const result = await updateUserData({ has_seen_onboarding: true });

      if (!result.success) {
        console.error("Error al actualizar onboarding:", result.error);
      }
    } catch (error) {
      console.error(t("errors.generic"), error);
    } finally {
      setShouldShowModal(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={shouldShowModal}
      onOpenChange={() => handleClose()}
    >
      <DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("onboarding.title")}</DialogTitle>
          <DialogDescription>{t("onboarding.description")}</DialogDescription>
        </DialogHeader>
        <GetStartedGuide onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
