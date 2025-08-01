# Emails Multilingües para PokéCollector

Este directorio contiene las plantillas de email HTML utilizadas por la aplicación PokéCollector para enviar comunicaciones a los usuarios en diferentes idiomas.

## Estructura de carpetas

```
src/emails/
├── es/                     # Emails en español
│   ├── registration.html   # Email de confirmación de registro
│   ├── password.html       # Email de recuperación de contraseña
│   └── magic-link.html     # Email de enlace mágico (opcional)
└── en/                     # Emails en inglés
    ├── registration.html   # Email de confirmación de registro
    ├── password.html       # Email de recuperación de contraseña
    └── magic-link.html     # Email de enlace mágico (opcional)
```

## Cómo funciona

1. Cuando un usuario se registra o solicita un restablecimiento de contraseña, Supabase envía un webhook a nuestra función Edge `send-email`.
2. La función Edge determina el idioma preferido del usuario (almacenado en `user_metadata.preferred_lang`).
3. Carga la plantilla HTML correspondiente al tipo de email y al idioma del usuario.
4. Reemplaza las variables de la plantilla con los datos específicos del usuario.
5. Envía el email utilizando el proveedor configurado (por ejemplo, Resend).

## Variables disponibles en las plantillas

Las siguientes variables están disponibles para usar en las plantillas HTML:

- `{{ .Email }}` - La dirección de email del usuario
- `{{ .Token }}` - El código OTP de 6 dígitos
- `{{ .TokenHash }}` - El hash del token para verificación
- `{{ .ConfirmationURL }}` - La URL completa para confirmar la acción
- `{{ .SiteURL }}` - La URL base del sitio
- `{{ .RedirectTo }}` - La URL de redirección después de la confirmación

## Añadir un nuevo idioma

Para añadir soporte para un nuevo idioma:

1. Crea una nueva carpeta con el código del idioma (por ejemplo, `fr/` para francés).
2. Copia las plantillas HTML de otro idioma y tradúcelas.
3. Asegúrate de que todas las variables se mantienen intactas.

## Configuración en Supabase

Para que este sistema funcione, debes:

1. Desplegar la función Edge `send-email` en Supabase:
   ```bash
   supabase functions deploy send-email --no-verify-jwt
   ```

2. Configurar las variables de entorno necesarias:
   ```bash
   supabase secrets set RESEND_API_KEY=tu_api_key_de_resend
   supabase secrets set SEND_EMAIL_HOOK_SECRET=tu_secreto_del_hook
   ```

3. Activar el "Send Email Hook" en el dashboard de Supabase:
   - Ve a Authentication > Auth Hooks
   - Activa el "Send Email Hook"
   - Configura la URL de tu función Edge
   - Genera y guarda el secreto

## Almacenar el idioma preferido del usuario

Para que el sistema sepa qué idioma usar, debes almacenar el idioma preferido del usuario en `user_metadata` durante el registro:

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@ejemplo.com',
  password: 'contraseña',
  options: {
    data: {
      preferred_lang: 'es', // o 'en', 'fr', etc.
    }
  }
});
```

También puedes actualizar el idioma preferido de un usuario existente:

```javascript
const { data, error } = await supabase.auth.updateUser({
  data: { preferred_lang: 'en' }
});
```

## Pruebas

Para probar el sistema, puedes:

1. Registrar un nuevo usuario con un idioma preferido específico.
2. Solicitar un restablecimiento de contraseña.
3. Verificar que los emails se envían en el idioma correcto.

## Solución de problemas

Si los emails no se envían correctamente:

1. Verifica los logs de la función Edge para identificar errores.
2. Asegúrate de que las plantillas HTML son válidas y contienen todas las variables necesarias.
3. Verifica que el proveedor de email (Resend) está configurado correctamente.
