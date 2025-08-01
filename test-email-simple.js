// Script de prueba simple para verificar la configuración de Brevo
import { sendEmail } from './email-service.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Verificando configuración de Brevo...');
console.log('📧 Clave API:', process.env.BREVO_API_KEY ? '✅ Configurada' : '❌ No configurada');

if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'xkeysib-tu-clave-api-aqui') {
  console.log('\n❌ ERROR: Clave API de Brevo no configurada correctamente');
  console.log('\n📋 PASOS PARA CONFIGURAR:');
  console.log('1. Ve a https://www.brevo.com y crea una cuenta gratuita');
  console.log('2. Inicia sesión en https://app.brevo.com');
  console.log('3. Ve a Settings > API Keys');
  console.log('4. Genera una nueva clave API');
  console.log('5. Copia la clave (empieza con "xkeysib-")');
  console.log('6. Edita el archivo .env y reemplaza:');
  console.log('   BREVO_API_KEY=xkeysib-tu-clave-api-aqui');
  console.log('   por:');
  console.log('   BREVO_API_KEY=tu-clave-real-aqui');
  console.log('\n📖 Más información en EMAIL_SETUP.md');
  process.exit(1);
}

console.log('\n🚀 Enviando email de prueba...');

// Prueba básica
const result = await sendEmail({
  to: 'manuelrq1980@gmail.com',
  toName: 'Usuario de Prueba',
  subject: '🧪 Prueba de PokeCollector - Email Service',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3b82f6;">🎉 ¡Email Service Funcionando!</h2>
      <p>Este es un email de prueba desde PokeCollector.</p>
      <p>Si recibes este mensaje, significa que el servicio de email con Brevo está configurado correctamente.</p>
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #0369a1;">✅ Configuración exitosa</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Enviado desde: PokeCollector Email Service</p>
    </div>
  `,
  textContent: '¡Email Service Funcionando! Este es un email de prueba desde PokeCollector.'
});

if (result.success) {
  console.log('\n🎉 ¡EMAIL ENVIADO EXITOSAMENTE!');
  console.log('📧 Revisa tu bandeja de entrada en manuelrq1980@gmail.com');
  console.log('📨 Message ID:', result.messageId);
  console.log('\n✅ El servicio de email está funcionando correctamente');
} else {
    console.log('\n❌ ERROR AL ENVIAR EMAIL:');
    console.log('🔍 Error:', result.error.message || result.error);
    console.log('\n🛠️ POSIBLES SOLUCIONES:');
    
    if (result.error.message && result.error.message.includes('unrecognised IP address')) {
      console.log('🚨 PROBLEMA DE IP NO AUTORIZADA:');
      console.log('1. Ve a https://app.brevo.com/security/authorised_ips');
      console.log('2. Haz clic en "Add IP"');
      console.log('3. Agrega tu IP actual o usa 0.0.0.0/0 para todas las IPs');
      console.log('4. Guarda y prueba de nuevo');
    } else if (result.error.message && result.error.message.includes('name is missing')) {
      console.log('🚨 PROBLEMA DE PARÁMETROS:');
      console.log('1. El API requiere el campo "name" para cada destinatario');
      console.log('2. Voy a corregir esto en el código...');
    } else {
      console.log('1. Verifica que la clave API sea correcta');
      console.log('2. Asegúrate de que tu cuenta de Brevo esté activa');
      console.log('3. Verifica que el email del remitente esté configurado en Brevo');
      console.log('4. Revisa los límites de tu plan gratuito de Brevo');
    }
  }