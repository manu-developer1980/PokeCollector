import { toast } from "@/components/ui/use-toast";

/**
 * Interfaz para el manejador de errores
 */
export interface ErrorHandler {
  /**
   * Maneja un error y muestra un toast
   * @param error El error a manejar
   * @param context Contexto adicional sobre dónde ocurrió el error
   * @param toast Función para mostrar un toast
   * @param t Función de traducción
   * @returns Un objeto con información sobre el error
   */
  handleError: (
    error: unknown,
    context: string,
    toast: (props: any) => void,
    t: any
  ) => {
    message: string;
    handled: boolean;
  };

  /**
   * Registra un error en el sistema de logging
   * @param error El error a registrar
   * @param context Contexto adicional sobre dónde ocurrió el error
   * @param metadata Metadatos adicionales del error
   */
  logError: (error: unknown, context: string, metadata?: Record<string, any>) => void;

  /**
   * Determina si un error es reintentable
   * @param error El error a evaluar
   */
  isRetryableError: (error: unknown) => boolean;

  /**
   * Determina si un error es causado por cold start
   * @param error El error a evaluar
   */
  isColdStartError: (error: unknown) => boolean;

  /**
   * Obtiene la severidad de un error
   * @param error El error a evaluar
   */
  getErrorSeverity: (error: unknown) => 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Implementación del manejador de errores
 */
class ErrorHandlerImpl implements ErrorHandler {
  private errorCounts = new Map<string, number>();
  private lastErrorTime = new Map<string, number>();
  private readonly ERROR_THRESHOLD = 3;
  private readonly TIME_WINDOW = 60000; // 1 minute

  /**
   * Maneja un error y muestra un toast
   */
  handleError(
    error: unknown,
    context: string,
    toast: (props: any) => void,
    t: any
  ) {
    // Registrar el error con metadatos mejorados
    this.logError(error, context, {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      severity: this.getErrorSeverity(error),
      isRetryable: this.isRetryableError(error),
      isColdStart: this.isColdStartError(error)
    });

    // Verificar frecuencia de errores para prevenir spam
    const errorKey = `${this.getErrorName(error)}:${context}`;
    const now = Date.now();
    const lastTime = this.lastErrorTime.get(errorKey) || 0;
    const count = this.errorCounts.get(errorKey) || 0;

    // Resetear contador si ha pasado suficiente tiempo
    if (now - lastTime > this.TIME_WINDOW) {
      this.errorCounts.set(errorKey, 1);
    } else {
      this.errorCounts.set(errorKey, count + 1);
    }
    
    this.lastErrorTime.set(errorKey, now);

    // Determinar el mensaje de error
    let message = this.getUserFriendlyMessage(error, t);
    let errorCode = "";

    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (!this.isColdStartError(error)) {
        message = error.message;
      }
    } else if (typeof error === "object" && error !== null) {
      // Manejar errores de Supabase u otros servicios
      if ("message" in error && typeof error.message === "string") {
        message = error.message;
      }
      if ("code" in error && typeof error.code === "string") {
        errorCode = error.code;
      }
    } else if (typeof error === "string") {
      message = error;
    }

    // Solo mostrar notificación si no es muy frecuente
    if (this.errorCounts.get(errorKey)! <= this.ERROR_THRESHOLD) {
      toast({
        title: t("common.error"),
        description: message,
        variant: "destructive",
      });
    }

    return {
      message,
      handled: true,
      errorCode,
    };
  }

  /**
   * Registra un error en el sistema de logging
   */
  logError(error: unknown, context: string, metadata: Record<string, any> = {}) {
    const errorInfo = {
      message: this.getErrorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: this.getErrorName(error),
      context,
      timestamp: new Date().toISOString(),
      severity: this.getErrorSeverity(error),
      isRetryable: this.isRetryableError(error),
      isColdStart: this.isColdStartError(error),
      sessionId: this.getSessionId(),
      ...metadata
    };

    // Logging mejorado basado en severidad
    const severity = this.getErrorSeverity(error);
    
    if (process.env.NODE_ENV !== "production") {
      switch (severity) {
        case 'critical':
          console.error('🚨 ERROR CRÍTICO:', errorInfo);
          break;
        case 'high':
          console.error('❌ ERROR ALTA SEVERIDAD:', errorInfo);
          break;
        case 'medium':
          console.warn('⚠️ ERROR MEDIA SEVERIDAD:', errorInfo);
          break;
        case 'low':
          console.info('ℹ️ ERROR BAJA SEVERIDAD:', errorInfo);
          break;
      }
    }

    // En producción, enviar al servicio de monitoreo con prioridad apropiada
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringService(errorInfo);
    }
  }

  isRetryableError(error: unknown): boolean {
    const message = this.getErrorMessage(error).toLowerCase();
    const isNetworkError = message.includes('fetch') || 
                          message.includes('network') ||
                          message.includes('connection') ||
                          message.includes('timeout');
    
    const isServerError = this.getErrorName(error) === 'TypeError' && message.includes('failed to fetch');
    
    // No reintentar errores de autenticación o errores de cliente
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return false;
    }
    
    return isNetworkError || isServerError || this.isColdStartError(error);
  }

  isColdStartError(error: unknown): boolean {
    const message = this.getErrorMessage(error).toLowerCase();
    return message.includes('connection') && 
           (message.includes('timeout') || message.includes('refused') || message.includes('reset'));
  }

  getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
    const message = this.getErrorMessage(error).toLowerCase();
    
    // Crítico: Fallos de autenticación, corrupción de datos
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'critical';
    }
    
    // Alto: Errores de base de datos, fallos de API
    if (message.includes('supabase') || message.includes('database') || message.includes('sql')) {
      return 'high';
    }
    
    // Medio: Problemas de red, cold starts
    if (this.isRetryableError(error) || this.isColdStartError(error)) {
      return 'medium';
    }
    
    // Bajo: Errores de UI, errores de validación
    return 'low';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String(error.message);
    }
    return 'Error desconocido';
  }

  private getErrorName(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }
    return 'UnknownError';
  }

  private getUserFriendlyMessage(error: unknown, t: any): string {
    if (this.isColdStartError(error)) {
      return t('errors.coldStart', 'El servidor se está iniciando. Esto puede tomar un momento...');
    }
    
    const message = this.getErrorMessage(error).toLowerCase();
    
    if (message.includes('fetch') || message.includes('network')) {
      return t('errors.network', 'Problema de conexión. Verifica tu internet e intenta de nuevo.');
    }
    
    if (message.includes('supabase') || message.includes('database')) {
      return t('errors.database', 'Base de datos temporalmente no disponible. Reintentando...');
    }
    
    if (message.includes('auth') || message.includes('unauthorized')) {
      return t('errors.auth', 'Por favor inicia sesión de nuevo para continuar.');
    }
    
    if (message.includes('forbidden')) {
      return t('errors.forbidden', 'No tienes permisos para realizar esta acción.');
    }
    
    return t('errors.generic', 'Algo salió mal. Por favor intenta de nuevo.');
  }

  private getSessionId(): string {
    // Generación simple de ID de sesión
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (!window.sessionStorage.getItem('sessionId')) {
        window.sessionStorage.setItem('sessionId', 
          Math.random().toString(36).substring(2, 15) + 
          Math.random().toString(36).substring(2, 15)
        );
      }
      return window.sessionStorage.getItem('sessionId') || 'unknown';
    }
    return 'unknown';
  }

  private async sendToMonitoringService(errorInfo: any): Promise<void> {
    try {
      // Aquí enviarías al servicio de monitoreo
      // Ejemplo de implementaciones:
      
      // Sentry
      // Sentry.captureException(new Error(errorInfo.message), {
      //   tags: { context: errorInfo.context, severity: errorInfo.severity },
      //   extra: errorInfo
      // });
      
      // Endpoint personalizado
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorInfo)
      // });
      
      // Error sería enviado al servicio de monitoreo
    } catch (monitoringError) {
      console.error('Falló el envío del error al servicio de monitoreo:', monitoringError);
    }
  }
}

// Exportar una instancia única del manejador de errores
export const errorHandler = new ErrorHandlerImpl();
