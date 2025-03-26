
import { S3Client, CreateBucketCommand, CreateBucketCommandInput } from "@aws-sdk/client-s3";
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
    
    console.log(`Creating bucket: ${bucketName}`);
    
    // Set up the bucket creation parameters
    const params: CreateBucketCommandInput = {
      Bucket: bucketName
    };
    
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
      throw error;
    }
    
    return bucketName;
  } catch (error) {
    console.error("Error creating user bucket:", error);
    return null;
  }
};
