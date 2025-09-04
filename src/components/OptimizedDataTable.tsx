import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';
import { EmptyState } from './EmptyState';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

interface OptimizedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyIcon?: any;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  title?: string;
  actions?: React.ReactNode;
}

export function OptimizedDataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  onRowClick,
  searchPlaceholder = 'Search...',
  title,
  actions,
}: OptimizedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(item =>
        columns.some(column => {
          if (!column.searchable) return false;
          const value = item[column.key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection, columns]);

  const handleSort = (columnKey: keyof T) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading data..." />;
  }

  return (
    <Card className="card-modern">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedData.length === 0 ? (
          emptyIcon ? (
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{emptyTitle}</p>
              <p className="text-sm">{emptyDescription}</p>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid border-b border-border/50 pb-3 mb-4" style={{
                gridTemplateColumns: `repeat(${columns.length}, 1fr)`
              }}>
                {columns.map((column) => (
                  <div key={String(column.key)} className="px-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => column.sortable && handleSort(column.key)}
                      className={`h-auto p-0 font-semibold text-muted-foreground hover:text-foreground ${
                        column.sortable ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      disabled={!column.sortable}
                    >
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        sortDirection === 'asc' ? (
                          <SortAsc className="ml-1 h-3 w-3" />
                        ) : (
                          <SortDesc className="ml-1 h-3 w-3" />
                        )
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="space-y-2">
                {filteredAndSortedData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={`grid p-3 rounded-lg border border-border/20 transition-all duration-200 ${
                      onRowClick ? 'cursor-pointer hover:bg-accent/50 hover:shadow-md' : ''
                    }`}
                    style={{
                      gridTemplateColumns: `repeat(${columns.length}, 1fr)`
                    }}
                  >
                    {columns.map((column) => (
                      <div key={String(column.key)} className="px-3 flex items-center">
                        {column.render ? 
                          column.render(item[column.key], item) : 
                          String(item[column.key])
                        }
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}