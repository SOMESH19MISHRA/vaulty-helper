
import React, { useState, useEffect } from 'react';
import { Download, Trash, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileListSupabaseProps {
  userId: string;
  onFileDeleted: () => void;
  isLoading: boolean;
}

interface FileObject {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: any;
}

const FileListSupabase: React.FC<FileListSupabaseProps> = ({ userId, onFileDeleted, isLoading }) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(isLoading);
  
  // Fetch the files on component mount
  useEffect(() => {
    fetchFiles();
  }, [userId]);
  
  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .storage
        .from('cloudvault')
        .list(userId + '/');
      
      if (error) {
        console.error('Error listing files:', error);
        toast.error('Failed to load files');
        return;
      }
      
      setFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };
  
  const getSignedUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('cloudvault')
        .createSignedUrl(filePath, 60); // Expires in 60 seconds
        
      if (error) {
        console.error('Failed to generate signed URL:', error.message);
        toast.error('Failed to generate download link');
        return null;
      }
      
      return data.signedUrl;
    } catch (error: any) {
      console.error('Error creating signed URL:', error);
      toast.error('Failed to generate download link');
      return null;
    }
  };
  
  const downloadFile = async (fileName: string) => {
    try {
      const filePath = `${userId}/${fileName}`;
      toast.loading('Preparing download...');
      
      // Get signed URL for download
      const signedUrl = await getSignedUrl(filePath);
      
      if (!signedUrl) {
        toast.dismiss();
        return;
      }
      
      // Create a download link and trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName.split('_').slice(1).join('_'); // Remove timestamp from filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success('Download started');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.dismiss();
      toast.error(`Failed to download file: ${error.message}`);
    }
  };
  
  const deleteFile = async (fileName: string) => {
    try {
      const filePath = `${userId}/${fileName}`;
      
      const { error } = await supabase
        .storage
        .from('cloudvault')
        .remove([filePath]);
        
      if (error) {
        throw error;
      }
      
      toast.success('File deleted successfully');
      onFileDeleted();
      fetchFiles(); // Refresh the list
      
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(`Failed to delete file: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (files.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No files uploaded yet
      </div>
    );
  }
  
  return (
    <div className="space-y-2 mt-4">
      <h3 className="font-medium mb-2">Your Files</h3>
      <ul className="space-y-2">
        {files.map((file) => {
          // Extract original filename (remove timestamp)
          const originalName = file.name.split('_').slice(1).join('_');
          
          return (
            <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2 overflow-hidden">
                <File className="h-4 w-4 flex-shrink-0" />
                <span className="truncate" title={originalName}>{originalName}</span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => downloadFile(file.name)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteFile(file.name)}
                  title="Delete"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FileListSupabase;
