import { S3Client, CreateBucketCommand, CreateBucketCommandInput, PutBucketPolicyCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadBucketCommand } from "@aws-sdk/client-s3";
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
 * Checks if a bucket exists
 * @param bucketName - The name of the bucket to check
 * @returns Boolean indicating if the bucket exists
 */
const bucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    console.log(`Bucket ${bucketName} exists`);
    return true;
  } catch (error) {
    console.log(`Bucket ${bucketName} does not exist or is not accessible`);
    // If error code is 404, bucket does not exist
    // If error code is 403, bucket exists but you don't have access
    // For our purposes, if we can't access it, we need to create a new one
    return false;
  }
};

/**
 * Creates an S3 bucket for a user and stores the bucket name in Supabase
 */
export const createUserBucket = async (userId: string): Promise<string | null> => {
  try {
    // Generate a unique bucket name using the user ID
    const bucketName = `cloudvault-storage-user-${userId.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
    
    console.log(`Attempting to create bucket: ${bucketName}`);
    
    // Check if the bucket already exists
    const exists = await bucketExists(bucketName);
    if (exists) {
      console.log(`Bucket ${bucketName} already exists, skipping creation`);
      return bucketName;
    }
    
    // Special case for us-east-1 region
    let params: CreateBucketCommandInput;
    
    if (AWS_REGION === 'us-east-1') {
      params = {
        Bucket: bucketName,
        ACL: 'private', // Ensure private ACL for data confidentiality
      };
    } else {
      params = {
        Bucket: bucketName,
        CreateBucketConfiguration: {
          LocationConstraint: AWS_REGION
        },
        ACL: 'private', // Ensure private ACL for data confidentiality
      };
    }
    
    // Create the bucket
    const command = new CreateBucketCommand(params);
    const response = await s3Client.send(command);
    console.log("Bucket created successfully:", response);
    
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
      // Continue despite database error, as bucket was created successfully
      console.log("Continuing despite database error, as bucket was created successfully");
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
 * Ensures the user's directory exists in the bucket
 * Note: S3 doesn't have real directories, but we can create an empty object with the directory path
 * @param bucketName - The bucket to check
 * @param userId - The user ID for the directory
 */
const ensureUserDirectoryExists = async (bucketName: string, userId: string): Promise<void> => {
  try {
    // Create an empty object with the directory prefix to simulate a directory
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `users/${userId}/`,
      Body: '', // Empty body to simulate a directory
      ACL: 'private', // Ensure private ACL for data confidentiality
    });
    
    await s3Client.send(command);
    console.log(`Directory users/${userId}/ created or verified`);
  } catch (error) {
    console.error("Error ensuring user directory exists:", error);
    throw error;
  }
};

/**
 * Generates a pre-signed URL for uploading a file to S3
 * @param fileName - Original file name
 * @param fileType - MIME type of the file
 * @param userId - User ID for storing the file under their directory
 * @param expirationSeconds - URL expiration time in seconds (default: 600 seconds = 10 minutes)
 * @returns Object containing uploadUrl, fileKey, and status message
 */
export const generateUploadUrl = async (
  fileName: string,
  fileType: string,
  userId: string,
  expirationSeconds: number = 600
): Promise<{ uploadUrl: string; fileKey: string; message?: string; bucketName?: string }> => {
  try {
    // Get the bucket for this user
    const { data: credentials, error } = await supabase
      .from('aws_credentials')
      .select('bucket_name')
      .eq('user_id', userId)
      .single();
    
    let bucketName: string;
    let message: string = "Upload URL generated";
    let bucketCreated: boolean = false;
    
    // If no bucket is found for this user, create one
    if (error || !credentials?.bucket_name) {
      console.log("No bucket found for user, creating new bucket");
      const newBucketName = await createUserBucket(userId) as string;
      if (!newBucketName) {
        throw new Error("Failed to create storage bucket for user");
      }
      bucketName = newBucketName;
      bucketCreated = true;
      message = "Bucket created and upload URL generated";
    } else {
      bucketName = credentials.bucket_name;
      
      // Check if the bucket exists, if not create it
      const exists = await bucketExists(bucketName);
      if (!exists) {
        console.log(`Bucket ${bucketName} does not exist, creating it`);
        const newBucketName = await createUserBucket(userId) as string;
        if (!newBucketName) {
          throw new Error("Failed to create storage bucket for user");
        }
        bucketName = newBucketName;
        bucketCreated = true;
        message = "Bucket recreated and upload URL generated";
      }
    }
    
    // Ensure the user directory exists in the bucket
    await ensureUserDirectoryExists(bucketName, userId);
    
    // Create a unique file key with timestamp
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `users/${userId}/${timestamp}_${safeFileName}`;
    
    // Create the command for putting an object to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
      ACL: 'private' // Ensure private ACL for data confidentiality
    });
    
    // Generate the signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });
    
    return {
      uploadUrl,
      fileKey,
      message: bucketCreated ? message : undefined,
      bucketName: bucketName
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
    console.error("Error uploading file with error:", error);
    throw error;
  }
};

/**
 * Generates a pre-signed URL for downloading a file from S3
 * @param fileKey - The key of the file in S3
 * @param expirationSeconds - URL expiration time in seconds (default: 3600 seconds = 1 hour)
 * @returns Object containing downloadUrl
 */
export const generateDownloadUrl = async (
  fileKey: string,
  expirationSeconds: number = 3600
): Promise<{ downloadUrl: string }> => {
  try {
    // Get the bucket for this file (extracted from the fileKey)
    const userId = fileKey.split('/')[1]; // Assuming format: users/{userId}/filename
    
    const { data: credentials, error } = await supabase
      .from('aws_credentials')
      .select('bucket_name')
      .eq('user_id', userId)
      .single();
    
    if (error || !credentials?.bucket_name) {
      console.error("Error fetching bucket name:", error);
      throw new Error("Could not find storage bucket for file");
    }
    
    const bucketName = credentials.bucket_name;
    
    // Create the command for getting an object from S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ACL: 'private'
    });
    
    // Generate the signed URL
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });
    
    return { downloadUrl };
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw error;
  }
};

/**
 * Deletes a file from S3
 * @param fileKey - The key of the file in S3
 * @returns Object with success message
 */
export const deleteFile = async (fileKey: string): Promise<{ message: string }> => {
  try {
    // Get the bucket for this file (extracted from the fileKey)
    const userId = fileKey.split('/')[1]; // Assuming format: users/{userId}/filename
    
    const { data: credentials, error } = await supabase
      .from('aws_credentials')
      .select('bucket_name')
      .eq('user_id', userId)
      .single();
    
    if (error || !credentials?.bucket_name) {
      console.error("Error fetching bucket name:", error);
      throw new Error("Could not find storage bucket for file");
    }
    
    const bucketName = credentials.bucket_name;
    
    // Create the command for deleting an object from S3
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey
    });
    
    // Execute the delete command
    await s3Client.send(command);
    
    return { message: "File deleted successfully" };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Lists all files for a specific user in S3
 * @param userId - The user ID whose files to list
 * @returns Object containing array of files with their keys and upload timestamps
 */
export const listUserFiles = async (userId: string): Promise<{ files: { fileKey: string; uploadedAt: string }[] }> => {
  try {
    // Get the bucket for this user
    const { data: credentials, error } = await supabase
      .from('aws_credentials')
      .select('bucket_name')
      .eq('user_id', userId)
      .single();
    
    if (error || !credentials?.bucket_name) {
      console.error("Error fetching bucket name:", error);
      throw new Error("Could not find storage bucket for user");
    }
    
    const bucketName = credentials.bucket_name;
    
    // Create the command for listing objects in S3
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `users/${userId}/`, // Only list files in this user's directory
    });
    
    // Execute the list command
    const response = await s3Client.send(command);
    
    // Format the response
    const files = (response.Contents || []).map(item => ({
      fileKey: item.Key || '',
      uploadedAt: item.LastModified?.toISOString() || new Date().toISOString()
    }));
    
    return { files };
  } catch (error) {
    console.error("Error listing user files:", error);
    throw error;
  }
};
