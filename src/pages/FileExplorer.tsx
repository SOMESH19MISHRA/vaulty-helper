
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorBoundary from '@/components/ErrorBoundary';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

// Lazy load the FileListModule to improve initial page load
const FileListModule = lazy(() => 
  import('@/features/files/FileListModule')
);

const FileExplorer: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Files | CloudVault</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Your Files</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ErrorBoundary>
            <Suspense fallback={
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            }>
              <FileListModule />
            </Suspense>
          </ErrorBoundary>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Used: 2.4 GB</p>
              <p>Total: 10 GB</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full w-1/4"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-blue-600 cursor-pointer hover:underline">New Folder</p>
              <p className="text-blue-600 cursor-pointer hover:underline">Sort by Date</p>
              <p className="text-blue-600 cursor-pointer hover:underline">Filter Documents</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
