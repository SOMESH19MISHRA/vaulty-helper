
import { supabase } from './supabase';
import { toast } from 'sonner';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  user_id: string;
  folder_id: string | null;
  path: string;
  created_at: string;
  updated_at: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'created_at' | 'size' | 'type';

export interface FileFilter {
  search?: string;
  type?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
  folderId?: string | null;
}

// Get files with filters
export async function getUserFiles(userId: string, filters: FileFilter = {}): Promise<FileItem[]> {
  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);
    
    // Apply folder filter
    if (filters.folderId !== undefined) {
      query = query.eq('folder_id', filters.folderId);
    }
    
    // Apply search filter
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    // Apply file type filter
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    // Apply sorting
    const sortField = filters.sortField || 'created_at';
    const sortDirection = filters.sortDirection || 'desc';
    query = query.order(sortField, { ascending: sortDirection === 'asc' });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch files:', error.message);
    toast.error(`Failed to fetch files: ${error.message}`);
    return [];
  }
}

// Move a file to a different folder
export async function moveFile(fileId: string, folderId: string | null): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('files')
      .update({ folder_id: folderId, updated_at: new Date().toISOString() })
      .eq('id', fileId);
    
    if (error) {
      console.error('Error moving file:', error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Failed to move file:', error.message);
    toast.error(`Failed to move file: ${error.message}`);
    return false;
  }
}

// Get unique file types for a user
export async function getFileTypes(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('type')
      .eq('user_id', userId)
      .order('type');
    
    if (error) {
      console.error('Error fetching file types:', error);
      throw error;
    }
    
    // Extract unique types
    return [...new Set(data?.map(item => item.type) || [])];
  } catch (error: any) {
    console.error('Failed to fetch file types:', error.message);
    return [];
  }
}

// Delete a file
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // First get the file details to know the storage path
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
    
    if (fetchError || !file) {
      console.error('Error fetching file details:', fetchError);
      throw fetchError || new Error('File not found');
    }
    
    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('cloudvault')
      .remove([file.path]);
    
    if (storageError) {
      console.error('Error removing file from storage:', storageError);
      // Continue to delete the database entry even if storage deletion fails
    }
    
    // Delete the database entry
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
    
    if (dbError) {
      console.error('Error deleting file record:', dbError);
      throw dbError;
    }
    
    return true;
  } catch (error: any) {
    console.error('Failed to delete file:', error.message);
    toast.error(`Failed to delete file: ${error.message}`);
    return false;
  }
}
