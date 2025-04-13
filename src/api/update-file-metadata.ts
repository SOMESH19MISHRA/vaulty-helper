
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, size, s3Key, s3Url, userId } = body;
    
    if (!filename || !size || !s3Key || !s3Url || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert file metadata into Supabase
    const { error: metadataError } = await supabase
      .from('files')
      .insert({
        filename,
        size,
        s3_key: s3Key,
        s3_url: s3Url,
        user_id: userId,
        uploaded_at: new Date().toISOString()
      });
      
    if (metadataError) {
      console.error('Failed to update file metadata:', metadataError);
      return new Response(
        JSON.stringify({ error: `Failed to update file metadata: ${metadataError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update user's total storage used
    const { data: storageData } = await supabase
      .from('storage_usage')
      .select('total_bytes')
      .eq('user_id', userId)
      .single();
      
    const currentUsage = storageData?.total_bytes || 0;
    
    const { error: usageError } = await supabase
      .from('storage_usage')
      .upsert({
        user_id: userId,
        total_bytes: currentUsage + size,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    if (usageError) {
      console.error('Error updating storage usage:', usageError);
      // Continue despite this error since the file metadata was saved
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating file metadata:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update file metadata" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
