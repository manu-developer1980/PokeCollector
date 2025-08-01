// Servicio de email usando Brevo API REST directamente
import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY || 'xkeysib-tu-clave-api-aqui';

/**
 * Envía un email usando la API REST de Brevo
 * @param {Object} emailData - Datos del email
 * @param {string} emailData.to - Email del destinatario
 * @param {string} emailData.subject - Asunto del email
 * @param {string} emailData.htmlContent - Contenido HTML del email
 * @param {string} emailData.textContent - Contenido de texto plano (opcional)
 * @param {string} emailData.fromName - Nombre del remitente (opcional)
 * @param {string} emailData.fromEmail - Email del remitente (opcional)
 */
export async function sendEmail(emailData) {
  try {
    const payload = {
      sender: {
        name: emailData.fromName || 'PokeCollector',
        email: emailData.fromEmail || 'manu.developer1980@gmail.com'
      },
      to: [{
        email: emailData.to,
        name: emailData.toName || emailData.to.split('@')[0]
      }],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent || ''
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email enviado exitosamente:', result);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Error al enviar email:', result);
      return { success: false, error: result.message || 'Error desconocido' };
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía email de confirmación de registro
 * @param {string} email - Email del usuario
 * @param {string} confirmationUrl - URL de confirmación
 * @param {string} language - Idioma ('es' o 'en')
 */
export async function sendConfirmationEmail(email, confirmationUrl, language = 'es') {
  const templates = {
    es: {
      subject: '¡Confirma tu cuenta en PokeCollector!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">PokeCollector</h1>
          </div>
          
          <h2 style="color: #1f2937;">¡Bienvenido a PokeCollector!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Gracias por registrarte en nuestra plataforma de colección de cartas Pokémon.</p>
          
          <p style="color: #4b5563; line-height: 1.6;">Para completar tu registro y activar tu cuenta, por favor confirma tu email haciendo clic en el siguiente botón:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              ✅ Confirmar mi cuenta
            </a>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #3b82f6; margin: 10px 0 0 0; font-size: 14px;">${confirmationUrl}</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Si no te registraste en PokeCollector, puedes ignorar este email de forma segura.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2024 PokeCollector. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
      text: `¡Bienvenido a PokeCollector!\n\nGracias por registrarte en nuestra plataforma.\n\nPara confirmar tu cuenta, visita: ${confirmationUrl}\n\nSi no te registraste en PokeCollector, puedes ignorar este email.`
    },
    en: {
      subject: 'Confirm your PokeCollector account!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">PokeCollector</h1>
          </div>
          
          <h2 style="color: #1f2937;">Welcome to PokeCollector!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Thank you for signing up for our Pokémon card collection platform.</p>
          
          <p style="color: #4b5563; line-height: 1.6;">To complete your registration and activate your account, please confirm your email by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              ✅ Confirm my account
            </a>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">If you can't click the button, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6; margin: 10px 0 0 0; font-size: 14px;">${confirmationUrl}</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you didn't sign up for PokeCollector, you can safely ignore this email.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2024 PokeCollector. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Welcome to PokeCollector!\n\nThank you for signing up for our platform.\n\nTo confirm your account, visit: ${confirmationUrl}\n\nIf you didn't sign up for PokeCollector, you can safely ignore this email.`
    }
  };

  const template = templates[language] || templates.es;
  
  return await sendEmail({
    to: email,
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text
  });
}

/**
 * Envía un email de recuperación de contraseña
 * @param {string} to - Email del destinatario
 * @param {string} resetLink - Link de recuperación
 * @param {string} userName - Nombre del usuario (opcional)
 */
export async function sendPasswordResetEmail(to, resetLink, userName = '') {
  const subject = '🔐 Recupera tu contraseña - PokeCollector';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; margin: 0;">🔐 Recuperación de Contraseña</h1>
        <p style="color: #6b7280; margin: 10px 0 0 0;">PokeCollector</p>
      </div>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
        <h2 style="color: #dc2626; margin: 0 0 15px 0;">Solicitud de recuperación</h2>
        <p style="margin: 0; color: #374151;">
          ${userName ? `Hola ${userName},` : 'Hola,'}
        </p>
        <p style="color: #374151;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en PokeCollector.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          🔑 Restablecer Contraseña
        </a>
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          ⚠️ <strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.
        </p>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
          Si no solicitaste este cambio, puedes ignorar este email.
        </p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <div style="text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          ¿Problemas con el enlace? Copia y pega esta URL en tu navegador:
        </p>
        <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 5px 0 0 0;">
          ${resetLink}
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 PokeCollector. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
  
  const textContent = `
Recuperación de Contraseña - PokeCollector

${userName ? `Hola ${userName},` : 'Hola,'}

Recibimos una solicitud para restablecer la contraseña de tu cuenta en PokeCollector.

Para restablecer tu contraseña, visita el siguiente enlace:
${resetLink}

Importante: Este enlace expirará en 24 horas por seguridad.
Si no solicitaste este cambio, puedes ignorar este email.

---
© 2024 PokeCollector. Todos los derechos reservados.
  `;

  return await sendEmail({
    to,
    toName: userName,
    subject,
    htmlContent,
    textContent
  });
}

/**
 * Envía un email desde el formulario de contacto
 * @param {Object} contactData - Datos del formulario de contacto
 * @param {string} contactData.name - Nombre del remitente
 * @param {string} contactData.email - Email del remitente
 * @param {string} contactData.subject - Asunto del mensaje
 * @param {string} contactData.message - Mensaje del formulario
 */
export async function sendContactFormEmail(contactData) {
  const { name, email, subject, message } = contactData;
  
  try {
    // Intentar usar la plantilla HTML personalizada
    const { renderContactFormTemplate, generateContactFormTextContent } = await import('./email-template-service.js');
    
    const emailSubject = `📧 Nuevo mensaje de contacto: ${subject}`;
    const htmlContent = await renderContactFormTemplate(contactData);
    const textContent = generateContactFormTextContent(contactData);

    // Enviar email al administrador/soporte
    return await sendEmail({
      to: 'manu.developer1980@gmail.com', // Email de destino para recibir los mensajes
      toName: 'Soporte PokeCollector',
      subject: emailSubject,
      htmlContent,
      textContent,
      fromName: `${name} (via PokeCollector)`,
      fromEmail: 'manu.developer1980@gmail.com' // Email verificado en Brevo
    });
    
  } catch (templateError) {
    console.warn('⚠️ No se pudo cargar la plantilla HTML, usando fallback:', templateError.message);
    
    // Fallback: usar HTML inline como antes
    const emailSubject = `📧 Nuevo mensaje de contacto: ${subject}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">📧 Nuevo Mensaje de Contacto</h1>
          <p style="color: #6b7280; margin: 10px 0 0 0;">PokeCollector</p>
        </div>
        
        <div style="background-color: #fef9e7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <h2 style="color: #92400e; margin: 0 0 15px 0;">Información del remitente</h2>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 6px;">
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>👤 Nombre:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
            <p style="margin: 0; color: #374151;"><strong>📝 Asunto:</strong> ${subject}</p>
          </div>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0;">💬 Mensaje:</h3>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            💡 <strong>Tip:</strong> Puedes responder directamente a este email para contactar al remitente.
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Este mensaje fue enviado desde el formulario de contacto de PokeCollector
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
            © 2024 PokeCollector. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;
    
    const textContent = `
Nuevo Mensaje de Contacto - PokeCollector

INFORMACIÓN DEL REMITENTE:
- Nombre: ${name}
- Email: ${email}
- Asunto: ${subject}

MENSAJE:
${message}

---
Este mensaje fue enviado desde el formulario de contacto de PokeCollector.
© 2024 PokeCollector. Todos los derechos reservados.
    `;

    // Enviar email al administrador/soporte
    return await sendEmail({
      to: 'manu.developer1980@gmail.com', // Email de destino para recibir los mensajes
      toName: 'Soporte PokeCollector',
      subject: emailSubject,
      htmlContent,
      textContent,
      fromName: `${name} (via PokeCollector)`,
      fromEmail: 'manu.developer1980@gmail.com' // Email verificado en Brevo
    });
  }
}