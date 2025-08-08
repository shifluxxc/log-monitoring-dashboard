import React, { useCallback, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLog } from '@/context/LogContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Filter, X } from 'lucide-react';

const LOG_LEVELS = [
  { value: 'INFO', label: 'Info', color: 'info' },
  { value: 'WARN', label: 'Warning', color: 'warn' },
  { value: 'ERROR', label: 'Error', color: 'error' },
] as const;

export const FilterBar: React.FC = () => {
  const { state, dispatch } = useLog();
  const [searchInput, setSearchInput] = useState(state.filters.searchTerm);
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // Update search filter when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm !== state.filters.searchTerm) {
      dispatch({
        type: 'SET_FILTER',
        payload: { searchTerm: debouncedSearchTerm },
      });
    }
  }, [debouncedSearchTerm, state.filters.searchTerm, dispatch]);

  const handleLevelChange = useCallback((level: string, checked: boolean) => {
    const newLevels = checked
      ? [...state.filters.level, level]
      : state.filters.level.filter((l) => l !== level);
    
    dispatch({
      type: 'SET_FILTER',
      payload: { level: newLevels },
    });
  }, [state.filters.level, dispatch]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    dispatch({
      type: 'SET_FILTER',
      payload: { level: [], searchTerm: '' },
    });
  }, [dispatch]);

  const hasActiveFilters = state.filters.level.length > 0 || state.filters.searchTerm;

  return (
    <Card className="bg-dashboard-filter border-border rounded-none border-l-0 border-r-0">
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Level:</span>
            {LOG_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={level.value}
                  checked={state.filters.level.includes(level.value)}
                  onCheckedChange={(checked) => 
                    handleLevelChange(level.value, checked as boolean)
                  }
                />
                <label
                  htmlFor={level.value}
                  className="text-sm font-medium cursor-pointer"
                >
                  {level.label}
                </label>
              </div>
            ))}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Showing {state.filteredLogs.length.toLocaleString()} of {state.logs.length.toLocaleString()} logs
            </span>
            {state.filters.level.length > 0 && (
              <div className="flex items-center space-x-1">
                {state.filters.level.map((level) => {
                  const levelConfig = LOG_LEVELS.find(l => l.value === level);
                  return (
                    <Badge
                      key={level}
                      variant="secondary"
                      className={`text-xs ${
                        levelConfig?.color === 'info' ? 'bg-info/20 text-info' :
                        levelConfig?.color === 'warn' ? 'bg-warn/20 text-warn' :
                        levelConfig?.color === 'error' ? 'bg-error/20 text-error' : ''
                      }`}
                    >
                      {level}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};