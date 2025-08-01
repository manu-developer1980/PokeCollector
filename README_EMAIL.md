# 📧 Servicio de Email - PokeCollector

## 🚀 Configuración Rápida

### 1. Crear cuenta en Brevo (GRATIS)

1. Ve a [https://www.brevo.com](https://www.brevo.com)
2. Haz clic en **"Sign up for free"**
3. Completa el registro con tu email
4. Verifica tu cuenta por email

### 2. Obtener tu clave API

1. Inicia sesión en [https://app.brevo.com](https://app.brevo.com)
2. Ve a **Settings** (⚙️) en el menú lateral
3. Selecciona **"API Keys"**
4. Haz clic en **"Generate a new API key"**
5. Dale un nombre: `PokeCollector`
6. **COPIA LA CLAVE** (empieza con `xkeysib-`)

### 3. Autorizar tu IP (IMPORTANTE)

1. Ve a **Settings** > **Security** > **Authorized IPs**
2. Haz clic en **"Add IP"**
3. Agrega tu IP actual o usa `0.0.0.0/0` para permitir todas las IPs
4. Guarda los cambios

> ⚠️ **Nota**: Si usas servicios como Vercel, Netlify, etc., necesitarás autorizar sus IPs o usar `0.0.0.0/0`

### 3. Configurar en tu proyecto

1. Abre el archivo `.env`
2. Busca esta línea:
   ```
   BREVO_API_KEY=xkeysib-tu-clave-api-aqui
   ```
3. Reemplázala con tu clave real:
   ```
   BREVO_API_KEY=xkeysib-tu-clave-real-aqui
   ```

### 4. Probar la configuración

```bash
node test-email-simple.js
```

## 📋 Límites del Plan Gratuito

- ✅ **300 emails por día**
- ✅ **Emails transaccionales ilimitados**
- ✅ **Sin límite de contactos**
- ✅ **Plantillas HTML**
- ✅ **API completa**

## 🔧 Uso en el Código

### Envío básico
```javascript
import { sendEmail } from './email-service.js';

const result = await sendEmail({
  to: 'usuario@ejemplo.com',
  subject: 'Bienvenido a PokeCollector',
  htmlContent: '<h1>¡Hola!</h1><p>Bienvenido a nuestra plataforma.</p>',
  textContent: 'Hola! Bienvenido a nuestra plataforma.'
});

if (result.success) {
  console.log('Email enviado:', result.messageId);
} else {
  console.error('Error:', result.error);
}
```

### Email de confirmación
```javascript
import { sendConfirmationEmail } from './email-service.js';

const result = await sendConfirmationEmail(
  'usuario@ejemplo.com',
  'https://pokecollector.com/confirm?token=abc123',
  'es' // o 'en'
);
```

### Email de recuperación de contraseña
```javascript
import { sendPasswordResetEmail } from './email-service.js';

const result = await sendPasswordResetEmail(
  'usuario@ejemplo.com',
  'https://pokecollector.com/reset?token=xyz789',
  'es' // o 'en'
);
```

### Email desde formulario de contacto
```javascript
import { sendContactFormEmail } from './email-service.js';

const contactData = {
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  subject: 'Consulta sobre el producto',
  message: 'Hola, me gustaría saber más información...'
};

const result = await sendContactFormEmail(contactData);
```

## 📝 Integración con Formulario de Contacto

El servicio de email está completamente integrado con el formulario de contacto de la aplicación:

### Configuración del API Endpoint
El endpoint `/api/contact` maneja automáticamente:
- ✅ Validación de campos requeridos
- ✅ Sanitización de datos de entrada
- ✅ Validación de formato de email
- ✅ Límites de longitud de campos
- ✅ Manejo de errores y respuestas

### Flujo de Funcionamiento
1. **Usuario completa el formulario** en `/contact`
2. **Frontend envía datos** al endpoint `/api/contact`
3. **API valida y procesa** los datos
4. **Servicio de email envía** el mensaje al equipo de soporte
5. **Usuario recibe confirmación** de envío exitoso

### Email de Destino
Por defecto, los mensajes se envían a: `manu.developer1980@gmail.com`

> 💡 **Tip**: Puedes cambiar el email de destino editando la función `sendContactFormEmail()` en `email-service.js`

### Pruebas
Ejecuta el script de prueba:
```bash
node test-contact-form.js
```

## 🎨 Plantillas Incluidas

Todas las plantillas están diseñadas con:
- ✨ Diseño responsive y moderno
- 🎨 Colores consistentes con la marca PokeCollector
- 📱 Compatible con clientes de email móviles y desktop
- 🔒 Elementos de seguridad y confianza
- 🌐 Soporte para texto plano como fallback

### ✅ Email de Confirmación
- Diseño moderno y responsive
- Botón de confirmación destacado
- Enlace alternativo por si el botón no funciona
- Disponible en español e inglés

### 🔑 Email de Recuperación
- Diseño con alertas de seguridad
- Botón de restablecimiento
- Advertencia de expiración (1 hora)
- Disponible en español e inglés

## 🛠️ Solución de Problemas

### Error: "Key not found"
- ✅ Verifica que copiaste la clave API completa
- ✅ Asegúrate de que no hay espacios extra
- ✅ Confirma que la clave empiece con `xkeysib-`

### Error: "Unrecognised IP address" (MÁS COMÚN)
- ✅ Ve a Brevo > Settings > Security > Authorized IPs
- ✅ Haz clic en "Add IP" y agrega tu IP actual
- ✅ O usa `0.0.0.0/0` para permitir todas las IPs
- ✅ Guarda los cambios y prueba de nuevo

### Error: "Sender not verified"
- ✅ Ve a Brevo > Settings > Senders & IP
- ✅ Agrega y verifica tu email de remitente
- ✅ O usa el email con el que te registraste

### Error: "Daily limit exceeded"
- ✅ Has alcanzado el límite de 300 emails/día
- ✅ Espera hasta el día siguiente
- ✅ O considera upgradearte a un plan de pago

## 📞 Soporte

- 📖 Documentación completa: `EMAIL_SETUP.md`
- 🧪 Script de prueba: `test-email-simple.js`
- 🔧 Servicio principal: `email-service.js`

---

**¿Todo configurado?** ¡Ejecuta `node test-email-simple.js` para verificar! 🚀