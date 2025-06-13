import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ContactForm from "@/components/contact/ContactForm";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, Clock } from "lucide-react";

const ContactPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("contact.meta.title")} - PokéCollector</title>
        <meta
          name="description"
          content={t("contact.meta.description")}
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t("contact.pageTitle")}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("contact.pageDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("contact.info.title")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {t("contact.info.email.title")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("contact.info.email.address")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {t("contact.info.response.title")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("contact.info.response.time")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {t("contact.info.support.title")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("contact.info.support.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("contact.faq.title")}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">
                      {t("contact.faq.q1.question")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.faq.q1.answer")}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {t("contact.faq.q2.question")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.faq.q2.answer")}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {t("contact.faq.q3.question")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.faq.q3.answer")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
