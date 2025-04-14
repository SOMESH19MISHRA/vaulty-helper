
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getFileByShareToken } from '@/lib/file-shares';
import { supabase } from '@/lib/supabase';
import { Download, FileQuestion, FileText, Image, FileIcon, File, Video, Music } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SharedFile = () => {
  const { token } = useParams<{ token: string }>();
  const [file, setFile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    async function fetchFile() {
      try {
        setIsLoading(true);
        const fileData = await getFileByShareToken(token);
        setFile(fileData);
      } catch (error) {
        console.error('Error fetching shared file:', error);
        toast.error('Failed to load shared file');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFile();
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const getFileIcon = () => {
    if (!file) return <FileQuestion className="h-12 w-12 text-gray-400" />;

    const fileType = file.type || '';
    
    if (fileType.startsWith('image/')) return <Image className="h-12 w-12 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="h-12 w-12 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="h-12 w-12 text-green-500" />;
    if (fileType.startsWith('text/')) return <FileText className="h-12 w-12 text-gray-600" />;
    if (fileType === 'application/pdf') return <File className="h-12 w-12 text-red-500" />;
    
    return <FileIcon className="h-12 w-12 text-gray-500" />;
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      setIsDownloading(true);
      toast.loading('Preparing download...');
      
      // Get file URL
      const { data, error } = await supabase.storage
        .from('cloudvault')
        .createSignedUrl(file.path, 60); // Valid for 60 seconds
      
      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Failed to generate download URL');
      }
      
      // Create a download link
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('Download started');
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Download failed: ${error.message}`);
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg glass-panel">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Shared File</CardTitle>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 border-4 border-cloud border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                  {getFileIcon()}
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">{file.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>File size: {formatFileSize(file.size)}</p>
                    <p>Uploaded {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileQuestion className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">File not found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This shared link may have expired or been removed
                </p>
              </div>
            )}
          </CardContent>
          
          {file && (
            <CardFooter className="flex justify-center pt-2">
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? 'Preparing...' : 'Download File'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

// Format file size as human-readable string
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default SharedFile;
