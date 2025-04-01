import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { generateDownloadUrl, deleteFile } from '@/lib/aws';

interface FileListProps {
  files: any[];
  isLoading: boolean;
  userId: string;
  onFileDeleted: () => void;
}

const FileList: React.FC<FileListProps> = ({ files, isLoading, userId, onFileDeleted }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      toast.loading('Preparing download...');
      
      // Get pre-signed download URL
      const { downloadUrl } = await generateDownloadUrl(fileKey);
      
      // Create a download link and trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.dismiss();
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (fileKey: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      toast.loading('Deleting file...');
      
      // Delete the file from S3
      await deleteFile(fileKey);
      
      toast.dismiss();
      toast.success('File deleted successfully');
      onFileDeleted();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.dismiss();
      toast.error('Failed to delete file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 border-4 border-cloud border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No files uploaded yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Size</TableHead>
            <TableHead className="hidden md:table-cell">Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id || file.fileKey}>
              <TableCell className="font-medium flex items-center gap-2">
                <FileIcon className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[150px]">{file.name || file.fileName || file.fileKey.split('/').pop()}</span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {formatFileSize(file.metadata?.size || file.size || 0)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDate(file.created_at || file.uploadedAt || file.lastModified)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(
                      file.fileKey || `users/${userId}/${file.name}`, 
                      (file.name || file.fileName || '').split('-').slice(1).join('-') || file.fileKey?.split('/').pop() || 'download'
                    )}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.fileKey || `users/${userId}/${file.name}`)}
                    title="Delete"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
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

export default FileList;
