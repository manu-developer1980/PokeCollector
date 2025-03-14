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

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const { user } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      checkOnboardingStatus();
    }
  }, [user, isOpen]);

  const checkOnboardingStatus = async () => {
    if (!user?.id) return;

    try {
      console.log("Checking onboarding status for user:", user.id);

      let { data, error } = await supabase
        .from("users")
        .select("has_seen_onboarding")
        .eq("id", user.id)
        .single();

      if (error) {
        // Si no existe el registro, lo creamos
        if (error.code === "PGRST116") {
          const { error: insertError } = await supabase
            .from("users")
            .insert({ id: user.id, has_seen_onboarding: false })
            .single();

          if (insertError) throw insertError;
          data = { has_seen_onboarding: false };
        } else {
          throw error;
        }
      }

      console.log("Onboarding data:", data);
      setShouldShowModal(!data?.has_seen_onboarding);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setShouldShowModal(false);
    }
  };

  const handleClose = async () => {
    console.log("handleClose called");
    if (!user?.id) {
      console.log("No user found");
      onClose();
      return;
    }

    try {
      console.log("Updating onboarding status for user:", user.id);

      // Primero intentamos actualizar
      const { error: updateError } = await supabase
        .from("users")
        .update({
          has_seen_onboarding: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating:", updateError);
        throw updateError;
      }

      console.log("Onboarding status updated successfully");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
    } finally {
      setShouldShowModal(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={shouldShowModal}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange:", open);
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none shadow-none">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Guía de inicio - PokéCollector
          </DialogTitle>
          <DialogDescription className="sr-only">
            Guía interactiva para comenzar a usar PokéCollector y gestionar tu
            colección de cartas Pokémon
          </DialogDescription>
        </DialogHeader>
        <GetStartedGuide onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
