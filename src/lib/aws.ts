
import { S3Client, CreateBucketCommand, CreateBucketCommandInput, PutBucketPolicyCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "./supabase";
import { supabase } from "./supabase";

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

/**
 * Creates an S3 bucket for a user and stores the bucket name in Supabase
 */
export const createUserBucket = async (userId: string): Promise<string | null> => {
  try {
    // Generate a unique bucket name using the user ID
    const bucketName = `user-bucket-${userId.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
    
    console.log(`Attempting to create bucket: ${bucketName}`);
    console.log(`Using AWS Region: ${AWS_REGION}`);
    console.log(`Using Access Key ID: ${AWS_ACCESS_KEY.slice(0, 5)}...`); // Only log first 5 chars for security
    
    // Special case for us-east-1 region
    let params: CreateBucketCommandInput;
    
    if (AWS_REGION === 'us-east-1') {
      params = {
        Bucket: bucketName,
        // Do not specify LocationConstraint for us-east-1
      };
    } else {
      params = {
        Bucket: bucketName,
        CreateBucketConfiguration: {
          LocationConstraint: AWS_REGION
        }
      };
    }
    
    // Create the bucket
    const command = new CreateBucketCommand(params);
    const response = await s3Client.send(command);
    console.log("Bucket created successfully:", response);
    
    // Set bucket policy to allow public read access if needed
    try {
      const policyParams = {
        Bucket: bucketName,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicReadGetObject",
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`]
            }
          ]
        })
      };
      
      const policyCommand = new PutBucketPolicyCommand(policyParams);
      await s3Client.send(policyCommand);
      console.log("Bucket policy set successfully");
    } catch (policyError) {
      console.warn("Could not set bucket policy:", policyError);
      // Continue even if policy setting fails
    }
    
    // Store the bucket information in Supabase
    const { error } = await supabase
      .from('aws_credentials')
      .insert([
        { 
          user_id: userId, 
          bucket_name: bucketName,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error("Error storing bucket info in Supabase:", error);
      throw error;
    }
    
    return bucketName;
  } catch (error) {
    console.error("Error creating user bucket:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
};

/**
 * Generates a pre-signed URL for uploading a file to S3
 * @param fileName - Original file name
 * @param fileType - MIME type of the file
 * @param userId - User ID for storing the file under their directory
 * @param expirationSeconds - URL expiration time in seconds (default: 600 seconds = 10 minutes)
 * @returns Object containing uploadUrl and fileKey
 */
export const generateUploadUrl = async (
  fileName: string,
  fileType: string,
  userId: string,
  expirationSeconds: number = 600
): Promise<{ uploadUrl: string; fileKey: string }> => {
  try {
    // Get the bucket for this user
    const { data: credentials, error } = await supabase
      .from('aws_credentials')
      .select('bucket_name')
      .eq('user_id', userId)
      .single();
    
    if (error || !credentials?.bucket_name) {
      console.error("Error fetching user bucket:", error);
      throw new Error("Could not find storage bucket for user");
    }
    
    const bucketName = credentials.bucket_name;
    
    // Create a unique file key with timestamp
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `users/${userId}/${timestamp}_${safeFileName}`;
    
    // Create the command for putting an object to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
      ACL: 'private'
    });
    
    // Generate the signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });
    
    return {
      uploadUrl,
      fileKey
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw error;
  }
};

/**
 * Uploads a file directly to S3 using a pre-signed URL
 * @param file - File to upload
 * @param uploadUrl - Pre-signed URL for uploading
 * @param fileType - MIME type of the file
 * @returns Promise that resolves when upload is complete
 */
export const uploadFileWithPresignedUrl = async (
  file: File,
  uploadUrl: string,
  fileType: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: file,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    return {
      success: true,
      message: 'File uploaded successfully'
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
