import { sendContactFormEmail } from './email-service.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script de prueba para el formulario de contacto
 * Simula el envío de un mensaje desde el formulario
 */
async function testContactForm() {
  console.log('🧪 Iniciando prueba del formulario de contacto...');
  console.log('=' .repeat(50));

  // Verificar que la clave API esté configurada
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'tu_clave_api_aqui') {
    console.error('❌ Error: BREVO_API_KEY no está configurada en el archivo .env');
    console.log('\n📝 Para configurar:');
    console.log('1. Abre el archivo .env');
    console.log('2. Reemplaza "tu_clave_api_aqui" con tu clave API real de Brevo');
    console.log('3. Guarda el archivo y ejecuta este script nuevamente');
    return;
  }

  // Datos de prueba del formulario de contacto
  const testContactData = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    subject: 'Consulta sobre PokeCollector',
    message: `Hola,\n\nMe gustaría saber más información sobre PokeCollector.\n\n¿Podrían ayudarme con las siguientes preguntas?\n\n1. ¿Cómo puedo registrarme?\n2. ¿Qué funcionalidades incluye?\n3. ¿Es gratuito?\n\nGracias por su tiempo.\n\nSaludos,\nJuan`
  };

  console.log('📧 Enviando mensaje de contacto de prueba...');
  console.log('📝 Datos del formulario:');
  console.log(`   👤 Nombre: ${testContactData.name}`);
  console.log(`   📧 Email: ${testContactData.email}`);
  console.log(`   📝 Asunto: ${testContactData.subject}`);
  console.log(`   💬 Mensaje: ${testContactData.message.substring(0, 50)}...`);
  console.log('');

  try {
    const result = await sendContactFormEmail(testContactData);

    if (result.success) {
      console.log('✅ ¡Email de contacto enviado exitosamente!');
      console.log(`📬 Message ID: ${result.messageId}`);
      console.log('');
      console.log('🎉 El formulario de contacto está funcionando correctamente.');
      console.log('📧 El mensaje fue enviado al email de soporte configurado.');
      console.log('');
      console.log('📋 Próximos pasos:');
      console.log('1. ✅ Servicio de email configurado');
      console.log('2. ✅ Función de contacto implementada');
      console.log('3. ✅ Integración con formulario lista');
      console.log('4. 🔄 Prueba el formulario en la aplicación web');
    } else {
      console.error('❌ Error al enviar email de contacto:');
      console.error(`   ${result.error}`);
      
      // Verificar errores comunes
      if (result.error && result.error.includes('unauthorized')) {
        console.log('');
        console.log('🔧 Posible solución:');
        console.log('1. Verifica que tu clave API de Brevo sea correcta');
        console.log('2. Asegúrate de que tu IP esté autorizada en Brevo:');
        console.log('   - Ve a https://app.brevo.com/settings/keys/api');
        console.log('   - En "Security", añade tu IP actual');
        console.log('   - Guarda los cambios');
      }
      
      if (result.error && result.error.includes('missing_parameter')) {
        console.log('');
        console.log('🔧 Error de parámetros:');
        console.log('Verifica que todos los campos requeridos estén presentes.');
      }
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    console.log('');
    console.log('🔧 Posibles causas:');
    console.log('1. Problema de conexión a internet');
    console.log('2. Configuración incorrecta de la API de Brevo');
    console.log('3. Error en el código del servicio de email');
  }

  console.log('');
  console.log('=' .repeat(50));
  console.log('🏁 Prueba del formulario de contacto completada.');
}

// Ejecutar la prueba
testContactForm().catch(error => {
  console.error('💥 Error fatal en la prueba:', error);
  process.exit(1);
});