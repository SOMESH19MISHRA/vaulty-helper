
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_FILE_SIZE_FREE } from '@/lib/aws';
import { formatBytes } from '@/lib/utils';

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
    
    // Check file size limit
    if (file.size > MAX_FILE_SIZE_FREE) {
      toast.error(`File size exceeds ${formatBytes(MAX_FILE_SIZE_FREE)} limit`);
      return;
    }
    
    try {
      setIsUploading(true);
      const toastId = toast.loading('Preparing upload...');
      console.log('Starting S3 upload process for file:', file.name);
      
      // Step 1: Get presigned URL from our API
      console.log('Requesting presigned URL from /api/upload-to-s3');
      const presignedResponse = await fetch('/api/upload-to-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId
        }),
      });
      
      if (!presignedResponse.ok) {
        const errorText = await presignedResponse.text();
        console.error('Presigned URL request failed:', errorText);
        toast.dismiss(toastId);
        toast.error(errorText || 'Failed to get upload URL');
        return;
      }
      
      // Step 2: Extract the upload URL and key from the response
      const presignedData = await presignedResponse.json();
      console.log('Received presigned URL data:', presignedData);
      const { uploadUrl, key, bucket, region } = presignedData;
      
      // Step 3: Upload the file directly to S3 using the presigned URL
      console.log('Uploading file directly to S3 using presigned URL');
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', errorText);
        toast.dismiss(toastId);
        toast.error(`Upload failed with status: ${uploadResponse.status}`);
        return;
      }
      
      console.log('File uploaded successfully to S3');
      
      // Generate the URL for the uploaded file
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      console.log('Generated S3 file URL:', fileUrl);
      
      // Step 4: Update Supabase metadata after successful upload
      console.log('Updating file metadata in Supabase');
      const metadataResponse = await fetch('/api/update-file-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          s3Key: key,
          s3Url: fileUrl,
          userId
        }),
      });
      
      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        console.error('Metadata update failed:', errorText);
        toast.dismiss(toastId);
        toast.error('Failed to update file metadata');
        return;
      }
      
      const metadataResult = await metadataResponse.json();
      console.log('Metadata update result:', metadataResult);
      
      toast.dismiss(toastId);
      toast.success('File uploaded successfully to AWS S3');
      
      onUploadSuccess();
      e.target.value = '';
    } catch (error: any) {
      console.error('Error in upload process:', error);
      toast.dismiss();
      toast.error('Upload process error: ' + (error.message || 'Unknown error'));
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
            <span>{isUploading ? 'Uploading to AWS S3...' : 'Upload File to S3'}</span>
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: {formatBytes(MAX_FILE_SIZE_FREE)}
            </p>
          </div>
        </Button>
      </label>
    </div>
  );
};

export default FileUpload;
