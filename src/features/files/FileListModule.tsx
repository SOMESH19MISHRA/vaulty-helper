
import React, { useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import FileListSupabase from '@/components/FileListSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const FileListModule: React.FC = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return <p>Please log in to view your files.</p>;
  }

  return (
    <ErrorBoundary 
      resetKeys={[refreshKey]}
      fallback={
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">Unable to load file list.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handleRefresh}
          >
            <RefreshCcw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Your Files</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          <FileListSupabase 
            userId={user.id} 
            onFileDeleted={handleRefresh}
            isLoading={isLoading}
            key={`filelist-${refreshKey}`}
          />
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default FileListModule;
