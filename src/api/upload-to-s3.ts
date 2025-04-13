
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "@/lib/supabase";

// Initialize S3 client
const s3Client = new S3Client({
  region: "us-east-2", // As specified in requirements
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const bucket = "cloudvault-s3-uploads"; // Your bucket name

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileType, userId } = body;
    
    if (!fileName || !fileType || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fileName, fileType, or userId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate sanitized filename
    const timestamp = Date.now();
    const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Create a unique key for this file
    const key = `${userId}/${timestamp}-${sanitizedFilename}`;
    
    // Create the command for putting an object to S3
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ACL: "private", // Private as per requirements
    });
    
    // Generate the signed URL (expires in 60 seconds as required)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    // Return the signed URL and the file key
    return new Response(
      JSON.stringify({
        uploadUrl,
        key,
        bucket,
        region: "us-east-2"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate upload URL" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
