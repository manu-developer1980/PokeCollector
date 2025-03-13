import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("has_seen_onboarding")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setHasSeenOnboarding(data?.has_seen_onboarding || false);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const handleClose = async () => {
    try {
      if (user) {
        // Update user's onboarding status
        await supabase
          .from("users")
          .update({ has_seen_onboarding: true })
          .eq("user_id", user.id);
      }
      onClose();
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen && !hasSeenOnboarding} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none shadow-none">
        <GetStartedGuide onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
