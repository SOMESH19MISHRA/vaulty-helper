
import React, { useState, useEffect } from 'react';
import { Search, X, SortAsc, SortDesc, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { FileFilter, SortDirection, SortField } from '@/lib/files';
import { cn } from '@/lib/utils';

interface FileSearchProps {
  onFilterChange: (filters: FileFilter) => void;
  fileTypes: string[];
  className?: string;
}

const FileSearch: React.FC<FileSearchProps> = ({ 
  onFilterChange, 
  fileTypes,
  className
}) => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | undefined>(undefined);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({
        search,
        type,
        sortField,
        sortDirection
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [search, type, sortField, sortDirection, onFilterChange]);
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const clearFilters = () => {
    setSearch('');
    setType(undefined);
    setSortField('created_at');
    setSortDirection('desc');
    setFiltersOpen(false);
  };
  
  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (search) count++;
    if (type) count++;
    if (sortField !== 'created_at' || sortDirection !== 'desc') count++;
    return count;
  };
  
  return (
    <div className={cn("flex flex-col md:flex-row gap-2 w-full", className)}>
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-[68px]"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 w-7 p-0 opacity-70 hover:opacity-100"
            onClick={() => setSearch('')}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[11px] flex items-center justify-center text-primary-foreground">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-4" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">File Type</div>
              <Select 
                value={type} 
                onValueChange={setType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Any type</SelectItem>
                  {fileTypes.map(fileType => (
                    <SelectItem key={fileType} value={fileType}>
                      {fileType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm">Sort by</div>
              <div className="flex items-center gap-2">
                <Select
                  value={sortField}
                  onValueChange={(value) => setSortField(value as SortField)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created_at">Date</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSortDirection}
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FileSearch;
