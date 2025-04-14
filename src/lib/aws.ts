
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "./supabase";
import { supabase } from "./supabase";

// Storage tier limits
export const FREE_TIER_LIMIT = 250 * 1024 * 1024; // 250MB in bytes
export const PREMIUM_TIER_LIMIT = 10 * 1024 * 1024 * 1024; // 10GB in bytes
export const MAX_FILE_SIZE_FREE = 50 * 1024 * 1024; // 50MB in bytes

// Initialize S3 client
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

console.log('AWS S3 client initialized with region:', AWS_REGION);

const DEFAULT_BUCKET = "cloudvault-userfiles";

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
    console.log(`Generating download URL for file: ${fileKey} in bucket: ${DEFAULT_BUCKET}`);
    
    // Create the command for getting an object from S3
    const command = new GetObjectCommand({
      Bucket: DEFAULT_BUCKET,
      Key: fileKey
    });
    
    // Generate the signed URL
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });
    console.log('Generated download URL successfully');
    
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
    console.log(`Deleting file: ${fileKey} from bucket: ${DEFAULT_BUCKET}`);
    
    // Create the command for deleting an object from S3
    const command = new DeleteObjectCommand({
      Bucket: DEFAULT_BUCKET,
      Key: fileKey
    });
    
    // Execute the delete command
    await s3Client.send(command);
    console.log('File deleted from S3 successfully');
    
    return { message: "File deleted successfully" };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Gets the user's storage usage
 * @param userId - User ID to get storage usage for
 * @returns Object containing used bytes and tier information
 */
export const getUserStorageInfo = async (userId: string): Promise<{
  usedBytes: number;
  isPremium: boolean;
  storageLimit: number;
}> => {
  try {
    console.log(`Getting storage info for user: ${userId}`);
    
    // Get user's subscription tier
    const { data: userTier, error: tierError } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
      
    const isPremium = userTier?.tier === 'premium';
    const storageLimit = isPremium ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;
    
    // Get user's storage usage
    const { data: storageData, error: storageError } = await supabase
      .from('storage_usage')
      .select('total_bytes')
      .eq('user_id', userId)
      .single();
    
    if (storageError && storageError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching storage usage:', storageError);
    }
    
    const usedBytes = storageData?.total_bytes || 0;
    console.log(`User storage info - Used: ${usedBytes}, Premium: ${isPremium}, Limit: ${storageLimit}`);
    
    return {
      usedBytes,
      isPremium,
      storageLimit
    };
  } catch (error) {
    console.error('Error getting user storage info:', error);
    // Return defaults if there's an error
    return {
      usedBytes: 0,
      isPremium: false,
      storageLimit: FREE_TIER_LIMIT
    };
  }
};
