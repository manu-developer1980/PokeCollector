/**
 * Circuit Breaker para manejar fallos de API externa
 * Implementa el patrón Circuit Breaker para detectar fallos y usar alternativas
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Funcionando normalmente
  OPEN = 'OPEN',         // Fallando, no hacer peticiones
  HALF_OPEN = 'HALF_OPEN' // Probando si se ha recuperado
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Número de fallos antes de abrir el circuito
  recoveryTimeout: number;     // Tiempo antes de intentar recuperación (ms)
  monitoringPeriod: number;    // Período de monitoreo para resetear contadores (ms)
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private nextAttempt = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN - operation not allowed');
      }
      // Transición a HALF_OPEN para probar
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    this.lastSuccessTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Recuperación exitosa, cerrar el circuito
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    }
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttempt = 0;
  }

  // Método para forzar el estado (útil para testing)
  forceState(state: CircuitState): void {
    this.state = state;
    if (state === CircuitState.OPEN) {
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    }
  }
}

// Instancia global del circuit breaker para la API de Pokémon
export const pokemonApiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,        // 5 fallos consecutivos
  recoveryTimeout: 30000,     // 30 segundos antes de reintentar
  monitoringPeriod: 60000     // 1 minuto de período de monitoreo
});