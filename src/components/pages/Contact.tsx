import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("contact.form.errors.nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("contact.form.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("contact.form.errors.emailInvalid");
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t("contact.form.errors.subjectRequired");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("contact.form.errors.messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("contact.form.errors.messageMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Llamada real a la API de contacto
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error al enviar mensaje de contacto:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-red-50">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-none">
              {t("contact.hero.badge")}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              {t("contact.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t("contact.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {t("contact.info.title")}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {t("contact.info.description")}
                  </p>
                </div>

                <div className="space-y-6">
                  <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {t("contact.info.email.title")}
                          </h3>
                          <p className="text-gray-600">
                            {t("contact.info.email.description")}
                          </p>
                          <p className="text-blue-600 font-medium mt-2">
                            support@pokecollector.com
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {t("contact.info.support.title")}
                          </h3>
                          <p className="text-gray-600">
                            {t("contact.info.support.description")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <Card className="border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">
                      {t("contact.form.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {submitStatus === 'success' && (
                      <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {t("contact.form.success")}
                        </AlertDescription>
                      </Alert>
                    )}

                    {submitStatus === 'error' && (
                      <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {t("contact.form.error")}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("contact.form.name")}</Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={errors.name ? "border-red-500" : ""}
                            placeholder={t("contact.form.namePlaceholder")}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">{t("contact.form.email")}</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                            placeholder={t("contact.form.emailPlaceholder")}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                        <Input
                          id="subject"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          className={errors.subject ? "border-red-500" : ""}
                          placeholder={t("contact.form.subjectPlaceholder")}
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-600">{errors.subject}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">{t("contact.form.message")}</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className={errors.message ? "border-red-500" : ""}
                          placeholder={t("contact.form.messagePlaceholder")}
                          rows={6}
                        />
                        {errors.message && (
                          <p className="text-sm text-red-600">{errors.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t("contact.form.sending")}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t("contact.form.send")}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}