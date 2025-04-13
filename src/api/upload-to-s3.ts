
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "@/lib/supabase";

// Accessing AWS credentials (in a real Next.js app, these would come from .env.local)
// But since we're using the existing credentials from the project:
const region = "us-east-2"; // As per requirements
const accessKey = AWS_ACCESS_KEY;
const secretKey = AWS_SECRET_KEY;
const bucket = "cloudvault-s3-uploads"; // Using a default bucket name (would come from .env in Next.js)

// Initialize S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileType } = body;
    
    if (!fileName || !fileType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fileName and fileType" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a unique key for this file
    const key = `uploads/${Date.now()}_${fileName}`;
    
    // Create the command for putting an object to S3
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ACL: "public-read", // As per requirements
    });
    
    // Generate the signed URL (expires in 60 seconds as required)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    // Return the signed URL and the file key
    return new Response(
      JSON.stringify({
        uploadUrl,
        key,
        bucket,
        region,
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
