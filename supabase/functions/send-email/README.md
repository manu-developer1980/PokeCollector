# Send Email Edge Function

Esta función Edge de Supabase se encarga de enviar correos electrónicos multilingües basados en la preferencia de idioma del usuario.

## Funcionamiento

1. Cuando Supabase Auth necesita enviar un correo electrónico (confirmación, restablecimiento de contraseña, etc.), envía una solicitud a esta función Edge.
2. La función verifica la autenticación mediante un secreto compartido.
3. Obtiene los metadatos del usuario para determinar su idioma preferido.
4. Envía el correo electrónico en el idioma adecuado utilizando Resend.

## Configuración

### Variables de entorno

Esta función requiere las siguientes variables de entorno:

```bash
# Secreto para verificar que las solicitudes provienen de Supabase Auth
SEND_EMAIL_HOOK_SECRET=v1,whsec_NLP7yuJ+3qdMrM77FgQ3N0LUr3drXnre2zhCn37X13JmISoB0PQ26IgbUhsm+7Qc9PBMLEz8fgsBZfkB

# Credenciales de Supabase para acceder a los datos de usuario
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# API Key de Resend para enviar correos
RESEND_API_KEY=tu_api_key_de_resend
```

### Configuración en Supabase

1. Despliega la función:

   ```bash
   supabase functions deploy send-email --no-verify-jwt
   ```

2. Configura las variables de entorno:

   ```bash
   supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_NLP7yuJ+3qdMrM77FgQ3N0LUr3drXnre2zhCn37X13JmISoB0PQ26IgbUhsm+7Qc9PBMLEz8fgsBZfkB"
   supabase secrets set SUPABASE_URL=https://tu-proyecto.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   supabase secrets set RESEND_API_KEY=tu_api_key_de_resend
   ```

3. Activa el "Send Email Hook" en el dashboard de Supabase:
   - Ve a Authentication > Auth Hooks
   - Activa el "Send Email Hook"
   - Configura la URL: `https://[TU-REF-DE-PROYECTO].supabase.co/functions/v1/send-email`
   - Genera y guarda el secreto (debe coincidir con `SEND_EMAIL_HOOK_SECRET`)

## Plantillas de correo electrónico

Las plantillas de correo electrónico multilingües se encuentran en `supabase/email-templates/multilingual/`. Estas plantillas utilizan la sintaxis de Go Template para mostrar contenido en diferentes idiomas según la preferencia del usuario.

Para configurar las plantillas en Supabase:

1. Ve a Authentication > Email Templates
2. Para cada tipo de plantilla (Confirmation, Recovery, Magic Link, Email Change):
   - Haz clic en la plantilla
   - Reemplaza la plantilla predeterminada con el contenido del archivo correspondiente
   - Guarda los cambios

## Pruebas

Para probar la función localmente:

1. Inicia el servidor de desarrollo de Supabase:

   ```bash
   supabase start
   ```

2. Ejecuta una solicitud de prueba:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/send-email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer v1,whsec_NLP7yuJ+3qdMrM77FgQ3N0LUr3drXnre2zhCn37X13JmISoB0PQ26IgbUhsm+7Qc9PBMLEz8fgsBZfkB" \
     -d '{"email":"test@example.com","template":"confirmation","data":{"confirmation_url":"https://example.com/confirm?token=123456"}}'
   ```

También puedes usar el archivo `test.http` incluido si tu editor lo soporta.

## Solución de problemas

Si los correos no se envían correctamente:

1. Verifica los logs de la función Edge para identificar errores:

   ```bash
   supabase logs functions send-email
   ```

2. Asegúrate de que todas las variables de entorno estén configuradas correctamente.

3. Verifica que el "Send Email Hook" esté activado y configurado con la URL y el secreto correctos.

4. Comprueba que las plantillas de correo electrónico estén correctamente instaladas en el dashboard de Supabase.
