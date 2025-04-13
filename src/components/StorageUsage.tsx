
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';
import { CloudOff, Cloud } from 'lucide-react';

interface StorageUsageProps {
  usedBytes: number;
  totalBytes: number;
  isPremium: boolean;
  className?: string;
}

const StorageUsage: React.FC<StorageUsageProps> = ({ 
  usedBytes, 
  totalBytes, 
  isPremium,
  className 
}) => {
  const usedPercentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0;
  const isAlmostFull = usedPercentage > 80;
  const isFull = usedPercentage >= 100;

  // Format the storage values
  const usedFormatted = formatBytes(usedBytes);
  const totalFormatted = formatBytes(totalBytes);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Storage Usage</CardTitle>
          {isPremium ? (
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold px-2 py-1 rounded">
              PREMIUM
            </div>
          ) : (
            <div className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded">
              FREE
            </div>
          )}
        </div>
        <CardDescription>
          {isPremium 
            ? "Premium tier with expanded storage" 
            : "Free tier with limited storage"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>{usedFormatted} used</span>
              <span>{totalFormatted} total</span>
            </div>
            <Progress 
              value={usedPercentage} 
              className={`h-2 ${
                isFull ? 'bg-red-200' : isAlmostFull ? 'bg-amber-200' : 'bg-gray-200'
              }`}
              color={isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : undefined}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {isFull ? (
                <div className="flex items-center text-red-500">
                  <CloudOff className="h-4 w-4 mr-1" />
                  <span>Storage full</span>
                </div>
              ) : isAlmostFull ? (
                <div className="flex items-center text-amber-500">
                  <Cloud className="h-4 w-4 mr-1" />
                  <span>Almost full</span>
                </div>
              ) : (
                <div className="flex items-center text-green-500">
                  <Cloud className="h-4 w-4 mr-1" />
                  <span>{usedPercentage}% used</span>
                </div>
              )}
            </div>
            {!isPremium && usedPercentage > 70 && (
              <a 
                href="/pricing" 
                className="text-xs text-primary font-medium hover:underline"
              >
                Upgrade to Premium
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageUsage;
