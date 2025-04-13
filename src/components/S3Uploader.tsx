
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileX, FileCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatBytes } from '@/lib/utils';

interface S3UploaderProps {
  userId: string;
  isPremium?: boolean;
  onUploadSuccess?: (fileData: { key: string; url: string; size: number; filename: string }) => void;
  className?: string;
  currentUsage?: number;
}

const S3Uploader: React.FC<S3UploaderProps> = ({
  userId,
  isPremium = false,
  onUploadSuccess,
  className,
  currentUsage = 0
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Storage limits
  const FREE_TIER_LIMIT = 250 * 1024 * 1024; // 250MB in bytes
  const PREMIUM_TIER_LIMIT = 10 * 1024 * 1024 * 1024; // 10GB in bytes
  const MAX_FILE_SIZE_FREE = 50 * 1024 * 1024; // 50MB in bytes
  
  const storageLimit = isPremium ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;
  const remainingStorage = storageLimit - currentUsage;
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    multiple: false
  });
  
  const handleUpload = async () => {
    if (!selectedFile || !userId) return;
    
    // Check file size against plan limits
    if (!isPremium && selectedFile.size > MAX_FILE_SIZE_FREE) {
      toast.error(`Free tier limited to ${formatBytes(MAX_FILE_SIZE_FREE)} per file. Upgrade to premium for larger files.`);
      return;
    }
    
    // Check if user has enough storage quota
    if (selectedFile.size > remainingStorage) {
      toast.error(`Not enough storage space. You have ${formatBytes(remainingStorage)} remaining.`);
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Step 1: Get presigned URL from our API
      const presignedResponse = await fetch('/api/upload-to-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          userId
        }),
      });
      
      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }
      
      setUploadProgress(30);
      
      // Step 2: Extract the upload URL and key from the response
      const { uploadUrl, key, bucket, region } = await presignedResponse.json();
      
      // Step 3: Upload the file directly to S3 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile
      });
      
      setUploadProgress(75);
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
      
      // Generate the URL for the uploaded file (this will be a public URL)
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      
      // Step 4: Update Supabase metadata after successful upload
      const { error: metadataError } = await supabase
        .from('files')
        .insert({
          filename: selectedFile.name,
          size: selectedFile.size,
          s3_key: key,
          s3_url: fileUrl,
          user_id: userId,
          uploaded_at: new Date().toISOString()
        });
        
      if (metadataError) {
        throw new Error(`Failed to update file metadata: ${metadataError.message}`);
      }
      
      // Step 5: Update user's total storage used
      const { error: usageError } = await supabase
        .from('storage_usage')
        .upsert({
          user_id: userId,
          total_bytes: currentUsage + selectedFile.size,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (usageError) {
        console.error('Error updating storage usage:', usageError);
        // Continue despite this error since the file upload worked
      }
      
      setUploadProgress(100);
      toast.success('File uploaded successfully');
      
      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess({
          key,
          url: fileUrl,
          size: selectedFile.size,
          filename: selectedFile.name
        });
      }
      
      // Reset the selected file
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      // Reset states after a short delay to show completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };
  
  const handleCancelUpload = () => {
    setSelectedFile(null);
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop file here' : 'Drag and drop a file here, or click to select'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {isPremium 
              ? `Up to ${formatBytes(PREMIUM_TIER_LIMIT)} total storage` 
              : `Free tier: Up to ${formatBytes(MAX_FILE_SIZE_FREE)} per file, ${formatBytes(FREE_TIER_LIMIT)} total`}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {`${formatBytes(currentUsage)} used, ${formatBytes(remainingStorage)} available`}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 truncate">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatBytes(selectedFile.size)}</p>
            </div>
            {!isUploading && (
              <Button variant="outline" size="sm" onClick={handleCancelUpload}>
                <FileX className="h-4 w-4 mr-1" /> Cancel
              </Button>
            )}
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          ) : (
            <Button className="w-full" onClick={handleUpload}>
              <FileCheck className="h-4 w-4 mr-2" /> Upload File
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default S3Uploader;
