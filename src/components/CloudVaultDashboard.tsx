
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import S3Uploader from './S3Uploader';
import FilesList from './FilesList';
import StorageUsage from './StorageUsage';
import { getUserStorageInfo } from '@/lib/aws';

const CloudVaultDashboard: React.FC = () => {
  const { user } = useAuth();
  const [storageInfo, setStorageInfo] = useState({
    usedBytes: 0,
    isPremium: false,
    storageLimit: 250 * 1024 * 1024 // Default to free tier
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStorageInfo();
    }
  }, [user]);

  const fetchStorageInfo = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const info = await getUserStorageInfo(user.id);
      setStorageInfo(info);
    } catch (error) {
      console.error('Error fetching storage info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStorageUpdated = (newUsage: number) => {
    setStorageInfo(prev => ({
      ...prev,
      usedBytes: newUsage
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Files</CardTitle>
              <CardDescription>Manage your secure cloud storage</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="files" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="files">
                  <FilesList 
                    userId={user.id} 
                    onFileDeleted={fetchStorageInfo} 
                    onStorageUpdated={handleStorageUpdated}
                  />
                </TabsContent>
                <TabsContent value="upload">
                  <S3Uploader
                    userId={user.id}
                    isPremium={storageInfo.isPremium}
                    currentUsage={storageInfo.usedBytes}
                    onUploadSuccess={() => fetchStorageInfo()}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <StorageUsage
            usedBytes={storageInfo.usedBytes}
            totalBytes={storageInfo.storageLimit}
            isPremium={storageInfo.isPremium}
            className="mb-6"
          />
          
          {!storageInfo.isPremium && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upgrade to Premium</CardTitle>
                <CardDescription>Get more storage and features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Increase storage to 10GB
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Upload files up to 1GB each
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Advanced file versioning
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <a 
                  href="/pricing" 
                  className="block w-full text-center bg-gradient-to-r from-amber-400 to-amber-600 text-white py-2 rounded-md font-medium hover:from-amber-500 hover:to-amber-700 transition-all"
                >
                  Upgrade Now
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudVaultDashboard;
