import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

interface PlanUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: SubscriptionPlan;
  showWelcomeMessage?: boolean;
}

export function PlanUpgradeDialog({
  isOpen,
  onClose,
  currentPlan,
  showWelcomeMessage = false,
}: PlanUpgradeDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {showWelcomeMessage
              ? "¡Bienvenido a PokéCollector!"
              : "Mejora tu Plan"}
          </DialogTitle>
          <DialogDescription>
            {showWelcomeMessage
              ? "Comienza con el plan Aprendiz gratuito y mejora cuando lo necesites para acceder a más funcionalidades."
              : "Descubre los beneficios de nuestros planes premium"}
          </DialogDescription>
        </DialogHeader>

        {/* ... resto del contenido ... */}
      </DialogContent>
    </Dialog>
  );
}

const formSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const result = await signUp(data.email, data.password);

      if (result.error) {
        throw result.error;
      }

      if (!result.data?.user) {
        throw new Error("No se recibieron datos del usuario");
      }

      // Redirigir directamente a confirmación de email
      navigate("/confirm-signup", {
        state: {
          email: data.email,
        },
        replace: true,
      });
    } catch (error) {
      toast({
        title: "Error en el registro",
        description:
          "Ha ocurrido un error durante el registro. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrarse
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export function Sidebar({ items, activeItem, onItemClick }: SidebarProps) {
  const { subscription } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const isPremium = subscription?.status === "active";

  return (
    <div className="w-64 border-r bg-card p-4">
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onItemClick(item)}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-lg text-sm",
              activeItem === item
                ? "bg-red-100 text-red-900"
                : "hover:bg-red-50 text-gray-700"
            )}
          >
            {item}
          </button>
        ))}

        {!isPremium && (
          <button
            onClick={() => setShowUpgradeDialog(true)}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Mejora tu Plan
          </button>
        )}
      </nav>

      <PlanUpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        currentPlan="APRENDIZ"
      />
    </div>
  );
}
