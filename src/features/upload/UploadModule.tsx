
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { safeApiCall } from '@/lib/api-utils';
import { useAuth } from '@/contexts/AuthContext';

const UploadFeatureFallback = () => {
  return (
    <Alert className="border border-yellow-300 bg-yellow-50 text-yellow-900">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Upload feature unavailable</AlertTitle>
      <AlertDescription>
        The upload feature is temporarily unavailable. Please try again later.
      </AlertDescription>
    </Alert>
  );
};

const UploadModule: React.FC = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate module refresh (in a real app, you might re-fetch data)
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // If no user, we can't upload
  if (!user) {
    return (
      <Alert>
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>Please log in to upload files.</AlertDescription>
      </Alert>
    );
  }

  const handleUploadSuccess = async () => {
    // Simulating an API call to update file counts/stats
    await safeApiCall(
      async () => {
        // This would be a real API call in a production app
        return { success: true };
      },
      {
        onSuccess: () => console.log('Upload stats updated'),
        onError: (err) => console.error('Failed to update stats:', err),
        retries: 2
      }
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <h3 className="font-medium text-red-800">Upload Error</h3>
          <p className="text-red-700 text-sm">The file upload component failed to load.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-red-700"
            onClick={handleRefresh}
          >
            <RefreshCcw className="mr-1 h-3 w-3" />
            Retry Upload
          </Button>
        </div>
      }
      resetKeys={[isRefreshing]}
    >
      <div className="p-4 rounded-lg border bg-card">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        <FileUpload userId={user.id} onUploadSuccess={handleUploadSuccess} />
      </div>
    </ErrorBoundary>
  );
};

export default UploadModule;
