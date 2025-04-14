
import { supabase } from './supabase';
import { toast } from 'sonner';

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch all folders for a user
export async function getUserFolders(userId: string): Promise<Folder[]> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch folders:', error.message);
    return [];
  }
}

// Create a new folder
export async function createFolder(name: string, userId: string, parentId: string | null = null): Promise<Folder | null> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        user_id: userId,
        parent_id: parentId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to create folder:', error.message);
    toast.error(`Failed to create folder: ${error.message}`);
    return null;
  }
}

// Rename a folder
export async function renameFolder(folderId: string, newName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('folders')
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq('id', folderId);
    
    if (error) {
      console.error('Error renaming folder:', error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Failed to rename folder:', error.message);
    toast.error(`Failed to rename folder: ${error.message}`);
    return false;
  }
}

// Delete a folder
export async function deleteFolder(folderId: string): Promise<boolean> {
  try {
    // First get files in this folder to update storage references
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', folderId);
      
    // Move files to root (null folder_id)
    if (files && files.length > 0) {
      await supabase
        .from('files')
        .update({ folder_id: null })
        .eq('folder_id', folderId);
    }
    
    // Delete the folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);
    
    if (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Failed to delete folder:', error.message);
    toast.error(`Failed to delete folder: ${error.message}`);
    return false;
  }
}

// Get folder path (breadcrumb)
export async function getFolderPath(folderId: string | null): Promise<Folder[]> {
  if (!folderId) return [];
  
  try {
    const path: Folder[] = [];
    let currentId = folderId;
    
    while (currentId) {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', currentId)
        .single();
      
      if (error || !data) break;
      
      path.unshift(data);
      currentId = data.parent_id;
    }
    
    return path;
  } catch (error: any) {
    console.error('Failed to get folder path:', error.message);
    return [];
  }
}

// Check if a folder is empty (no files or subfolders)
export async function isFolderEmpty(folderId: string): Promise<boolean> {
  try {
    // Check for files
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('id')
      .eq('folder_id', folderId)
      .limit(1);
    
    if (filesError) throw filesError;
    if (files && files.length > 0) return false;
    
    // Check for subfolders
    const { data: subfolders, error: subfoldersError } = await supabase
      .from('folders')
      .select('id')
      .eq('parent_id', folderId)
      .limit(1);
    
    if (subfoldersError) throw subfoldersError;
    if (subfolders && subfolders.length > 0) return false;
    
    return true;
  } catch (error: any) {
    console.error('Error checking if folder is empty:', error.message);
    return false;
  }
}
