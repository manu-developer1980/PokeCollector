import React from "react";
import { useTranslation } from "react-i18next";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieCategory } from "@/contexts/CookieConsentContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CookiePolicy: React.FC = () => {
  const { t } = useTranslation();
  const {
    consentState,
    updateConsent,
    acceptAll,
    rejectAll,
    preferencesOpen,
    closePreferences,
  } = useCookieConsent();

  const handleToggle = (category: CookieCategory) => {
    updateConsent(category, !consentState[category]);
  };

  return (
    <Dialog
      open={preferencesOpen}
      onOpenChange={closePreferences}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("cookies.preferences.title")}</DialogTitle>
          <DialogDescription>
            {t("cookies.preferences.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Necessary cookies - always enabled */}
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label className="font-medium">
                {t("cookies.preferences.necessary.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("cookies.preferences.necessary.description")}
              </p>
            </div>
            <Switch
              checked={true}
              disabled
            />
          </div>

          {/* Analytics cookies */}
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label className="font-medium">
                {t("cookies.preferences.analytics.title")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("cookies.preferences.analytics.description")}
              </p>
            </div>
            <Switch
              checked={consentState.analytics}
              onCheckedChange={() => handleToggle("analytics")}
            />
          </div>

          {/* Cookie policy details */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium mb-2">
              {t("cookies.preferences.details.title")}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t("cookies.preferences.details.description")}
            </p>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium">
                  {t("cookies.preferences.necessary.title")}
                </h5>
                <p className="text-xs text-muted-foreground">
                  {t("cookies.preferences.necessary.details")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("cookies.preferences.necessary.services")}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-medium">
                  {t("cookies.preferences.analytics.title")}
                </h5>
                <p className="text-xs text-muted-foreground">
                  {t("cookies.preferences.analytics.details")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAll}
              className="text-sm"
            >
              {t("cookies.rejectAll")}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={acceptAll}
              className="text-sm"
            >
              {t("cookies.acceptAll")}
            </Button>
          </div>
          <Button
            type="submit"
            onClick={closePreferences}
            className="text-sm"
          >
            {t("cookies.savePreferences")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookiePolicy;
