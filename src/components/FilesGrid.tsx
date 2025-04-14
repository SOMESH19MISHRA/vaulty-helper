
import React from 'react';
import { 
  FileIcon, 
  FileTextIcon, 
  FileImageIcon, 
  FileVideoIcon, 
  FileAudioIcon, 
  FilePdfIcon, 
  FileArchiveIcon, 
  FileSpreadsheetIcon, 
  FilePresentationIcon,
  MoreVertical,
  Download,
  Trash2,
  FolderIcon
} from 'lucide-react';
import { FileItem } from '@/lib/files';
import { Folder } from '@/lib/folders';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface FilesGridProps {
  files: FileItem[];
  folders: Folder[];
  onFileAction: (action: 'download' | 'delete' | 'move', file: FileItem) => void;
  onFolderAction: (action: 'open' | 'rename' | 'delete', folder: Folder) => void;
}

const FilesGrid: React.FC<FilesGridProps> = ({ 
  files,
  folders,
  onFileAction,
  onFolderAction
}) => {
  // Format file size as human-readable string
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Return appropriate icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImageIcon className="h-10 w-10 text-blue-500" />;
    if (fileType.startsWith('video/')) return <FileVideoIcon className="h-10 w-10 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <FileAudioIcon className="h-10 w-10 text-green-500" />;
    if (fileType === 'application/pdf') return <FilePdfIcon className="h-10 w-10 text-red-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType === 'text/csv') 
      return <FileSpreadsheetIcon className="h-10 w-10 text-green-700" />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) 
      return <FilePresentationIcon className="h-10 w-10 text-orange-500" />;
    if (fileType.includes('archive') || fileType.includes('zip') || fileType.includes('compressed')) 
      return <FileArchiveIcon className="h-10 w-10 text-yellow-600" />;
    if (fileType.startsWith('text/')) return <FileTextIcon className="h-10 w-10 text-gray-600" />;
    
    return <FileIcon className="h-10 w-10 text-gray-500" />;
  };
  
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center">
        <FileIcon className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-700">No files or folders</h3>
        <p className="text-gray-500 mt-2">
          Upload files or create folders to get started
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {/* Render folders first */}
      {folders.map(folder => (
        <Card 
          key={`folder-${folder.id}`}
          className="p-4 flex flex-col hover:bg-gray-50 transition-colors cursor-pointer group"
          onClick={() => onFolderAction('open', folder)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <FolderIcon className="h-10 w-10 text-yellow-500 mb-2" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onFolderAction('rename', folder);
                }}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFolderAction('delete', folder);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex-1 truncate">
            <p className="font-medium text-sm truncate" title={folder.name}>
              {folder.name}
            </p>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}
          </div>
        </Card>
      ))}
      
      {/* Then render files */}
      {files.map(file => (
        <Card 
          key={`file-${file.id}`}
          className="p-4 flex flex-col hover:bg-gray-50 transition-colors group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {getFileIcon(file.type)}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onFileAction('download', file)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onFileAction('delete', file)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex-1 flex flex-col">
            <p className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatFileSize(file.size)}
            </p>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FilesGrid;
