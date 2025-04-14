
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    console.log("[API] update-file-metadata: Request received");
    
    let rawBody;
    try {
      rawBody = await req.text();
      console.log("[API] update-file-metadata: Raw request body:", rawBody);
    } catch (error) {
      console.error("[API] update-file-metadata: Error reading request body:", error);
    }
    
    let body;
    try {
      body = JSON.parse(rawBody || "{}");
      console.log("[API] update-file-metadata: Parsed request body:", body);
    } catch (error) {
      console.error("[API] update-file-metadata: Error parsing JSON:", error);
      return new Response(
        JSON.stringify({ error: "Failed to parse JSON body: " + (error instanceof Error ? error.message : String(error)) }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { filename, size, s3Key, s3Url, userId, contentType } = body;
    
    console.log("[API] update-file-metadata: Request parameters:", {
      filename,
      size,
      s3Key,
      s3Url,
      userId,
      contentType
    });
    
    if (!filename || !size || !s3Key || !s3Url || !userId) {
      console.error("[API] update-file-metadata: Missing required fields:", {
        hasFilename: !!filename,
        hasSize: !!size,
        hasS3Key: !!s3Key,
        hasS3Url: !!s3Url,
        hasUserId: !!userId
      });
      
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if files table exists and create it if it doesn't
    try {
      console.log("[API] update-file-metadata: Checking if files table exists");
      const { error: checkError } = await supabase.from('files').select('count(*)').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log("[API] update-file-metadata: Files table doesn't exist, creating it");
        
        const { error: createError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS public.files (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            filename TEXT NOT NULL,
            size BIGINT NOT NULL,
            s3_key TEXT NOT NULL UNIQUE,
            s3_url TEXT NOT NULL,
            user_id UUID NOT NULL,
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            content_type TEXT
          );
        `;
        
        if (createError) {
          console.error('[API] update-file-metadata: Failed to create files table:', createError);
          return new Response(
            JSON.stringify({ error: `Failed to create files table: ${createError.message}` }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
        
        console.log("[API] update-file-metadata: Files table created successfully");
      }
    } catch (error) {
      console.error('[API] update-file-metadata: Error checking/creating files table:', error);
      // Continue anyway as the table might exist
    }

    // Insert file metadata into Supabase
    console.log("[API] update-file-metadata: Inserting file metadata into Supabase");
    const { error: metadataError, data: insertedData } = await supabase
      .from('files')
      .insert({
        filename,
        size,
        s3_key: s3Key,
        s3_url: s3Url,
        user_id: userId,
        content_type: contentType || 'application/octet-stream',
        uploaded_at: new Date().toISOString()
      })
      .select();
      
    if (metadataError) {
      console.error('[API] update-file-metadata: Failed to update file metadata:', metadataError);
      return new Response(
        JSON.stringify({ error: `Failed to update file metadata: ${metadataError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("[API] update-file-metadata: File metadata inserted successfully:", insertedData);
    
    // Check if storage_usage table exists and create it if it doesn't
    try {
      console.log("[API] update-file-metadata: Checking if storage_usage table exists");
      const { error: checkError } = await supabase.from('storage_usage').select('count(*)').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log("[API] update-file-metadata: Storage usage table doesn't exist, creating it");
        
        const { error: createError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS public.storage_usage (
            user_id UUID PRIMARY KEY,
            total_bytes BIGINT NOT NULL DEFAULT 0,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;
        
        if (createError) {
          console.error('[API] update-file-metadata: Failed to create storage_usage table:', createError);
          // Continue as we already saved file metadata
        } else {
          console.log("[API] update-file-metadata: Storage usage table created successfully");
        }
      }
    } catch (error) {
      console.error('[API] update-file-metadata: Error checking/creating storage_usage table:', error);
      // Continue anyway as the file metadata was saved
    }
    
    // Update user's total storage used
    console.log("[API] update-file-metadata: Fetching current storage usage");
    const { data: storageData, error: storageError } = await supabase
      .from('storage_usage')
      .select('total_bytes')
      .eq('user_id', userId)
      .single();
      
    if (storageError && storageError.code !== 'PGRST116') {
      console.error('[API] update-file-metadata: Error fetching storage usage:', storageError);
    }
    
    const currentUsage = storageData?.total_bytes || 0;
    console.log("[API] update-file-metadata: Current storage usage:", currentUsage);
    
    console.log("[API] update-file-metadata: Updating storage usage");
    const { error: usageError, data: updatedUsage } = await supabase
      .from('storage_usage')
      .upsert({
        user_id: userId,
        total_bytes: currentUsage + size,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    if (usageError) {
      console.error('[API] update-file-metadata: Error updating storage usage:', usageError);
      // Continue despite this error since the file metadata was saved
    } else {
      console.log("[API] update-file-metadata: Storage usage updated successfully:", updatedUsage);
    }
    
    console.log("[API] update-file-metadata: Operation completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "File metadata updated successfully",
        fileData: {
          filename,
          size,
          s3Key,
          s3Url
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API] update-file-metadata: Error updating file metadata:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update file metadata: " + (error instanceof Error ? error.message : String(error)) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
