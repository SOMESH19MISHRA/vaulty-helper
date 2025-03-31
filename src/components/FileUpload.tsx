
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { generateUploadUrl, uploadFileWithPresignedUrl } from '@/lib/aws';

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
    
    // Increase file size limit to 50MB (from 5MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // 1. Generate a pre-signed URL for direct upload to S3
      const { uploadUrl, fileKey } = await generateUploadUrl(
        file.name,
        file.type,
        userId
      );
      
      // 2. Upload the file directly to S3 using the pre-signed URL
      await uploadFileWithPresignedUrl(file, uploadUrl, file.type);
      
      // 3. Store a reference to the file in Supabase
      const { error } = await storeFileReference(userId, fileKey, file.name, file.type, file.size);
      
      if (error) throw error;
      
      toast.success('File uploaded successfully to S3');
      onUploadSuccess();
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to store file metadata in Supabase
  const storeFileReference = async (
    userId: string, 
    fileKey: string, 
    fileName: string, 
    fileType: string, 
    fileSize: number
  ) => {
    const { data, error } = await fetch('/api/store-file-reference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fileKey,
        fileName,
        fileType,
        fileSize
      }),
    }).then(res => res.json());
    
    return { data, error };
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
