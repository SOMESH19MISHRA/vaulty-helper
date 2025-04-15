
import { supabase } from './supabase';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

export interface FileShare {
  id: string;
  file_id: string;
  user_id: string;
  share_token: string;
  expires_at: string | null;
  created_at: string;
  files?: {
    name: string;
    type: string;
  };
}

export type ExpirationOption = '1h' | '24h' | '7d' | '30d' | 'never';

// Convert expiration option to timestamp
export function getExpirationTimestamp(option: ExpirationOption): string | null {
  const now = new Date();
  
  switch (option) {
    case '1h':
      return new Date(now.setHours(now.getHours() + 1)).toISOString();
    case '24h':
      return new Date(now.setHours(now.getHours() + 24)).toISOString();
    case '7d':
      return new Date(now.setDate(now.getDate() + 7)).toISOString();
    case '30d':
      return new Date(now.setDate(now.getDate() + 30)).toISOString();
    case 'never':
      return null;
    default:
      return new Date(now.setHours(now.getHours() + 24)).toISOString();
  }
}

// Create a file share link
export async function createFileShare(fileId: string, userId: string, expiration: ExpirationOption): Promise<FileShare | null> {
  try {
    const shareToken = generateId(20);
    const expiresAt = getExpirationTimestamp(expiration);
    
    const { data, error } = await supabase
      .from('file_shares')
      .insert({
        file_id: fileId,
        user_id: userId,
        share_token: shareToken,
        expires_at: expiresAt,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating file share:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to create file share:', error.message);
    toast.error(`Failed to create share link: ${error.message}`);
    return null;
  }
}

// Get all file shares for a user
export async function getUserFileShares(userId: string): Promise<FileShare[]> {
  try {
    const { data, error } = await supabase
      .from('file_shares')
      .select(`
        *,
        files (name, type)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching file shares:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch file shares:', error.message);
    return [];
  }
}

// Delete a file share
export async function deleteFileShare(shareId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('file_shares')
      .delete()
      .eq('id', shareId);
    
    if (error) {
      console.error('Error deleting file share:', error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Failed to delete file share:', error.message);
    toast.error(`Failed to delete share link: ${error.message}`);
    return false;
  }
}

// Update a file share expiration
export async function updateFileShareExpiration(shareId: string, expiration: ExpirationOption): Promise<boolean> {
  try {
    const expiresAt = getExpirationTimestamp(expiration);
    
    const { error } = await supabase
      .from('file_shares')
      .update({
        expires_at: expiresAt
      })
      .eq('id', shareId);
    
    if (error) {
      console.error('Error updating file share expiration:', error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Failed to update file share expiration:', error.message);
    toast.error(`Failed to update share link: ${error.message}`);
    return false;
  }
}

// Validate a share token and get the file
export async function getFileByShareToken(token: string): Promise<any | null> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('file_shares')
      .select(`
        *,
        files (*)
      `)
      .eq('share_token', token)
      .or(`expires_at.gt.${now},expires_at.is.null`)
      .single();
    
    if (error || !data) {
      console.error('Error fetching file by share token:', error);
      return null;
    }
    
    return data.files;
  } catch (error) {
    console.error('Failed to get file by share token:', error);
    return null;
  }
}
