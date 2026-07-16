# 📧 Configuración del Servicio de Email con Brevo

Este documento explica cómo configurar y usar el servicio de email de PokeCollector usando Brevo (anteriormente Sendinblue).

## 🚀 Configuración Inicial

### 1. Crear cuenta en Brevo

1. Ve a [https://www.brevo.com](https://www.brevo.com)
2. Crea una cuenta gratuita
3. Verifica tu email
4. Completa la configuración inicial

### 2. Obtener la clave API

#### Pasos detallados:

1. **Crear cuenta en Brevo:**
   - Ve a [https://www.brevo.com](https://www.brevo.com)
   - Haz clic en "Sign up for free"
   - Completa el registro con tu email
   - Verifica tu cuenta por email

2. **Obtener la clave API:**
   - Inicia sesión en [https://app.brevo.com](https://app.brevo.com)
   - Ve a **Settings** (⚙️) en el menú lateral
   - Selecciona **API Keys**
   - Haz clic en **Generate a new API key**
   - Dale un nombre descriptivo (ej: "PokeCollector App")
   - Copia la clave generada (empieza con `xkeysib-`)

3. **Configurar dominio del remitente:**
   - Ve a **Settings** > **Senders & IP**
   - Agrega tu dominio o usa un email verificado
   - Para pruebas, puedes usar tu email personal verificado

### 3. Configurar la variable de entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza `xkeysib-tu-clave-api-aqui` con tu clave API real:

```env
BREVO_API_KEY=xkeysib-tu-clave-api-real-aqui
```

### 4. Verificar el dominio del remitente (Opcional pero recomendado)

1. En Brevo, ve a **Settings** → **Senders & IP**
2. Agrega y verifica tu dominio (ej: `pokecollector.com`)
3. Esto mejora la entregabilidad de los emails

## 🧪 Probar el Servicio

### Ejecutar las pruebas

```bash
node test-email.js
```

Este comando ejecutará tres pruebas:
1. **Email básico**: Prueba la funcionalidad básica de envío
2. **Email de confirmación**: Prueba el template de confirmación de cuenta
3. **Email de recuperación**: Prueba el template de recuperación de contraseña

### Resultado esperado

```
🧪 Iniciando pruebas del servicio de email con Brevo...
📧 Clave API configurada: Sí

1️⃣ Probando envío de email básico...
✅ Resultado email básico: { success: true, messageId: 'xxx' }

2️⃣ Probando email de confirmación...
✅ Resultado email de confirmación: { success: true, messageId: 'xxx' }

3️⃣ Probando email de recuperación de contraseña...
✅ Resultado email de recuperación: { success: true, messageId: 'xxx' }

📊 RESUMEN DE PRUEBAS:
- Email básico: ✅ Exitoso
- Email confirmación: ✅ Exitoso
- Email recuperación: ✅ Exitoso

🎉 Estado general: ✅ TODAS LAS PRUEBAS EXITOSAS
```

## 📚 Uso del Servicio

### Importar el servicio

```javascript
const { sendEmail, sendConfirmationEmail, sendPasswordResetEmail } = require('./email-service');
```

### Enviar email básico

```javascript
const result = await sendEmail({
  to: 'usuario@ejemplo.com',
  subject: 'Asunto del email',
  htmlContent: '<h1>Contenido HTML</h1>',
  textContent: 'Contenido en texto plano',
  fromName: 'PokeCollector',
  fromEmail: 'manu.developer1980@gmail.com'
});

if (result.success) {
  console.log('Email enviado:', result.messageId);
} else {
  console.error('Error:', result.error);
}
```

### Enviar email de confirmación

```javascript
const result = await sendConfirmationEmail(
  'usuario@ejemplo.com',
  'https://pokecollector.com/confirm?token=abc123',
  'es' // o 'en' para inglés
);
```

### Enviar email de recuperación de contraseña

```javascript
const result = await sendPasswordResetEmail(
  'usuario@ejemplo.com',
  'https://pokecollector.com/reset?token=xyz789',
  'es' // o 'en' para inglés
);
```

## 🔧 Integración con React

### Crear un hook personalizado

Crea `src/hooks/useEmailService.ts`:

```typescript
import { useState } from 'react';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function useEmailService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendConfirmationEmail = async (email: string, confirmationUrl: string, language = 'es'): Promise<EmailResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // Aquí harías la llamada a tu API backend que usa email-service.js
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationUrl, language })
      });
      
      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendConfirmationEmail,
    loading,
    error
  };
}
```

### Usar en un componente

```typescript
import { useEmailService } from '../hooks/useEmailService';

function RegisterForm() {
  const { sendConfirmationEmail, loading, error } = useEmailService();

  const handleRegister = async (email: string) => {
    const confirmationUrl = `${window.location.origin}/auth/confirm?token=abc123`;
    const result = await sendConfirmationEmail(email, confirmationUrl, 'es');
    
    if (result.success) {
      alert('Email de confirmación enviado!');
    } else {
      alert('Error al enviar email: ' + result.error);
    }
  };

  return (
    <div>
      {/* Tu formulario aquí */}
      {loading && <p>Enviando email...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## 🚨 Solución de Problemas

### Error: "Invalid API key"
- Verifica que la clave API esté correctamente configurada en `.env`
- Asegúrate de que la clave empiece con `xkeysib-`
- Verifica que la clave no haya expirado en Brevo

### Error: "Sender not verified"
- Ve a Brevo → Settings → Senders & IP
- Verifica el email del remitente
- O usa un email ya verificado

### Emails no llegan
- Revisa la carpeta de spam
- Verifica que el dominio del remitente esté verificado
- Revisa los logs en Brevo → Logs → Email Activity

### Error de conexión
- Verifica tu conexión a internet
- Revisa si hay firewalls bloqueando la conexión
- Verifica que no haya problemas con el servicio de Brevo

## 📊 Límites del Plan Gratuito

- **300 emails por día**
- **Branding de Brevo** en los emails
- **Soporte básico**

Para producción, considera actualizar a un plan de pago para:
- Más emails por día
- Remover el branding
- Soporte prioritario
- Funciones avanzadas

## 🔗 Enlaces Útiles

- [Documentación de Brevo](https://developers.brevo.com/)
- [Panel de control de Brevo](https://app.brevo.com/)
- [Precios de Brevo](https://www.brevo.com/pricing/)
- [Estado del servicio](https://status.brevo.com/)