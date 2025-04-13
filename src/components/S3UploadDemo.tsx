
import React, { useState } from 'react';
import S3FileUpload from './S3FileUpload';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const S3UploadDemo: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ key: string; url: string }>>([]);

  const handleUploadSuccess = (fileData: { key: string; url: string }) => {
    setUploadedFiles(prev => [...prev, fileData]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>AWS S3 Direct Upload</CardTitle>
        <CardDescription>
          Upload files directly to your S3 bucket with presigned URLs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <S3FileUpload onUploadSuccess={handleUploadSuccess} maxSizeMB={10} />
        
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Uploaded Files:</h3>
            <ul className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="text-sm">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-blue-600 hover:underline break-all"
                  >
                    {file.key.split('/').pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Alert className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This demo uses the AWS credentials defined in your project. In a production app, 
            these would come from environment variables.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default S3UploadDemo;
