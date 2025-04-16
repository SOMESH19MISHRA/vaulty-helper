
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorBoundary from '@/components/ErrorBoundary';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { Helmet } from 'react-helmet';

const SharedFilesPlaceholder = () => (
  <div className="p-8 text-center">
    <h3 className="text-xl font-semibold mb-2">File Sharing Coming Soon</h3>
    <p className="text-muted-foreground">
      This feature is currently in development and will be available soon.
    </p>
  </div>
);

const SharedFiles: React.FC = () => {
  const sharingEnabled = isFeatureEnabled('ENABLE_FILE_SHARING');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Shared Files | CloudVault</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Shared Files</h1>
      
      <ErrorBoundary>
        {sharingEnabled ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Shared with You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No files have been shared with you yet.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shared by You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">You haven't shared any files yet.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Share Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Configure your sharing preferences.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent>
              <SharedFilesPlaceholder />
            </CardContent>
          </Card>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default SharedFiles;
