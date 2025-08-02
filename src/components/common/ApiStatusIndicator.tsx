import React from 'react';
import { AlertCircle, CheckCircle, WifiOff, RefreshCw } from 'lucide-react';
import { useApiHealth } from '../../hooks/useApiHealth';
import { CircuitState } from '../../lib/circuitBreaker';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Badge } from '../ui/badge';

interface ApiStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function ApiStatusIndicator({ 
  className = '', 
  showDetails = false 
}: ApiStatusIndicatorProps) {
  const { status, checkHealth, resetCircuitBreaker } = useApiHealth();

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (status.circuitState === CircuitState.OPEN) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (status.circuitState === CircuitState.HALF_OPEN) {
      return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!status.isOnline) {
      return 'Sin conexión a internet';
    }
    
    if (status.circuitState === CircuitState.OPEN) {
      return 'API no disponible';
    }
    
    if (status.circuitState === CircuitState.HALF_OPEN) {
      return 'Reconectando...';
    }
    
    return 'Conectado';
  };

  const getStatusColor = () => {
    if (!status.isOnline || status.circuitState === CircuitState.OPEN) {
      return 'destructive';
    }
    
    if (status.circuitState === CircuitState.HALF_OPEN) {
      return 'secondary';
    }
    
    return 'default';
  };

  const getTooltipContent = () => {
    const lines = [
      `Estado: ${getStatusText()}`,
      `Conexión: ${status.isOnline ? 'Online' : 'Offline'}`,
      `Circuit Breaker: ${status.circuitState}`,
    ];

    if (status.failureCount > 0) {
      lines.push(`Fallos: ${status.failureCount}`);
    }

    if (status.successCount > 0) {
      lines.push(`Éxitos: ${status.successCount}`);
    }

    if (status.lastError) {
      lines.push(`Último error: ${status.lastError}`);
    }

    if (status.lastSuccessTime) {
      const lastSuccess = new Date(status.lastSuccessTime).toLocaleTimeString();
      lines.push(`Último éxito: ${lastSuccess}`);
    }

    return lines.join('\n');
  };

  const handleRetry = async () => {
    if (status.circuitState === CircuitState.OPEN) {
      resetCircuitBreaker();
    }
    await checkHealth();
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 ${className}`}>
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <pre className="text-xs whitespace-pre-wrap">{getTooltipContent()}</pre>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${className}`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge variant={getStatusColor() as any}>
          {getStatusText()}
        </Badge>
      </div>
      
      {showDetails && (
        <div className="flex-1 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-2">
            <div>Fallos: {status.failureCount}</div>
            <div>Éxitos: {status.successCount}</div>
            {status.lastError && (
              <div className="col-span-2 text-red-500 text-xs truncate">
                Error: {status.lastError}
              </div>
            )}
          </div>
        </div>
      )}
      
      {(status.circuitState === CircuitState.OPEN || !status.isApiHealthy) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="ml-auto"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

// Componente compacto para la barra de estado
export function ApiStatusBadge({ className = '' }: { className?: string }) {
  return <ApiStatusIndicator className={className} showDetails={false} />;
}

// Componente expandido para configuraciones o dashboards
export function ApiStatusPanel({ className = '' }: { className?: string }) {
  return <ApiStatusIndicator className={className} showDetails={true} />;
}