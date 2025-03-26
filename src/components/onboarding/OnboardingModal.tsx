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
          const { error: insertError } = await supabase
            .from("users")
            .insert([{ id: user.id, has_seen_onboarding: false }]);

          if (insertError) throw insertError;
          setShouldShowModal(true);
        } else {
          throw error;
        }
      } else {
        setShouldShowModal(!data?.has_seen_onboarding);
      }
    } catch (error) {
      console.error(t("errors.generic"), error);
    }
  };

  const handleClose = async () => {
    if (!user?.id) {
      onClose();
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ has_seen_onboarding: true })
        .eq("id", user.id);

      if (error) throw error;
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
