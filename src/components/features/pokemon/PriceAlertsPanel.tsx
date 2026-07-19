import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { PriceAlert } from "@/types/pokemon";
import { getUserPriceAlerts, deletePriceAlert } from "@/lib/priceAlerts";

export default function PriceAlertsPanel() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserPriceAlerts()
      .then(setAlerts)
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deletePriceAlert(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      toast({ description: t("priceAlerts.deleteSuccess") });
    } catch (error) {
      toast({
        description: t("priceAlerts.deleteError"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) return null;

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("priceAlerts.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardContent className="flex items-center gap-4 py-3">
            {alert.card_image_url && (
              <img
                src={alert.card_image_url}
                alt=""
                className="h-16 w-auto object-contain shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate block">
                {alert.card_name}
              </span>
              <p className="text-sm text-muted-foreground">
                {t("priceAlerts.targetLabel")}: {alert.target_price.toFixed(2)} €
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => handleDelete(alert.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
