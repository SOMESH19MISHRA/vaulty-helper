
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileItem, 
  FileFilter, 
  getUserFiles, 
  deleteFile, 
  getFileTypes,
  moveFile
} from '@/lib/files';
import { 
  Folder, 
  getUserFolders, 
  createFolder, 
  renameFolder, 
  deleteFolder,
  getFolderPath,
  isFolderEmpty
} from '@/lib/folders';
import { supabase } from '@/lib/supabase';
import FileUpload from '@/components/FileUpload';
import FolderTree from '@/components/FolderTree';
import FolderModal from '@/components/FolderModal';
import FileSearch from '@/components/FileSearch';
import FilesGrid from '@/components/FilesGrid';
import FilesTable from '@/components/FilesTable';
import FolderBreadcrumb from '@/components/FolderBreadcrumb';
import { 
  LayoutGrid, 
  List, 
  AlertTriangle, 
  Download
} from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolders, setCurrentFolders] = useState<Folder[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<FileFilter>({
    folderId: null
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal states
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
  const [folderParentId, setFolderParentId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'file' | 'folder', item: any } | null>(null);
  
  // Load data
  useEffect(() => {
    if (user) {
      fetchFolders();
      fetchFileTypes();
    }
  }, [user]);
  
  // Load files when filters change
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, filters]);
  
  // Update current folder path when folder ID changes
  useEffect(() => {
    if (user && selectedFolderId !== undefined) {
      updateFolderPath();
      updateCurrentFolders();
    }
  }, [user, selectedFolderId, folders]);

  // Fetch folders
  const fetchFolders = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const loadedFolders = await getUserFolders(user.id);
      setFolders(loadedFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch files
  const fetchFiles = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const loadedFiles = await getUserFiles(user.id, filters);
      setFiles(loadedFiles);
      
      // Calculate total size
      const size = loadedFiles.reduce((total, file) => total + file.size, 0);
      setTotalSize(size);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch file types
  const fetchFileTypes = async () => {
    if (!user) return;
    
    try {
      const types = await getFileTypes(user.id);
      setFileTypes(types);
    } catch (error) {
      console.error('Error fetching file types:', error);
    }
  };
  
  // Update the current folder path for breadcrumbs
  const updateFolderPath = async () => {
    if (selectedFolderId === null) {
      setFolderPath([]);
      return;
    }
    
    const path = await getFolderPath(selectedFolderId);
    setFolderPath(path);
  };
  
  // Get subfolders of the current folder
  const updateCurrentFolders = () => {
    const currentFoldersList = folders.filter(
      folder => folder.parent_id === selectedFolderId
    );
    setCurrentFolders(currentFoldersList);
  };
  
  // Handle folder selection
  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setFilters({ ...filters, folderId });
  };
  
  // Open folder creation modal
  const handleCreateFolderClick = (parentId: string | null) => {
    setFolderModalMode('create');
    setFolderToEdit(null);
    setFolderParentId(parentId);
    setFolderModalOpen(true);
  };
  
  // Open folder rename modal
  const handleRenameFolderClick = (folder: Folder) => {
    setFolderModalMode('rename');
    setFolderToEdit(folder);
    setFolderModalOpen(true);
  };
  
  // Create a new folder
  const handleCreateFolder = async (name: string) => {
    if (!user) return;
    
    try {
      const newFolder = await createFolder(name, user.id, folderParentId);
      if (newFolder) {
        toast.success(`Folder "${name}" created`);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };
  
  // Rename a folder
  const handleRenameFolder = async (name: string) => {
    if (!folderToEdit) return;
    
    try {
      const success = await renameFolder(folderToEdit.id, name);
      if (success) {
        toast.success(`Folder renamed to "${name}"`);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    }
  };
  
  // Confirm folder deletion
  const handleDeleteFolderClick = (folder: Folder) => {
    setItemToDelete({ type: 'folder', item: folder });
    setDeleteConfirmOpen(true);
  };
  
  // Confirm file deletion
  const handleDeleteFileClick = (file: FileItem) => {
    setItemToDelete({ type: 'file', item: file });
    setDeleteConfirmOpen(true);
  };
  
  // Delete folder or file
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'folder') {
        const folder = itemToDelete.item as Folder;
        const isEmpty = await isFolderEmpty(folder.id);
        
        if (!isEmpty) {
          const confirmMove = window.confirm(
            'This folder contains files or subfolders that will be moved to the root. Continue?'
          );
          if (!confirmMove) {
            setDeleteConfirmOpen(false);
            return;
          }
        }
        
        const success = await deleteFolder(folder.id);
        if (success) {
          toast.success(`Folder "${folder.name}" deleted`);
          fetchFolders();
          // If we deleted the currently selected folder, go back to root
          if (selectedFolderId === folder.id) {
            setSelectedFolderId(null);
            setFilters({ ...filters, folderId: null });
          }
        }
      } else {
        const file = itemToDelete.item as FileItem;
        const success = await deleteFile(file.id);
        if (success) {
          toast.success(`File "${file.name}" deleted`);
          fetchFiles();
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  // Handle file download
  const handleFileDownload = async (file: FileItem) => {
    try {
      toast.loading('Preparing download...');
      
      // Get file URL
      const { data, error } = await supabase.storage
        .from('cloudvault')
        .createSignedUrl(file.path, 60); // Valid for 60 seconds
      
      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Failed to generate download URL');
      }
      
      // Create a download link
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('Download started');
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Download failed: ${error.message}`);
      console.error('Download error:', error);
    }
  };
  
  // Handle folder actions
  const handleFolderAction = (action: 'open' | 'rename' | 'delete', folder: Folder) => {
    switch (action) {
      case 'open':
        handleSelectFolder(folder.id);
        break;
      case 'rename':
        handleRenameFolderClick(folder);
        break;
      case 'delete':
        handleDeleteFolderClick(folder);
        break;
    }
  };
  
  // Handle file actions
  const handleFileAction = (action: 'download' | 'delete' | 'move', file: FileItem) => {
    switch (action) {
      case 'download':
        handleFileDownload(file);
        break;
      case 'delete':
        handleDeleteFileClick(file);
        break;
      case 'move':
        // TODO: Implement file move functionality
        break;
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FileFilter) => {
    setFilters({
      ...filters,
      ...newFilters
    });
  };
  
  // Format size to human readable format
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="h-10 w-10 border-4 border-cloud border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <NavBar />
      <div className="pt-24 pb-16 px-4 sm:px-6 md:px-8 flex flex-col flex-1">
        <div className="max-w-7xl mx-auto w-full">
          <div className="animate-fade-up">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Your Files</h1>
            <p className="text-muted-foreground mb-8">Manage your secure files and folders</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            {/* Sidebar with folder tree */}
            <div className="w-full md:w-64 lg:w-72">
              <Card className="border-0 shadow-lg glass-panel h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Folder Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <FolderTree
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={handleSelectFolder}
                    onCreateFolder={handleCreateFolderClick}
                    onRenameFolder={handleRenameFolderClick}
                    onDeleteFolder={handleDeleteFolderClick}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Main content area */}
            <div className="flex-1">
              <Card className="border-0 shadow-lg glass-panel">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      {/* Breadcrumb navigation */}
                      <FolderBreadcrumb 
                        folders={folderPath}
                        onNavigate={handleSelectFolder}
                      />
                    </div>
                    
                    {/* View toggle buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0"
                      >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="sr-only">Grid view</span>
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                        <span className="sr-only">List view</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search and filters */}
                  <div className="mt-4">
                    <FileSearch 
                      onFilterChange={handleFilterChange}
                      fileTypes={fileTypes}
                    />
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Upload button */}
                  <div className="mb-6">
                    <FileUpload 
                      userId={user.id} 
                      folderId={selectedFolderId}
                      onUploadSuccess={fetchFiles}
                    />
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 border-4 border-cloud border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <FilesGrid
                      files={files}
                      folders={currentFolders}
                      onFileAction={handleFileAction}
                      onFolderAction={handleFolderAction}
                    />
                  ) : (
                    <FilesTable
                      files={files}
                      folders={currentFolders}
                      onFileAction={handleFileAction}
                      onFolderAction={handleFolderAction}
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Storage stats */}
              <Card className="border-0 shadow-lg glass-panel mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cloud">{files.length}</p>
                      <p className="text-muted-foreground">files</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cloud">{folders.length}</p>
                      <p className="text-muted-foreground">folders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cloud">{formatSize(totalSize)}</p>
                      <p className="text-muted-foreground">total storage used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Folder Create/Rename Modal */}
      <FolderModal 
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSubmit={folderModalMode === 'create' ? handleCreateFolder : handleRenameFolder}
        folder={folderToEdit}
        title={folderModalMode === 'create' ? 'Create Folder' : 'Rename Folder'}
        description={folderModalMode === 'create' 
          ? folderParentId 
            ? 'Create a new subfolder'
            : 'Create a new root folder'
          : 'Enter a new name for this folder'
        }
        submitLabel={folderModalMode === 'create' ? 'Create' : 'Rename'}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'folder' 
                ? `Are you sure you want to delete the folder "${(itemToDelete.item as Folder).name}"? This action cannot be undone.`
                : `Are you sure you want to delete the file "${(itemToDelete?.item as FileItem)?.name}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
