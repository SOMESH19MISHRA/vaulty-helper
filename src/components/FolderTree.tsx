
import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2,
  MoreVertical 
} from 'lucide-react';
import { Folder as FolderType } from '@/lib/folders';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FolderTreeProps {
  folders: FolderType[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onRenameFolder: (folder: FolderType) => void;
  onDeleteFolder: (folder: FolderType) => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  // Group folders by parent ID
  const foldersByParent: Record<string, FolderType[]> = {};
  
  folders.forEach(folder => {
    const parentId = folder.parent_id || 'root';
    if (!foldersByParent[parentId]) {
      foldersByParent[parentId] = [];
    }
    foldersByParent[parentId].push(folder);
  });
  
  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Render folder and its children recursively
  const renderFolder = (folder: FolderType) => {
    const isExpanded = expandedFolders[folder.id] || false;
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = foldersByParent[folder.id]?.length > 0;
    
    return (
      <div key={folder.id} className="ml-2">
        <Collapsible open={isExpanded} onOpenChange={() => toggleFolder(folder.id)}>
          <div className={`flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-5 w-5 mr-1">
                {hasChildren ? (
                  isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                ) : <div className="w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <div 
              className="flex-1 flex items-center cursor-pointer truncate"
              onClick={() => onSelectFolder(folder.id)}
            >
              {isSelected || isExpanded ? 
                <FolderOpen className="h-4 w-4 mr-2 text-blue-500" /> : 
                <Folder className="h-4 w-4 mr-2 text-gray-500" />
              }
              <span className="truncate text-sm">{folder.name}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onCreateFolder(folder.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Subfolder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => onDeleteFolder(folder)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {hasChildren && (
            <CollapsibleContent>
              <div className="ml-2 border-l border-gray-200 dark:border-gray-700 pl-2 mt-1">
                {foldersByParent[folder.id]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(childFolder => renderFolder(childFolder))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 p-2">
        <h3 className="font-semibold">Folders</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onCreateFolder(null)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">New Folder</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create Root Folder</TooltipContent>
        </Tooltip>
      </div>
      
      <div>
        <div 
          className={`flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedFolderId === null ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          onClick={() => onSelectFolder(null)}
        >
          <Folder className="h-4 w-4 mr-2 text-gray-500" />
          <span className="truncate text-sm">All Files</span>
        </div>
        
        {foldersByParent['root']?.length > 0 && (
          <div className="mt-1">
            {foldersByParent['root']
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(folder => renderFolder(folder))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderTree;
