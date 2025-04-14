
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogFooter, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileItem } from '@/lib/files';
import { createFileShare, ExpirationOption } from '@/lib/file-shares';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  userId: string;
}

const ShareFileModal: React.FC<ShareFileModalProps> = ({
  isOpen,
  onClose,
  file,
  userId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<ExpirationOption>('24h');

  const handleGenerateLink = async () => {
    if (!file) return;
    
    try {
      setIsLoading(true);
      const fileShare = await createFileShare(file.id, userId, expiration);
      
      if (fileShare) {
        const shareUrl = `${window.location.origin}/share/${fileShare.share_token}`;
        setShareLink(shareUrl);
        toast.success('Share link generated successfully');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(error => {
        console.error('Error copying link:', error);
        toast.error('Failed to copy link');
      });
  };

  const resetModal = () => {
    setShareLink(null);
    setExpiration('24h');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share File
          </DialogTitle>
          <DialogDescription>
            {file ? `Create a shareable link for "${file.name}"` : 'Create a shareable link'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expiration">Link expires after</Label>
            <Select
              value={expiration}
              onValueChange={(value) => setExpiration(value as ExpirationOption)}
              disabled={!!shareLink || isLoading}
            >
              <SelectTrigger id="expiration">
                <SelectValue placeholder="Select expiration time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="never">Never expires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shareLink && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="shareLink">Share link</Label>
              <div className="flex gap-2">
                <Input
                  id="shareLink"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink}>Copy</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view and download this file
                {expiration !== 'never' && ` for the next ${
                  expiration === '1h' ? 'hour' : 
                  expiration === '24h' ? 'day' : 
                  expiration === '7d' ? '7 days' : '30 days'
                }`}.
              </p>
            </div>
          )}
        </div>

        <Separator />
        
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={resetModal}>
            Close
          </Button>
          {!shareLink && (
            <Button 
              onClick={handleGenerateLink} 
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Link'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareFileModal;
