
import React from 'react';
import { Download, Edit, Folder, MoreHorizontal, Trash2 } from 'lucide-react';
import { FileItem } from '@/lib/files';
import { Folder as FolderType } from '@/lib/folders';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface FilesTableProps {
  files: FileItem[];
  folders: FolderType[];
  onFileAction: (action: 'download' | 'delete' | 'move', file: FileItem) => void;
  onFolderAction: (action: 'open' | 'rename' | 'delete', folder: FolderType) => void;
}

const FilesTable: React.FC<FilesTableProps> = ({ 
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

  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No files or folders found in this location
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Name</TableHead>
            <TableHead className="hidden sm:table-cell">Size</TableHead>
            <TableHead className="hidden md:table-cell">Modified</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Folders first */}
          {folders.map(folder => (
            <TableRow key={`folder-${folder.id}`}>
              <TableCell 
                className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                onClick={() => onFolderAction('open', folder)}
              >
                <div className="flex items-center">
                  <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="truncate">{folder.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">—</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFolderAction('rename', folder)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onFolderAction('delete', folder)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {/* Then files */}
          {files.map(file => (
            <TableRow key={`file-${file.id}`}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <span className="truncate">{file.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {formatFileSize(file.size)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onFileAction('download', file)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onFileAction('delete', file)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FilesTable;
