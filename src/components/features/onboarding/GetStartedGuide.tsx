import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, Database, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GetStartedGuideProps {
  onClose?: () => void;
}

const GetStartedGuide = ({ onClose }: GetStartedGuideProps) => {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("onboarding.steps.search.title"),
      description: t("onboarding.steps.search.description"),
      icon: <Search className="h-6 w-6 text-blue-600" />,
    },
    {
      title: t("onboarding.steps.collection.title"),
      description: t("onboarding.steps.collection.description"),
      icon: <Database className="h-6 w-6 text-blue-600" />,
    },
    {
      title: t("onboarding.steps.wishlist.title"),
      description: t("onboarding.steps.wishlist.description"),
      icon: <Heart className="h-6 w-6 text-red-600" />,
    },
  ];

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("onboarding.welcome")}
          </h2>
          <p className="text-gray-600">{t("onboarding.intro")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="mb-4 bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-8"
          >
            {t("onboarding.startButton")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GetStartedGuide;
