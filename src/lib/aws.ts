
import { S3Client, CreateBucketCommand, CreateBucketCommandInput, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
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
