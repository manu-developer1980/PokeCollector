// Script de prueba para el servicio de email con Brevo
import { sendEmail, sendConfirmationEmail, sendPasswordResetEmail } from './email-service.js';
import dotenv from 'dotenv';
dotenv.config();

async function testEmailService() {
  console.log('🧪 Iniciando pruebas del servicio de email con Brevo...');
  console.log('📧 Clave API configurada:', process.env.BREVO_API_KEY ? 'Sí' : 'No');
  
  try {
    // Prueba 1: Email básico
    console.log('\n1️⃣ Probando envío de email básico...');
    const basicResult = await sendEmail({
      to: 'manuelrq1980@gmail.com',
      subject: 'Prueba de PokeCollector - Email Básico',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">¡Prueba Exitosa!</h2>
          <p>Este es un email de prueba desde PokeCollector.</p>
          <p>Si recibes este mensaje, el servicio de email está funcionando correctamente.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalles de la prueba:</h3>
            <ul>
              <li>Servicio: Brevo (nueva API)</li>
              <li>Fecha: ${new Date().toLocaleString('es-ES')}</li>
              <li>Tipo: Email básico</li>
            </ul>
          </div>
        </div>
      `,
      textContent: 'Prueba de email desde PokeCollector. Si recibes este mensaje, el servicio está funcionando.'
    });
    
    console.log('✅ Resultado email básico:', basicResult);
    
    // Prueba 2: Email de confirmación
    console.log('\n2️⃣ Probando email de confirmación...');
    const confirmationResult = await sendConfirmationEmail(
      'manuelrq1980@gmail.com',
      'https://poke-collector.netlify.app/auth/confirm?token=test123456',
      'es'
    );
    
    console.log('✅ Resultado email de confirmación:', confirmationResult);
    
    // Prueba 3: Email de recuperación de contraseña
    console.log('\n3️⃣ Probando email de recuperación de contraseña...');
    const resetResult = await sendPasswordResetEmail(
      'manuelrq1980@gmail.com',
      'https://poke-collector.netlify.app/auth/reset?token=reset789',
      'es'
    );
    
    console.log('✅ Resultado email de recuperación:', resetResult);
    
    // Resumen
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log('- Email básico:', basicResult.success ? '✅ Exitoso' : '❌ Falló');
    console.log('- Email confirmación:', confirmationResult.success ? '✅ Exitoso' : '❌ Falló');
    console.log('- Email recuperación:', resetResult.success ? '✅ Exitoso' : '❌ Falló');
    
    const allSuccess = basicResult.success && confirmationResult.success && resetResult.success;
    console.log('\n🎉 Estado general:', allSuccess ? '✅ TODAS LAS PRUEBAS EXITOSAS' : '❌ ALGUNAS PRUEBAS FALLARON');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    console.error('\n🔍 Posibles soluciones:');
    console.error('1. Verifica que BREVO_API_KEY esté configurada en el archivo .env');
    console.error('2. Asegúrate de que la clave API de Brevo sea válida');
    console.error('3. Verifica tu conexión a internet');
    console.error('4. Revisa que el email del remitente esté verificado en Brevo');
  }
}

// Ejecutar las pruebas
testEmailService();