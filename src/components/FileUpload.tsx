
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  userId: string;
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ userId, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Size limit of 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit');
      return;
    }
    
    try {
      setIsUploading(true);
      const toastId = toast.loading('Uploading file...');
      
      // Create the file path with userId and timestamp
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      
      // Upload file directly to Supabase storage
      // Using the safe pattern without destructuring
      const uploadResponse = await supabase.storage
        .from('cloudvault')
        .upload(filePath, file);
      
      if (uploadResponse.error) {
        console.error('Failed to upload file:', uploadResponse.error.message);
        toast.dismiss(toastId);
        toast.error(`Failed to upload file: ${uploadResponse.error.message}`);
        return null;
      }
      
      console.log('File uploaded successfully to path:', filePath);
      toast.dismiss(toastId);
      toast.success('File uploaded successfully');
      
      onUploadSuccess();
      e.target.value = '';
      return filePath;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.dismiss();
      toast.error('Failed to upload file: ' + (error.message || 'Unknown error'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <label htmlFor="file-upload">
        <Button
          variant="outline"
          className="w-full border-dashed border-2 p-6 h-auto flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
          disabled={isUploading}
          asChild
        >
          <div>
            <Upload className="h-6 w-6 mb-2" />
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: 50MB
            </p>
          </div>
        </Button>
      </label>
    </div>
  );
};

export default FileUpload;
