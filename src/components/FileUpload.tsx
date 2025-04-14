
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
      
      // Upload file directly to Supabase storage with improved error handling
      let uploadResult = null;
      
      try {
        const uploadResponse = await supabase.storage
          .from('cloudvault')
          .upload(filePath, file);
        
        if (uploadResponse.error) {
          console.error('Upload error details:', uploadResponse.error);
          // Check for RLS policy violation
          if (uploadResponse.error.message?.includes('violates row-level security policy')) {
            toast.dismiss(toastId);
            toast.error('Permission denied: Storage bucket access restricted');
            return null;
          }
          
          toast.dismiss(toastId);
          toast.error(`Failed to upload file: ${uploadResponse.error.message}`);
          return null;
        }
        
        uploadResult = filePath;
      } catch (uploadError: any) {
        console.error('Exception during upload:', uploadError);
        toast.dismiss(toastId);
        toast.error(`Upload exception: ${uploadError.message || 'Unknown error'}`);
        return null;
      }
      
      if (uploadResult) {
        console.log('File uploaded successfully to path:', uploadResult);
        toast.dismiss(toastId);
        toast.success('File uploaded successfully');
        
        onUploadSuccess();
        e.target.value = '';
      }
      
      return uploadResult;
    } catch (error: any) {
      console.error('Error in upload process:', error);
      toast.dismiss();
      toast.error('Upload process error: ' + (error.message || 'Unknown error'));
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
