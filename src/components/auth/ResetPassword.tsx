import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from "../../../supabase/supabase";
import { useTranslation } from "react-i18next";
import AuthLayout from "./AuthLayout";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos una mayúscula')
    .regex(/[a-z]/, 'Al menos una minúscula')
    .regex(/\d/, 'Al menos un número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  // Validación de contraseña
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  // Verificar sesión al cargar el componente
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Verificando sesión para reset de contraseña...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📋 Estado de la sesión:', {
          hasSession: !!session,
          sessionError: error?.message,
          userId: session?.user?.id,
          accessToken: session?.access_token ? 'Presente' : 'Ausente'
        });
        
        if (error) {
          console.error('❌ Error al obtener sesión:', error);
          setError(`Error de sesión: ${error.message}`);
          setHasValidSession(false);
        } else if (!session) {
          console.warn('⚠️ No hay sesión activa para reset de contraseña');
          setError('No hay una sesión válida. Por favor, solicita un nuevo enlace de restablecimiento.');
          setHasValidSession(false);
        } else {
          console.log('✅ Sesión válida encontrada');
          setHasValidSession(true);
        }
      } catch (err) {
        console.error('💥 Error inesperado al verificar sesión:', err);
        setError('Error inesperado al verificar la sesión');
        setHasValidSession(false);
      } finally {
        setSessionChecked(true);
      }
    };

    checkSession();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Intentando actualizar contraseña...');
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        console.error('❌ Error al actualizar contraseña:', error);
        setError(error.message);
        return;
      }

      console.log('✅ Contraseña actualizada exitosamente');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      setError(t('auth.errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Redirigir al login o dashboard
    window.location.href = '/login';
  };

  // Mostrar loading mientras verificamos la sesión
  if (!sessionChecked) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Verificando sesión...</p>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Mostrar error si no hay sesión válida
  if (!hasValidSession) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">{t('auth.errors.authError')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || t('auth.errors.verificationErrorDesc')}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/forgot-password')} 
              className="w-full"
            >
              {t('auth.forgotPassword')}
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t('auth.resetPassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.newPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                        placeholder={t('auth.enterNewPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              
              {/* Indicadores de validación de contraseña */}
              {password && (
                <div className="text-sm space-y-1">
                  <div className={`flex items-center space-x-2 ${
                    passwordValidation.minLength ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      passwordValidation.minLength ? 'text-green-600' : 'text-gray-300'
                    }`} />
                    <span>{t('auth.passwordRequirements.minLength')}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-300'
                    }`} />
                    <span>{t('auth.passwordRequirements.uppercase')}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-300'
                    }`} />
                    <span>{t('auth.passwordRequirements.lowercase')}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <CheckCircle className={`h-3 w-3 ${
                      passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-300'
                    }`} />
                    <span>{t('auth.passwordRequirements.number')}</span>
                  </div>
                </div>
              )}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="pr-10"
                        placeholder={t('auth.confirmNewPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              
              {/* Indicador de coincidencia de contraseñas */}
              {confirmPassword && (
                <div className={`flex items-center space-x-2 text-sm ${
                  passwordsMatch ? 'text-green-600' : 'text-red-600'
                }`}>
                  <CheckCircle className={`h-3 w-3 ${
                    passwordsMatch ? 'text-green-600' : 'text-gray-300'
                  }`} />
                  <span>
                    {passwordsMatch ? t('auth.passwordRequirements.match') : t('auth.passwordRequirements.noMatch')}
                  </span>
                </div>
              )}

            <Button
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid || !passwordsMatch || loading || !hasValidSession}
            >
              {loading ? t('common.loading') : t('auth.updatePassword')}
            </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Modal de éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>{t('auth.success.welcome')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('auth.passwordChanged')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleSuccessModalClose}>
              {t('common.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
};

export default ResetPassword;
