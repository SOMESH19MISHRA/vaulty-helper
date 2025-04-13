
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Download, Eye, Trash2, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatBytes } from '@/lib/utils';
import { format } from 'date-fns';
import { deleteFile, generateDownloadUrl } from '@/lib/aws';

interface FilesListProps {
  userId: string;
  onFileDeleted?: () => void;
  onStorageUpdated?: (newUsage: number) => void;
}

interface FileItem {
  id: string;
  filename: string;
  size: number;
  s3_key: string;
  s3_url: string;
  uploaded_at: string;
  user_id: string;
}

const FilesList: React.FC<FilesListProps> = ({ 
  userId, 
  onFileDeleted,
  onStorageUpdated 
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [userId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load your files');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (fileKey: string, fileName: string) => {
    try {
      setProcessingFileId(fileKey);
      const { downloadUrl } = await generateDownloadUrl(fileKey);
      
      // Open the file in a new tab
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error generating preview URL:', error);
      toast.error('Failed to generate preview URL');
    } finally {
      setProcessingFileId(null);
    }
  };

  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      setProcessingFileId(fileKey);
      const { downloadUrl } = await generateDownloadUrl(fileKey);
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setProcessingFileId(null);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (confirm(`Are you sure you want to delete ${file.filename}?`)) {
      try {
        setDeletingFileId(file.id);
        
        // Delete file from S3
        await deleteFile(file.s3_key);
        
        // Delete metadata from Supabase
        const { error } = await supabase
          .from('files')
          .delete()
          .eq('id', file.id);
        
        if (error) {
          throw error;
        }
        
        // Recalculate user's storage usage
        const { data: remainingFiles, error: filesError } = await supabase
          .from('files')
          .select('size')
          .eq('user_id', userId);
        
        if (filesError) {
          console.error('Error fetching file sizes:', filesError);
        } else {
          const newTotalBytes = (remainingFiles || []).reduce((total, file) => total + (file.size || 0), 0);
          
          // Update storage usage in Supabase
          await supabase
            .from('storage_usage')
            .upsert({
              user_id: userId,
              total_bytes: newTotalBytes,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          
          // Notify parent components about the storage update
          if (onStorageUpdated) {
            onStorageUpdated(newTotalBytes);
          }
        }
        
        // Remove file from list
        setFiles(files.filter(f => f.id !== file.id));
        
        toast.success('File deleted successfully');
        
        // Notify parent component about deletion
        if (onFileDeleted) {
          onFileDeleted();
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      } finally {
        setDeletingFileId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-gray-500">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map(file => (
            <TableRow key={file.id}>
              <TableCell className="font-medium truncate max-w-[200px]">
                {file.filename}
              </TableCell>
              <TableCell>{formatBytes(file.size)}</TableCell>
              <TableCell>{format(new Date(file.uploaded_at), 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreview(file.s3_key, file.filename)}
                    disabled={processingFileId === file.s3_key}
                  >
                    {processingFileId === file.s3_key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(file.s3_key, file.filename)}
                    disabled={processingFileId === file.s3_key}
                  >
                    {processingFileId === file.s3_key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(file)}
                    disabled={deletingFileId === file.id}
                  >
                    {deletingFileId === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FilesList;
