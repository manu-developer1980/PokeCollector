import { supabase } from '../../supabase/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Manager para manejar conexiones WebSocket de manera más robusta
class WebSocketManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private pendingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private mountedComponents: Set<string> = new Set();

  // Crear una suscripción con manejo robusto de errores
  createSubscription(
    channelId: string,
    componentId: string,
    config: {
      table: string;
      filter?: string;
      event?: string;
      schema?: string;
    },
    callback: (payload: any) => void,
    options: {
      delay?: number;
      onError?: (error: any) => void;
    } = {}
  ): () => void {
    const { delay = 100, onError } = options;
    const { table, filter, event = '*', schema = 'public' } = config;

    // Marcar componente como montado
    this.mountedComponents.add(componentId);

    // Limpiar suscripción existente si existe
    this.cleanup(channelId);

    // Crear suscripción con delay para evitar conexiones inmediatas
    const timeout = setTimeout(() => {
      // Verificar si el componente sigue montado
      if (!this.mountedComponents.has(componentId)) {
        return;
      }

      try {
        const channel = supabase
          .channel(channelId)
          .on(
            'postgres_changes' as any,
            {
              event,
              schema,
              table,
              ...(filter && { filter }),
            },
            (payload) => {
              // Solo procesar si el componente sigue montado
              if (this.mountedComponents.has(componentId)) {
                callback(payload);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn(`WebSocket connection error for channel ${channelId}`);
              if (onError) {
                onError(new Error(`WebSocket connection failed for ${channelId}`));
              }
            }
          });

        this.channels.set(channelId, channel);
      } catch (error) {
        console.warn(`Failed to create WebSocket subscription for ${channelId}:`, error);
        if (onError) {
          onError(error);
        }
      }
    }, delay);

    this.pendingTimeouts.set(channelId, timeout);

    // Retornar función de limpieza
    return () => {
      this.cleanup(channelId);
      this.mountedComponents.delete(componentId);
    };
  }

  // Limpiar una suscripción específica
  private cleanup(channelId: string): void {
    // Limpiar timeout pendiente
    const timeout = this.pendingTimeouts.get(channelId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingTimeouts.delete(channelId);
    }

    // Limpiar canal existente
    const existingChannel = this.channels.get(channelId);
    if (existingChannel) {
      try {
        supabase.removeChannel(existingChannel);
      } catch (error) {
        // Ignorar errores de limpieza
      }
      this.channels.delete(channelId);
    }
  }

  // Limpiar todas las suscripciones de un componente
  cleanupComponent(componentId: string): void {
    this.mountedComponents.delete(componentId);
    
    // Encontrar y limpiar todos los canales de este componente
    const channelsToClean: string[] = [];
    this.channels.forEach((_, channelId) => {
      if (channelId.includes(componentId)) {
        channelsToClean.push(channelId);
      }
    });

    channelsToClean.forEach(channelId => this.cleanup(channelId));
  }

  // Limpiar todas las suscripciones
  cleanupAll(): void {
    this.pendingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pendingTimeouts.clear();

    this.channels.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        // Ignorar errores de limpieza
      }
    });
    this.channels.clear();
    this.mountedComponents.clear();
  }

  // Verificar si un componente está montado
  isComponentMounted(componentId: string): boolean {
    return this.mountedComponents.has(componentId);
  }

  // Obtener estadísticas de conexiones activas
  getStats(): {
    activeChannels: number;
    pendingTimeouts: number;
    mountedComponents: number;
  } {
    return {
      activeChannels: this.channels.size,
      pendingTimeouts: this.pendingTimeouts.size,
      mountedComponents: this.mountedComponents.size,
    };
  }
}

// Instancia singleton del manager
export const websocketManager = new WebSocketManager();

// Limpiar todas las conexiones cuando la página se descarga
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    websocketManager.cleanupAll();
  });

  // También limpiar en caso de errores no manejados
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebSocket')) {
      console.warn('WebSocket error detected, cleaning up connections');
    }
  });
}

export default websocketManager;