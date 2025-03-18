import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { UserPlus, Loader2 } from "lucide-react";
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

// Añadir el componente ConfirmDialog
export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
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
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [emailToConfirm, setEmailToConfirm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const planId = searchParams.get('plan');
  const interval = searchParams.get('interval');
  const redirectPath = searchParams.get('redirect');

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

      const { error: subError } = await supabase
        .rpc('create_user_subscription', {
          user_id_param: result.data.user.id,
          plan_type_param: planId || 'free'
        });

      if (subError) {
        console.error("Error al crear la suscripción:", subError);
        throw subError;
      }

      // Mostrar el diálogo de confirmación
      setEmailToConfirm(data.email);
      setShowConfirmEmail(true);

    } catch (error: any) {
      console.error("Error durante el registro:", error);
      toast({
        title: "Error en el registro",
        description: error.message || "No se pudo completar el registro. Por favor, intenta de nuevo.",
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
      <ConfirmDialog
        isOpen={showConfirmEmail}
        onClose={() => setShowConfirmEmail(false)}
        onConfirm={() => {
          setShowConfirmEmail(false);
          navigate('/confirm-signup', { 
            state: { email: emailToConfirm },
            replace: true 
          });
        }}
        title="Confirma tu email"
        description={`Te hemos enviado un email de confirmación a ${emailToConfirm}. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.`}
      />
    </AuthLayout>
  );
}
