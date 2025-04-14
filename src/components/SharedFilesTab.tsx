
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileShare, getUserFileShares, deleteFileShare, updateFileShareExpiration, ExpirationOption } from '@/lib/file-shares';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Copy, Trash2, Clock, RefreshCw } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface SharedFilesTabProps {
  userId: string;
}

const SharedFilesTab: React.FC<SharedFilesTabProps> = ({ userId }) => {
  const [shares, setShares] = useState<FileShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadShares();
  }, [userId]);

  const loadShares = async () => {
    setIsLoading(true);
    try {
      const fileShares = await getUserFileShares(userId);
      setShares(fileShares);
    } catch (error) {
      console.error('Error loading shares:', error);
      toast.error('Failed to load shared links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleDeleteShare = async (shareId: string) => {
    const success = await deleteFileShare(shareId);
    if (success) {
      setShares(shares.filter(share => share.id !== shareId));
      toast.success('Share link deleted');
    }
  };

  const handleExtendExpiration = async (shareId: string, expiration: ExpirationOption) => {
    const success = await updateFileShareExpiration(shareId, expiration);
    if (success) {
      await loadShares();
      toast.success('Share link expiration updated');
    }
  };

  const formatExpiration = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';
    
    const expiryDate = new Date(expiresAt);
    
    if (expiryDate < new Date()) {
      return 'Expired';
    }
    
    return `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 border-4 border-cloud border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
          <Share2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No shared links</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Share files to generate links that others can access
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Shared Files</h2>
        <Button size="sm" variant="outline" onClick={loadShares}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">File</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shares.map((share) => (
              <TableRow key={share.id}>
                <TableCell className="font-medium">
                  {share.files?.name || "Unknown file"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDistanceToNow(new Date(share.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatExpiration(share.expires_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyLink(share.share_token)}
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" title="Extend expiration">
                          <Clock className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExtendExpiration(share.id, '24h')}>
                          Extend to 24 hours
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExtendExpiration(share.id, '7d')}>
                          Extend to 7 days
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExtendExpiration(share.id, '30d')}>
                          Extend to 30 days
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExtendExpiration(share.id, 'never')}>
                          Never expire
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteShare(share.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete share"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SharedFilesTab;

// Missing Icon component
import { Share2 } from 'lucide-react';
