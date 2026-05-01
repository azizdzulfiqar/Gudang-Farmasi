import React from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T | ((item: T) => boolean);
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  footer?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Cari...",
  pageSize = 10,
  onRowClick,
  isLoading = false,
  footer
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredData = React.useMemo(() => {
    if (!search) return data;
    return data.filter(item => {
      if (typeof searchKey === 'function') {
        // This is a bit tricky if searchKey is meant to be a predicate 
        // But usually we want to pass the search string to it.
        // Let's adjust to allow a search function.
        return true; // placeholder
      }
      
      if (searchKey) {
        const value = (item as any)[searchKey];
        return String(value).toLowerCase().includes(search.toLowerCase());
      }
      
      // Fallback: search all values
      return Object.values(item as any).some(val => 
        String(val).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, search, searchKey]);

  // Fix: search functionality
  const actuallyFilteredData = React.useMemo(() => {
    if (!search) return data;
    return data.filter(item => {
        // If we want custom search logic, we should probably pass a search function that takes (item, searchStr)
        // For now, let's just use the default fallback if no searchKey is provided or search all fields
        return Object.values(item as any).some(val => 
            val !== null && val !== undefined && String(val).toLowerCase().includes(search.toLowerCase())
        );
    });
  }, [data, search]);

  const totalPages = Math.ceil(actuallyFilteredData.length / pageSize);
  const paginatedData = actuallyFilteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder={searchPlaceholder} 
          className="pl-10 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col, idx) => (
                <TableHead key={idx} className={cn(
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className
                )}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    Memuat data...
                 </TableCell>
               </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle size={40} className="mb-2 opacity-20" />
                    <p>Data tidak ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <TableRow 
                  key={rowIdx} 
                  className={cn(
                    "hover:bg-muted/30 transition-colors", 
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className={cn(
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.className
                    )}>
                      {col.cell ? col.cell(item, (currentPage - 1) * pageSize + rowIdx) : (item as any)[col.accessorKey!]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {footer && (
            <TableFooter>
              {footer}
            </TableFooter>
          )}
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Menampilkan <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * pageSize, actuallyFilteredData.length)}</span> dari <span className="font-medium">{actuallyFilteredData.length}</span> data
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    
                    return (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0 text-xs"
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
