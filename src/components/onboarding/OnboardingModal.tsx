import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import GetStartedGuide from "./GetStartedGuide";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useTranslation } from "react-i18next";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(isOpen);

  useEffect(() => {
    if (user && isOpen) {
      checkOnboardingStatus();
    }
  }, [user, isOpen]);

  const checkOnboardingStatus = async () => {
    if (!user?.id) return;

    try {
      let { data, error } = await supabase
        .from("users")
        .select("has_seen_onboarding")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // El usuario no existe en la tabla users, intentamos crearlo
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || "Usuario",
              has_seen_onboarding: false,
              preferred_lang: user.user_metadata?.preferred_lang || "es",
            },
          ]);

          if (insertError) {
            console.error("Error al insertar usuario:", insertError);
            // A pesar del error, asumimos que el usuario necesita ver el onboarding
            setShouldShowModal(true);
            return;
          }
          setShouldShowModal(true);
        } else {
          console.error("Error al verificar onboarding:", error);
          // A pesar del error, asumimos que el usuario necesita ver el onboarding
          setShouldShowModal(true);
        }
      } else {
        setShouldShowModal(!data?.has_seen_onboarding);
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
      // Primero verificamos si el usuario existe
      const { data, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error al verificar usuario:", checkError);
      }

      // Si el usuario no existe, lo creamos
      if (!data) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "Usuario",
            has_seen_onboarding: true,
            preferred_lang: user.user_metadata?.preferred_lang || "es",
          },
        ]);

        if (insertError) {
          console.error("Error al insertar usuario:", insertError);
        }
      } else {
        // Si el usuario existe, actualizamos has_seen_onboarding
        const { error: updateError } = await supabase
          .from("users")
          .update({ has_seen_onboarding: true })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error al actualizar onboarding:", updateError);
        }
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
