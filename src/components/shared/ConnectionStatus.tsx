import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff, Clock } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';

export interface ConnectionStatusProps {
  isConnecting?: boolean;
  isRetrying?: boolean;
  retryAttempt?: number;
  maxAttempts?: number;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnecting = false,
  isRetrying = false,
  retryAttempt = 0,
  maxAttempts = 3,
  error = null,
  onRetry,
  className = ''
}) => {
  const { t } = useLocalization();
  const [dots, setDots] = useState('');

  // Animated dots for loading states
  useEffect(() => {
    if (!isConnecting && !isRetrying) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isConnecting, isRetrying]);

  if (!isConnecting && !isRetrying && !error) {
    return null;
  }

  const getStatusContent = () => {
    if (error && !isRetrying) {
      return {
        icon: <WifiOff className="w-5 h-5 text-red-500" />,
        message: t('connection.error', 'Connection failed'),
        description: error.message,
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800'
      };
    }

    if (isRetrying) {
      return {
        icon: <Clock className="w-5 h-5 text-yellow-500 animate-spin" />,
        message: t('connection.retrying', 'Reconnecting') + dots,
        description: t('connection.retryAttempt', `Attempt ${retryAttempt} of ${maxAttempts}. Server may be starting up...`),
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-800'
      };
    }

    if (isConnecting) {
      return {
        icon: <Wifi className="w-5 h-5 text-blue-500 animate-pulse" />,
        message: t('connection.connecting', 'Connecting') + dots,
        description: t('connection.initializing', 'Initializing connection...'),
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800'
      };
    }

    return null;
  };

  const statusContent = getStatusContent();
  if (!statusContent) return null;

  return (
    <div className={`rounded-lg border p-4 ${statusContent.bgColor} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {statusContent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${statusContent.textColor}`}>
            {statusContent.message}
          </div>
          {statusContent.description && (
            <div className={`text-xs mt-1 ${statusContent.textColor} opacity-75`}>
              {statusContent.description}
            </div>
          )}
          {error && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 transition-colors"
            >
              {t('connection.retry', 'Retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook para manejar el estado de conexión
export const useConnectionStatus = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const startConnecting = () => {
    setIsConnecting(true);
    setIsRetrying(false);
    setError(null);
    setRetryAttempt(0);
  };

  const startRetrying = (attempt: number) => {
    setIsConnecting(false);
    setIsRetrying(true);
    setRetryAttempt(attempt);
    setError(null);
  };

  const setConnectionError = (err: Error) => {
    setIsConnecting(false);
    setIsRetrying(false);
    setError(err);
  };

  const clearStatus = () => {
    setIsConnecting(false);
    setIsRetrying(false);
    setError(null);
    setRetryAttempt(0);
  };

  return {
    isConnecting,
    isRetrying,
    retryAttempt,
    error,
    startConnecting,
    startRetrying,
    setConnectionError,
    clearStatus
  };
};