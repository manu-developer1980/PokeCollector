import { ToastOptions } from "@/components/ui/use-toast";

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
    toast: (props: ToastOptions) => void,
    t: any
  ) => {
    message: string;
    handled: boolean;
  };

  /**
   * Registra un error en el sistema de logging
   * @param error El error a registrar
   * @param context Contexto adicional sobre dónde ocurrió el error
   */
  logError: (error: unknown, context: string) => void;
}

/**
 * Implementación del manejador de errores
 */
class ErrorHandlerImpl implements ErrorHandler {
  /**
   * Maneja un error y muestra un toast
   */
  handleError(
    error: unknown,
    context: string,
    toast: (props: ToastOptions) => void,
    t: any
  ) {
    // Registrar el error
    this.logError(error, context);

    // Determinar el mensaje de error
    let message = t("errors.generic", "Ha ocurrido un error inesperado");
    let errorCode = "";

    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      message = error.message;
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

    // Mostrar toast con el error
    toast({
      title: t("common.error"),
      description: message,
      variant: "destructive",
    });

    return {
      message,
      handled: true,
      errorCode,
    };
  }

  /**
   * Registra un error en el sistema de logging
   */
  logError(error: unknown, context: string) {
    // En producción, aquí podríamos enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV !== "production") {
      console.error(`Error en ${context}:`, error);
    }
  }
}

// Exportar una instancia única del manejador de errores
export const errorHandler = new ErrorHandlerImpl();
