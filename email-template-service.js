import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servicio para manejar plantillas de email
 */
class EmailTemplateService {
  constructor() {
    this.templatesPath = path.join(__dirname, 'email-templates');
    this.templateCache = new Map();
  }

  /**
   * Carga una plantilla desde el archivo
   * @param {string} templateName - Nombre del archivo de plantilla (sin extensión)
   * @returns {Promise<string>} - Contenido HTML de la plantilla
   */
  async loadTemplate(templateName) {
    // Verificar cache primero
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.html`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      
      // Guardar en cache
      this.templateCache.set(templateName, templateContent);
      
      return templateContent;
    } catch (error) {
      throw new Error(`Error al cargar plantilla '${templateName}': ${error.message}`);
    }
  }

  /**
   * Procesa una plantilla reemplazando variables
   * @param {string} template - Contenido HTML de la plantilla
   * @param {Object} variables - Variables a reemplazar en la plantilla
   * @returns {string} - HTML procesado
   */
  processTemplate(template, variables) {
    let processedTemplate = template;

    // Agregar año actual automáticamente
    const currentYear = new Date().getFullYear();
    const allVariables = {
      ...variables,
      CURRENT_YEAR: currentYear
    };

    // Reemplazar variables en formato {{VARIABLE_NAME}}
    for (const [key, value] of Object.entries(allVariables)) {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      processedTemplate = processedTemplate.replace(regex, value || '');
    }

    return processedTemplate;
  }

  /**
   * Renderiza una plantilla con variables
   * @param {string} templateName - Nombre de la plantilla
   * @param {Object} variables - Variables para la plantilla
   * @returns {Promise<string>} - HTML renderizado
   */
  async renderTemplate(templateName, variables) {
    try {
      const template = await this.loadTemplate(templateName);
      return this.processTemplate(template, variables);
    } catch (error) {
      throw new Error(`Error al renderizar plantilla '${templateName}': ${error.message}`);
    }
  }

  /**
   * Limpia el cache de plantillas
   */
  clearCache() {
    this.templateCache.clear();
  }

  /**
   * Lista las plantillas disponibles
   * @returns {Promise<string[]>} - Array de nombres de plantillas
   */
  async listTemplates() {
    try {
      const files = await fs.readdir(this.templatesPath);
      return files
        .filter(file => file.endsWith('.html'))
        .map(file => file.replace('.html', ''));
    } catch (error) {
      throw new Error(`Error al listar plantillas: ${error.message}`);
    }
  }
}

// Instancia singleton
const templateService = new EmailTemplateService();

/**
 * Renderiza la plantilla del formulario de contacto
 * @param {Object} contactData - Datos del formulario de contacto
 * @param {string} contactData.name - Nombre del remitente
 * @param {string} contactData.email - Email del remitente
 * @param {string} contactData.subject - Asunto del mensaje
 * @param {string} contactData.message - Mensaje del formulario
 * @returns {Promise<string>} - HTML renderizado
 */
export async function renderContactFormTemplate(contactData) {
  const { name, email, subject, message } = contactData;
  
  const variables = {
    SENDER_NAME: name,
    SENDER_EMAIL: email,
    MESSAGE_SUBJECT: subject,
    MESSAGE_CONTENT: message
  };

  return await templateService.renderTemplate('contact-form-template', variables);
}

/**
 * Convierte HTML a texto plano para el contenido de texto del email
 * @param {string} html - Contenido HTML
 * @returns {string} - Contenido en texto plano
 */
export function htmlToText(html) {
  return html
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .replace(/&nbsp;/g, ' ') // Reemplazar espacios no separables
    .replace(/&amp;/g, '&') // Reemplazar entidades HTML
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

/**
 * Genera contenido de texto plano para el formulario de contacto
 * @param {Object} contactData - Datos del formulario de contacto
 * @returns {string} - Contenido en texto plano
 */
export function generateContactFormTextContent(contactData) {
  const { name, email, subject, message } = contactData;
  
  return `
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
  `.trim();
}

export default templateService;