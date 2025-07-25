import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ConnectionStatus } from '../shared/ConnectionStatus';
import { useUserData } from '../../hooks/useUserData';
import { useCollections } from '../../hooks/useCollections';
import { useLocalization } from '../../hooks/useLocalization';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Lazy load components for better performance
const CollectionList = lazy(() => import('../pokemon/CollectionList'));
const StatsOverview = lazy(() => import('./StatsOverview'));
const RecentActivity = lazy(() => import('./RecentActivity'));

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const { t } = useLocalization();
  
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          {t('dashboard.error.title', 'Something went wrong')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-700 mb-4">
          {t('dashboard.error.description', 'There was an error loading this section.')}
        </p>
        <Button 
          onClick={resetErrorBoundary}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.retry', 'Try again')}
        </Button>
      </CardContent>
    </Card>
  );
}

// Loading component
function LoadingCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </CardContent>
    </Card>
  );
}

// Main dashboard component
export const OptimizedDashboard: React.FC = () => {
  const { t } = useLocalization();
  const { 
    userData, 
    isLoading: userLoading, 
    error: userError, 
    connectionStatus,
    refetchUserData 
  } = useUserData();
  
  const { 
    collections, 
    isLoading: collectionsLoading, 
    error: collectionsError,
    refetchCollections 
  } = useCollections({ 
    limit: 10, 
    enableRealtime: true 
  });

  // Show connection status if there are issues
  const showConnectionStatus = connectionStatus.isConnecting || 
                              connectionStatus.isRetrying || 
                              connectionStatus.error;

  const handleRetry = () => {
    refetchUserData();
    refetchCollections();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Connection Status */}
      {showConnectionStatus && (
        <ConnectionStatus
          isConnecting={connectionStatus.isConnecting}
          isRetrying={connectionStatus.isRetrying}
          retryAttempt={connectionStatus.retryAttempt}
          maxAttempts={4}
          error={connectionStatus.error}
          onRetry={handleRetry}
          className="mb-6"
        />
      )}

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome', 'Welcome back')}
            {userData?.full_name && `, ${userData.full_name}`}!
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.subtitle', 'Manage your Pokémon card collection')}
          </p>
        </div>
        
        {(userError || collectionsError) && (
          <Button 
            onClick={handleRetry}
            variant="outline"
            size="sm"
            disabled={userLoading || collectionsLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(userLoading || collectionsLoading) ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Refresh')}
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingCard title={t('dashboard.stats.title', 'Collection Stats')} />}>
          <StatsOverview 
            isLoading={userLoading || collectionsLoading}
            userData={userData}
            collections={collections}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections */}
        <div className="lg:col-span-2">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingCard title={t('dashboard.collections.title', 'Recent Collections')} />}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {t('dashboard.collections.title', 'Recent Collections')}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={refetchCollections}
                      disabled={collectionsLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${collectionsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collectionsError ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {t('dashboard.collections.error', 'Failed to load collections')}
                      </p>
                    </div>
                  ) : (
                    <CollectionList 
                      collections={collections}
                      isLoading={collectionsLoading}
                      onCollectionSelect={() => {}}
                      onCreateCollection={() => {}}
                      onEditCollection={() => {}}
                      onDeleteCollection={() => {}}
                    />
                  )}
                </CardContent>
              </Card>
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Recent Activity */}
        <div>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingCard title={t('dashboard.activity.title', 'Recent Activity')} />}>
              <RecentActivity 
                isLoading={userLoading}
                userData={userData}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Performance Metrics (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🔧 Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">User Data:</span>
                <span className={`ml-2 ${userLoading ? 'text-yellow-600' : userError ? 'text-red-600' : 'text-green-600'}`}>
                  {userLoading ? 'Loading...' : userError ? 'Error' : 'Loaded'}
                </span>
              </div>
              <div>
                <span className="font-medium">Collections:</span>
                <span className={`ml-2 ${collectionsLoading ? 'text-yellow-600' : collectionsError ? 'text-red-600' : 'text-green-600'}`}>
                  {collectionsLoading ? 'Loading...' : collectionsError ? 'Error' : `${collections.length} items`}
                </span>
              </div>
              <div>
                <span className="font-medium">Connection:</span>
                <span className={`ml-2 ${
                  connectionStatus.isConnecting ? 'text-blue-600' :
                  connectionStatus.isRetrying ? 'text-yellow-600' :
                  connectionStatus.error ? 'text-red-600' : 'text-green-600'
                }`}>
                  {connectionStatus.isConnecting ? 'Connecting...' :
                   connectionStatus.isRetrying ? `Retry ${connectionStatus.retryAttempt}` :
                   connectionStatus.error ? 'Error' : 'Connected'}
                </span>
              </div>
              <div>
                <span className="font-medium">Cache:</span>
                <span className="ml-2 text-blue-600">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedDashboard;