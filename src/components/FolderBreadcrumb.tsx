
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Folder } from '@/lib/folders';

interface FolderBreadcrumbProps {
  folders: Folder[];
  onNavigate: (folderId: string | null) => void;
}

const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({ 
  folders, 
  onNavigate 
}) => {
  return (
    <div className="flex items-center text-sm overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <button 
        onClick={() => onNavigate(null)} 
        className="flex items-center hover:text-blue-500 hover:underline"
      >
        <Home className="h-4 w-4 mr-1" />
        <span>All Files</span>
      </button>
      
      {folders.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          <button
            onClick={() => onNavigate(folder.id)}
            className={`hover:text-blue-500 hover:underline ${
              index === folders.length - 1 ? 'font-medium text-primary' : ''
            }`}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default FolderBreadcrumb;
