import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
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
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import EmailExistsModal from "./EmailExistsModal";

const formSchema = z
  .object({
    email: z.string().email("Email inválido"),
    fullName: z.string().min(1, "El nombre es requerido"),
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
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
  const [existingEmail, setExistingEmail] = useState("");
  const { toast } = useToast();
  const { signUp } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Iniciando registro...", data);
    setIsLoading(true);

    try {
      // Verificar que signUp existe y es una función
      if (!signUp || typeof signUp !== "function") {
        console.error("signUp no está definida o no es una función", signUp);
        throw new Error("Error de configuración de autenticación");
      }

      console.log("Llamando a signUp...");
      const result = await signUp(data.email, data.password, data.fullName);
      console.log("Resultado de signUp:", result);

      if (result?.error) {
        console.log("Error detectado:", result.error);
        // Cambiamos la condición para que coincida con el mensaje exacto
        if (
          result.error.message ===
          "Este email ya está registrado. Por favor inicia sesión."
        ) {
          setExistingEmail(data.email);
          setShowEmailExistsModal(true);
          return;
        }
        throw result.error;
      }

      if (!result?.data?.user) {
        console.log("No hay datos de usuario en la respuesta");
        throw new Error("No se recibieron datos del usuario");
      }

      console.log("Registro exitoso, navegando a confirm-signup");
      navigate("/confirm-signup", {
        state: {
          email: data.email,
        },
        replace: true,
      });
    } catch (error: any) {
      console.error("Error completo:", error);
      // Si el error es de email existente, mostramos el modal
      if (
        error.message ===
        "Este email ya está registrado. Por favor inicia sesión."
      ) {
        setExistingEmail(data.email);
        setShowEmailExistsModal(true);
        return;
      }

      // Para otros errores mostramos el toast
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre"
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
                {isLoading ? (
                  <LoadingSpinner
                    message="Registrando usuario..."
                    compact
                  />
                ) : (
                  "Registrarse"
                )}
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
      <EmailExistsModal
        isOpen={showEmailExistsModal}
        onClose={() => setShowEmailExistsModal(false)}
        email={existingEmail}
      />
    </AuthLayout>
  );
}
