
import React, { useState, useEffect } from 'react';
import { Download, Trash, File, Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

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
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  
  // Fetch the files on component mount
  useEffect(() => {
    fetchFiles();
  }, [userId]);
  
  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const listResponse = await supabase
        .storage
        .from('cloudvault')
        .list(userId + '/');
      
      if (listResponse.error) {
        console.error('Error listing files:', listResponse.error);
        toast.error('Failed to load files');
        return;
      }
      
      setFiles(listResponse.data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };
  
  const getSignedUrl = async (filePath: string) => {
    try {
      const urlResponse = await supabase
        .storage
        .from('cloudvault')
        .createSignedUrl(filePath, 60); // Expires in 60 seconds
        
      if (urlResponse.error) {
        console.error('Failed to generate signed URL:', urlResponse.error.message);
        toast.error('Failed to generate download link');
        return null;
      }
      
      return urlResponse.data.signedUrl;
    } catch (error: any) {
      console.error('Error creating signed URL:', error);
      toast.error('Failed to generate download link');
      return null;
    }
  };
  
  const downloadFile = async (fileName: string) => {
    try {
      const filePath = `${userId}/${fileName}`;
      const toastId = toast.loading('Preparing download...');
      
      // Get signed URL for download
      const signedUrl = await getSignedUrl(filePath);
      
      if (!signedUrl) {
        toast.dismiss(toastId);
        return;
      }
      
      // Create a download link and trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName.split('_').slice(1).join('_'); // Remove timestamp from filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(toastId);
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
      const toastId = toast.loading('Deleting file...');
      
      const deleteResponse = await supabase
        .storage
        .from('cloudvault')
        .remove([filePath]);
        
      if (deleteResponse.error) {
        toast.dismiss(toastId);
        toast.error(`Failed to delete file: ${deleteResponse.error.message}`);
        return;
      }
      
      toast.dismiss(toastId);
      toast.success('File deleted successfully');
      onFileDeleted();
      fetchFiles(); // Refresh the list
      
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(`Failed to delete file: ${error.message}`);
    }
  };

  const startRenameFile = (fileName: string) => {
    setEditingFile(fileName);
    // Initialize with the original filename without the timestamp
    setNewFileName(fileName.split('_').slice(1).join('_'));
  };

  const cancelRenameFile = () => {
    setEditingFile(null);
    setNewFileName('');
  };

  const renameFile = async (oldFileName: string) => {
    try {
      if (!newFileName.trim()) {
        toast.error('Filename cannot be empty');
        return;
      }

      const toastId = toast.loading('Renaming file...');
      const oldPath = `${userId}/${oldFileName}`;
      const timestamp = oldFileName.split('_')[0]; // Keep the original timestamp
      const newPath = `${userId}/${timestamp}_${newFileName}`;

      // Get the file data using a signed URL
      const signedUrl = await getSignedUrl(oldPath);
      if (!signedUrl) {
        toast.dismiss(toastId);
        toast.error('Failed to access file for renaming');
        return;
      }

      // Download the file
      const fileResponse = await fetch(signedUrl);
      if (!fileResponse.ok) {
        toast.dismiss(toastId);
        toast.error('Failed to download file for renaming');
        return;
      }

      const fileBlob = await fileResponse.blob();

      // Upload to the new path
      const uploadResponse = await supabase
        .storage
        .from('cloudvault')
        .upload(newPath, fileBlob, {
          upsert: true
        });

      if (uploadResponse.error) {
        toast.dismiss(toastId);
        toast.error(`Failed to upload with new name: ${uploadResponse.error.message}`);
        return;
      }

      // Delete the old file
      const deleteResponse = await supabase
        .storage
        .from('cloudvault')
        .remove([oldPath]);

      if (deleteResponse.error) {
        toast.dismiss(toastId);
        toast.error(`Failed to remove old file: ${deleteResponse.error.message}`);
        // Note: At this point, the file exists in both locations
        return;
      }

      toast.dismiss(toastId);
      toast.success('File renamed successfully');
      setEditingFile(null);
      fetchFiles(); // Refresh the list
    } catch (error: any) {
      console.error('Error renaming file:', error);
      toast.error(`Failed to rename file: ${error.message}`);
      setEditingFile(null);
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
              {editingFile === file.name ? (
                <div className="flex items-center space-x-2 flex-1 mr-2">
                  <File className="h-4 w-4 flex-shrink-0" />
                  <Input 
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="h-7 text-sm py-0"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2 overflow-hidden">
                  <File className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate" title={originalName}>{originalName}</span>
                </div>
              )}
              
              <div className="flex space-x-1">
                {editingFile === file.name ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => renameFile(file.name)}
                      title="Save"
                      className="text-green-500 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelRenameFile}
                      title="Cancel"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
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
                      onClick={() => startRenameFile(file.name)}
                      title="Rename"
                    >
                      <Edit2 className="h-4 w-4" />
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
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FileListSupabase;
