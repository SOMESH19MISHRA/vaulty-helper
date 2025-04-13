
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface S3FileUploadProps {
  onUploadSuccess?: (fileData: { key: string; url: string }) => void;
  maxSizeMB?: number;
}

const S3FileUpload: React.FC<S3FileUploadProps> = ({ 
  onUploadSuccess,
  maxSizeMB = 50 // Default max size: 50MB
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // Size limit check
    if (file.size > maxSizeBytes) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(10); // Initial progress indicator
      
      // Step 1: Get the presigned URL from our API
      const presignedUrlResponse = await fetch('/api/upload-to-s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });
      
      if (!presignedUrlResponse.ok) {
        const errorData = await presignedUrlResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }
      
      setUploadProgress(30); // Update progress
      
      // Step 2: Get the upload URL from the response
      const { uploadUrl, key, bucket, region } = await presignedUrlResponse.json();
      
      // Step 3: Upload the file directly to S3 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      
      setUploadProgress(90); // Almost done
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
      
      setUploadProgress(100); // Complete
      
      // Generate the public URL for the uploaded file
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      
      // Success notification
      toast.success('File uploaded successfully to S3');
      
      // Call the callback if provided
      if (onUploadSuccess) {
        onUploadSuccess({
          key,
          url: fileUrl
        });
      }
      
      // Reset the file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Reset states after a short delay to show completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <input
        type="file"
        id="s3-file-upload"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <label htmlFor="s3-file-upload">
        <Button
          variant="outline"
          className="w-full border-dashed border-2 p-6 h-auto flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
          disabled={isUploading}
          asChild
        >
          <div>
            <Upload className="h-6 w-6 mb-2" />
            <span>{isUploading ? 'Uploading...' : 'Upload to S3'}</span>
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: {maxSizeMB}MB
            </p>
          </div>
        </Button>
      </label>
      
      {isUploading && (
        <div className="w-full">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center mt-1 text-muted-foreground">
            {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default S3FileUpload;
