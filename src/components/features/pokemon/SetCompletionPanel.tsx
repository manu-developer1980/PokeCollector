import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import type { Collection } from "@/types/pokemon";
import { computeSetProgress } from "@/lib/setCompletion";

interface SetCompletionPanelProps {
  collections: Collection[];
}

export default function SetCompletionPanel({
  collections,
}: SetCompletionPanelProps) {
  const { t } = useTranslation();
  const setsProgress = computeSetProgress(collections);

  if (setsProgress.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("setCompletion.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {setsProgress.map((set) => (
        <Card key={set.setId}>
          <CardContent className="flex items-center gap-4 py-4">
            {set.setSymbol && (
              <img
                src={set.setSymbol}
                alt=""
                className="h-8 w-8 object-contain shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-medium truncate">{set.setName}</span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {set.ownedCount}/{set.totalCount} ({set.percentage}%)
                </span>
              </div>
              <Progress value={set.percentage} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
