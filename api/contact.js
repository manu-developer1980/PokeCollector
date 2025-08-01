import { sendContactFormEmail } from '../email-service.js';

/**
 * API endpoint para manejar el envío de emails desde el formulario de contacto
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método no permitido. Solo se acepta POST.' 
    });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validar campos requeridos
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos: name, email, subject, message'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'El formato del email no es válido'
      });
    }

    // Validar longitud de campos
    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'El nombre no puede exceder 100 caracteres'
      });
    }

    if (subject.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'El asunto no puede exceder 200 caracteres'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede exceder 2000 caracteres'
      });
    }

    // Sanitizar datos de entrada
    const sanitizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    };

    console.log('📧 Enviando email de contacto:', {
      from: sanitizedData.email,
      name: sanitizedData.name,
      subject: sanitizedData.subject
    });

    // Enviar email usando el servicio de email
    const result = await sendContactFormEmail(sanitizedData);

    if (result.success) {
      console.log('✅ Email de contacto enviado exitosamente:', result.messageId);
      
      return res.status(200).json({
        success: true,
        message: '¡Mensaje enviado exitosamente! Te responderemos pronto.',
        messageId: result.messageId
      });
    } else {
      console.error('❌ Error al enviar email de contacto:', result.error);
      
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor al enviar el mensaje. Por favor, inténtalo más tarde.',
        details: process.env.NODE_ENV === 'development' ? result.error : undefined
      });
    }

  } catch (error) {
    console.error('❌ Error en API de contacto:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor. Por favor, inténtalo más tarde.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Configuración para Next.js API routes
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};