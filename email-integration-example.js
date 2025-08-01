// Ejemplo de integración del servicio de email con React/Frontend
// Este archivo muestra cómo usar el servicio de email en diferentes escenarios

// ============================================================================
// 1. INTEGRACIÓN CON REGISTRO DE USUARIO
// ============================================================================

// En tu componente de registro (Register.jsx)
export async function handleUserRegistration(userData) {
  try {
    // 1. Crear usuario en Supabase
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.fullName
        }
      }
    });

    if (signUpError) throw signUpError;

    // 2. Enviar email de confirmación personalizado
    const confirmationUrl = `${window.location.origin}/auth/confirm?token=${user.user.email_confirm_token}`;
    
    // Llamada a tu API backend que usa email-service.js
    const emailResponse = await fetch('/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        confirmationUrl: confirmationUrl,
        language: 'es' // o detectar idioma del usuario
      })
    });

    const emailResult = await emailResponse.json();
    
    if (emailResult.success) {
      console.log('✅ Email de confirmación enviado');
      // Mostrar mensaje al usuario
      toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
    } else {
      console.warn('⚠️ Usuario creado pero email no enviado:', emailResult.error);
      toast.warning('Cuenta creada. Si no recibes el email de confirmación, contacta soporte.');
    }

    return { success: true, user };
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    toast.error('Error al crear la cuenta. Inténtalo de nuevo.');
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. INTEGRACIÓN CON RECUPERACIÓN DE CONTRASEÑA
// ============================================================================

// En tu componente de recuperación (ForgotPassword.jsx)
export async function handlePasswordReset(email) {
  try {
    // 1. Solicitar reset a Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;

    // 2. Enviar email personalizado de recuperación
    const resetUrl = `${window.location.origin}/auth/reset-password?email=${encodeURIComponent(email)}`;
    
    const emailResponse = await fetch('/api/send-password-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        resetUrl: resetUrl,
        language: 'es'
      })
    });

    const emailResult = await emailResponse.json();
    
    if (emailResult.success) {
      toast.success('Email de recuperación enviado. Revisa tu bandeja de entrada.');
    } else {
      toast.warning('Solicitud procesada. Si el email existe, recibirás instrucciones.');
    }

    return { success: true };
    
  } catch (error) {
    console.error('❌ Error en recuperación:', error);
    toast.error('Error al procesar la solicitud. Inténtalo de nuevo.');
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 3. API ROUTES PARA NEXT.JS (pages/api/ o app/api/)
// ============================================================================

// pages/api/send-confirmation-email.js
import { sendConfirmationEmail } from '../../email-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, confirmationUrl, language = 'es' } = req.body;

    if (!email || !confirmationUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y confirmationUrl son requeridos' 
      });
    }

    const result = await sendConfirmationEmail(email, confirmationUrl, language);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error en API de confirmación:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
}

// pages/api/send-password-reset-email.js
import { sendPasswordResetEmail } from '../../email-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, resetUrl, language = 'es' } = req.body;

    if (!email || !resetUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y resetUrl son requeridos' 
      });
    }

    const result = await sendPasswordResetEmail(email, resetUrl, language);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error en API de reset:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
}

// ============================================================================
// 4. HOOK PERSONALIZADO PARA REACT
// ============================================================================

// hooks/useEmailService.js
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function useEmailService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendConfirmationEmail = async (email, confirmationUrl, language = 'es') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationUrl, language })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Email de confirmación enviado');
        return { success: true, messageId: result.messageId };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Error al enviar email de confirmación');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email, resetUrl, language = 'es') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/send-password-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetUrl, language })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Email de recuperación enviado');
        return { success: true, messageId: result.messageId };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Error al enviar email de recuperación');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendConfirmationEmail,
    sendPasswordResetEmail,
    isLoading,
    error
  };
}

// ============================================================================
// 5. EJEMPLO DE USO EN COMPONENTE REACT
// ============================================================================

// components/RegisterForm.jsx
import { useEmailService } from '../hooks/useEmailService';

export function RegisterForm() {
  const { sendConfirmationEmail, isLoading } = useEmailService();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Registrar usuario
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { username: formData.username }
        }
      });

      if (error) throw error;

      // 2. Enviar email de confirmación
      const confirmationUrl = `${window.location.origin}/auth/confirm?token=pending`;
      await sendConfirmationEmail(formData.email, confirmationUrl, 'es');

      // 3. Redirigir o mostrar mensaje
      toast.success('¡Registro exitoso! Revisa tu email.');
      
    } catch (error) {
      toast.error('Error en el registro: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button 
        type="submit" 
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Enviando...' : 'Registrarse'}
      </button>
    </form>
  );
}